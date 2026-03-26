class SpeechService {
  recognition: any = null;
  synthesis = window.speechSynthesis;
  isListening = false;

  init(onResult: any, onInterrupt: any) {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech not supported");
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

      // 🔥 interrupt AI
      if (this.synthesis.speaking && (final || interim)) {
        this.stopSpeaking();
        onInterrupt();
      }

      onResult({ final, interim });
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
    this.synthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;

    this.synthesis.speak(utter);
  }

  stopSpeaking() {
    this.synthesis.cancel();
  }
}

export default new SpeechService();