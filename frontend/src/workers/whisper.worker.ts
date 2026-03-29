// frontend/src/workers/whisper.worker.ts
// Runs entirely in a Web Worker — Whisper WASM never blocks the UI thread.
// The tiny.en model is ~40MB and downloads once, then cached by the browser.

import { pipeline, env } from "@huggingface/transformers";

// Force WASM/CPU backend — WebGPU is not available in most browsers yet
// and causes "No available adapters" crash. WASM works everywhere.
env.allowLocalModels = false;
if (env.backends.onnx?.wasm) {
  env.backends.onnx.wasm.proxy = false;
}

// Whisper hallucination patterns — output for silence, noise, or non-speech.
// Must be filtered before sending to the agent or they trigger greeting repeats.
const HALLUCINATION_PATTERNS = [
  /^\[.*\]$/, // [BLANK_AUDIO], [INAUDIBLE], [speaking in foreign language], etc.
  /^\(.*\)$/, // (inaudible), (silence)
  /^thank you\.?$/i,
  /^you$/i,
  /^\.+$/,
  /^[\s\.,!?]+$/, // only punctuation/whitespace
];

function isHallucination(text: string): boolean {
  const t = text.trim();
  if (t.length < 3) return true;
  return HALLUCINATION_PATTERNS.some((re) => re.test(t));
}

type TranscriberPipeline = Awaited<ReturnType<typeof pipeline>>;
let transcriber: TranscriberPipeline | null = null;

async function loadModel(model: string) {
  self.postMessage({ type: "loading", message: "Downloading Whisper model (~40MB, first run only)..." });

  transcriber = await pipeline(
    "automatic-speech-recognition",
    model,
    {
      device: "wasm", // explicitly use WASM — avoids WebGPU "No available adapters"
      progress_callback: (p: { status: string; progress?: number }) => {
        if (p.status === "progress" && p.progress != null) {
          self.postMessage({
            type: "loading",
            message: `Loading model... ${Math.round(p.progress)}%`,
          });
        }
      },
    }
  );

  self.postMessage({ type: "ready" });
}

async function transcribe(audioData: Float32Array) {
  if (!transcriber) {
    self.postMessage({ type: "error", message: "Model not loaded yet" });
    return;
  }

  try {
    const result = await (transcriber as any)(audioData, {
      chunk_length_s: 10,
      stride_length_s: 1,
    });

    const text: string = Array.isArray(result)
      ? result.map((r: any) => r.text).join(" ").trim()
      : (result as any).text?.trim() ?? "";

    // Drop hallucinations — never send them to the agent
    if (!text || isHallucination(text)) {
      console.log("[Whisper] Filtered hallucination:", JSON.stringify(text));
      return;
    }

    self.postMessage({ type: "transcript", text });
  } catch (err: any) {
    self.postMessage({ type: "error", message: err?.message ?? "Transcription failed" });
  }
}

// Message router
self.addEventListener("message", async (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case "load":
      await loadModel(payload?.model ?? "Xenova/whisper-tiny.en");
      break;
    case "transcribe":
      await transcribe(payload.audio);
      break;
  }
});