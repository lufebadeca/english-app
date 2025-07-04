export class AudioManager {
  private static instance: AudioManager;
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  private constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private loadVoices(): void {
    const updateVoices = () => {
      this.voices = this.synth
        .getVoices()
        .filter(
          (voice) => voice.lang.startsWith("en") || voice.lang.startsWith("es")
        );
    };

    updateVoices();

    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = updateVoices;
    }
  }

  speakWord(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      volume?: number;
      lang?: string;
      name?: string;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error("Speech synthesis not supported"));
        return;
      }

      console.log(this.voices);
      console.log(text);
      console.log("recibo deopts: " + options.lang + " " + options.name);

      const utterance = new SpeechSynthesisUtterance(text);
      const lang = options.lang || "en-US";
      const name = options.name || "Google US English";

      // Buscar cualquier voz que empiece por 'en' o 'es', etc.
      const langPrefix = lang.slice(0, 2).toLowerCase();

      console.log("recibo: " + lang + " " + name);
      const preferredVoice = this.voices.find(
        (voice) =>
          //voice.lang.toLowerCase().startsWith(langPrefix)
          voice.lang === lang && voice.name === name
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      } else {
        utterance.lang = lang; // al menos indicamos el idioma
        console.warn(
          `⚠️ No se encontró voz para el idioma "${lang}". Usando voz por defecto.`
        );
      }
      alert(`${utterance.voice?.name} (${utterance.voice?.lang})`);
      utterance.rate = options.rate || 0.8;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event);

      this.synth.speak(utterance);
    });
  }

  speakSentence(text: string): Promise<void> {
    return this.speakWord(text, { rate: 0.7 });
  }

  stopSpeaking(): void {
    this.synth.cancel();
  }
}

export const audioManager = AudioManager.getInstance();
