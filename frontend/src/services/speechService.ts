class SpeechService {
  recognition: any = null;
  synthesis = window.speechSynthesis;
  isListening = false;
  private onResultCb: ((r: { final: string; interim: string }) => void) | null = null;
  private onInterruptCb: (() => void) | null = null;

  init(
    onResult: (r: { final: string; interim: string }) => void,
    onInterrupt: () => void
  ) {
    this.onResultCb = onResult;
    this.onInterruptCb = onInterrupt;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Web Speech API not supported in this browser");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";

    this.recognition.onresult = (event: any) => {
      let final = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      // Interrupt AI speech if user starts talking
      if (this.synthesis.speaking && (final || interim)) {
        this.stopSpeaking();
        this.onInterruptCb?.();
      }

      // Always call back — final goes to socket, interim shown in UI only
      this.onResultCb?.({ final: final.trim(), interim: interim.trim() });
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      // Auto-restart on non-fatal errors
      if (event.error === "no-speech" && this.isListening) {
        this.recognition.stop();
        setTimeout(() => this.recognition?.start(), 300);
      }
    };

    this.recognition.onend = () => {
      // Auto-restart if mic should still be on
      if (this.isListening) {
        setTimeout(() => this.recognition?.start(), 200);
      }
    };
  }

  start() {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      this.recognition.start();
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  speak(text: string) {
    // Strip markdown for cleaner TTS
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
}

export default new SpeechService();