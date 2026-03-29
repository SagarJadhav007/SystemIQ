// frontend/src/services/speechService.ts
// Drop-in replacement for the Web Speech API version.
// Uses Whisper (tiny.en, ~40MB) running locally in a Web Worker via WASM.
// Zero network dependency after first model download. No API key. Free forever.
//
// How it works:
//   1. MediaRecorder captures mic audio in 3-second chunks
//   2. Each chunk → AudioContext → resampled to Float32Array @ 16kHz
//   3. Float32Array posted to Whisper Web Worker
//   4. Worker returns transcript text
//   5. Same onResult / socket.emit flow as before — nothing else changes

class SpeechService {
  // ── State ────────────────────────────────────────────────────────────────
  isListening = false;
  synthesis = window.speechSynthesis;

  private worker: Worker | null = null;
  private workerReady = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioCtx: AudioContext | null = null;
  private chunks: Blob[] = [];

  private onResultCb: ((r: { final: string; interim: string }) => void) | null = null;
  private onInterruptCb: (() => void) | null = null;
  private onStatusCb: ((msg: string) => void) | null = null;

  // How long each recording chunk is before we send it to Whisper (ms).
  // 3s is a good balance — short enough to feel responsive, long enough for
  // Whisper to have enough audio context for accuracy.
  private CHUNK_MS = 3000;

  // ── Init ─────────────────────────────────────────────────────────────────
  init(
    onResult: (r: { final: string; interim: string }) => void,
    onInterrupt: () => void,
    onStatus?: (msg: string) => void
  ) {
    this.onResultCb = onResult;
    this.onInterruptCb = onInterrupt;
    this.onStatusCb = onStatus ?? null;

    this.initWorker();
  }

  private initWorker() {
    // Vite handles ?worker imports automatically — no config needed
    this.worker = new Worker(
      new URL("../workers/whisper.worker.ts", import.meta.url),
      { type: "module" }
    );

    this.worker.onmessage = (e: MessageEvent) => {
      const { type, text, message } = e.data;

      switch (type) {
        case "loading":
          console.log("[Whisper]", message);
          this.onStatusCb?.(message);
          break;

        case "ready":
          console.log("[Whisper] Model ready");
          this.workerReady = true;
          this.onStatusCb?.("ready");
          break;

        case "transcript": {
          const trimmed = text?.trim();
          if (!trimmed || trimmed.length < 2) break;

          // Interrupt TTS if user starts speaking
          if (this.synthesis.speaking) {
            this.synthesis.cancel();
            this.onInterruptCb?.();
          }

          // Final transcript — same contract as Web Speech API version
          this.onResultCb?.({ final: trimmed, interim: "" });
          break;
        }

        case "error":
          console.error("[Whisper Worker error]", message);
          break;
      }
    };

    this.worker.onerror = (err) => {
      console.error("[Whisper Worker crashed]", err);
    };

    // Start loading the model immediately so it's ready when user hits mic
    this.worker.postMessage({
      type: "load",
      payload: { model: "Xenova/whisper-tiny.en" },
    });
  }

  // ── Start recording ──────────────────────────────────────────────────────
  async start() {
    if (this.isListening) return;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error("[SpeechService] Mic access denied:", err);
      this.onStatusCb?.("mic_denied");
      return;
    }

    this.isListening = true;
    this.audioCtx = new AudioContext({ sampleRate: 16000 });
    this.chunks = [];

    // Pick a supported MIME type
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    this.mediaRecorder = new MediaRecorder(stream, { mimeType });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };

    // Every CHUNK_MS, flush the current chunk to Whisper
    this.mediaRecorder.onstop = async () => {
      const blob = new Blob(this.chunks, { type: mimeType });
      this.chunks = [];

      // Only transcribe if we have real audio
      if (blob.size < 1000) return;

      try {
        const float32 = await this.blobToFloat32(blob);
        if (this.workerReady && this.worker) {
          this.worker.postMessage(
            { type: "transcribe", payload: { audio: float32 } },
            [float32.buffer] // transfer ownership for zero-copy
          );
        }
      } catch (err) {
        console.error("[SpeechService] Audio conversion error:", err);
      }

      // If still listening, restart recording for next chunk
      if (this.isListening && this.mediaRecorder) {
        this.chunks = [];
        this.mediaRecorder.start();
        setTimeout(() => {
          if (this.isListening && this.mediaRecorder?.state === "recording") {
            this.mediaRecorder.stop();
          }
        }, this.CHUNK_MS);
      }
    };

    // Start first chunk
    this.mediaRecorder.start();
    setTimeout(() => {
      if (this.isListening && this.mediaRecorder?.state === "recording") {
        this.mediaRecorder.stop();
      }
    }, this.CHUNK_MS);
  }

  // ── Stop recording ───────────────────────────────────────────────────────
  stop() {
    this.isListening = false;

    if (this.mediaRecorder?.state !== "inactive") {
      this.mediaRecorder?.stop();
    }

    // Stop all mic tracks to release the browser mic indicator
    if (this.mediaRecorder) {
      (this.mediaRecorder as any).stream?.getTracks?.()?.forEach((t: MediaStreamTrack) => t.stop());
    }

    this.mediaRecorder = null;
    this.chunks = [];

    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }

  // ── TTS (unchanged) ──────────────────────────────────────────────────────
  speak(text: string) {
    const clean = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/#{1,6}\s/g, "")
      .replace(/✅|❌|⚠️|🔴|🎤/g, "")
      .trim();

    this.synthesis.cancel();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 0.93;
    utter.pitch = 1;
    utter.volume = 1;
    this.synthesis.speak(utter);
  }

  stopSpeaking() {
    this.synthesis.cancel();
  }

  get isModelReady() {
    return this.workerReady;
  }

  // ── Audio conversion ─────────────────────────────────────────────────────
  // Decode the recorded blob → mono Float32Array @ 16kHz (what Whisper needs)
  private async blobToFloat32(blob: Blob): Promise<Float32Array> {
    const arrayBuffer = await blob.arrayBuffer();

    // Use a temporary AudioContext for decoding (not the live one which may be closed)
    const decodeCtx = new AudioContext({ sampleRate: 16000 });
    let audioBuffer: AudioBuffer;

    try {
      audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer);
    } finally {
      decodeCtx.close();
    }

    // Mix down to mono
    const channelData = audioBuffer.getChannelData(0);
    return new Float32Array(channelData);
  }
}

export default new SpeechService();