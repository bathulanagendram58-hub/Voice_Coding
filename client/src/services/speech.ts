// Web Speech API interfaces
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class VoiceRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private silenceTimer: any = null;
  private hasSubmittedCurrentTurn = false;
  private latestTranscript = '';

  constructor() {
    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public start({
    onStart,
    onInterimResult,
    onFinalAutoSubmit,
    onError,
    onEnd,
  }: {
    onStart?: () => void;
    onInterimResult?: (transcript: string) => void;
    onFinalAutoSubmit: (finalText: string) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
  }) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Reset turn flags
    this.hasSubmittedCurrentTurn = false;
    this.latestTranscript = '';
    if (this.silenceTimer) clearTimeout(this.silenceTimer);

    if (this.isListening) {
      this.stop();
    }

    const triggerAutoSubmit = (text: string) => {
      const clean = text.trim();
      if (!this.hasSubmittedCurrentTurn && clean.length > 0) {
        this.hasSubmittedCurrentTurn = true;
        this.stop();
        onFinalAutoSubmit(clean);
      }
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      this.hasSubmittedCurrentTurn = false;
      if (onStart) onStart();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const text = item[0].transcript;
        if (item.isFinal) {
          finalStr += text;
        } else {
          interim += text;
        }
      }

      const activeText = (finalStr || interim).trim();
      if (activeText) {
        this.latestTranscript = activeText;
        if (onInterimResult) onInterimResult(activeText);
      }

      // If browser reported final transcript segment
      if (finalStr && finalStr.trim()) {
        triggerAutoSubmit(finalStr);
        return;
      }

      // Automatic silence debounce: If user stops speaking for 1.4s, auto-commit
      if (this.silenceTimer) clearTimeout(this.silenceTimer);
      if (activeText.length > 2) {
        this.silenceTimer = setTimeout(() => {
          if (this.isListening && !this.hasSubmittedCurrentTurn && this.latestTranscript) {
            triggerAutoSubmit(this.latestTranscript);
          }
        }, 1400);
      }
    };

    this.recognition.onspeechend = () => {
      // Speech ended: if we have a transcript and haven't submitted yet, submit immediately
      if (this.silenceTimer) clearTimeout(this.silenceTimer);
      if (this.latestTranscript && !this.hasSubmittedCurrentTurn) {
        triggerAutoSubmit(this.latestTranscript);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      if (this.silenceTimer) clearTimeout(this.silenceTimer);

      let errorMsg = 'Voice recognition failed. Please try again or type your question.';
      if (event.error === 'not-allowed') {
        errorMsg = 'Microphone access is required for voice input. Please allow microphone permission and try again.';
      } else if (event.error === 'no-speech') {
        // If we captured some words before no-speech, use them
        if (this.latestTranscript && !this.hasSubmittedCurrentTurn) {
          triggerAutoSubmit(this.latestTranscript);
          return;
        }
        errorMsg = "I didn't hear anything. Please click the mic and try speaking again.";
      } else if (event.error === 'network') {
        errorMsg = 'Network error during speech recognition. Please check your connection.';
      }

      if (onError) onError(errorMsg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.silenceTimer) clearTimeout(this.silenceTimer);

      // If finished and we have a transcript that hasn't been submitted
      if (this.latestTranscript && !this.hasSubmittedCurrentTurn) {
        triggerAutoSubmit(this.latestTranscript);
      }
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (err: any) {
      this.isListening = false;
      if (onError) onError(err.message || 'Could not start microphone.');
    }
  }

  public stop() {
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }

  public cancel() {
    this.hasSubmittedCurrentTurn = true; // prevent late submit
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch {}
      this.isListening = false;
    }
  }
}

export const voiceRecognition = new VoiceRecognitionService();

// Text to Speech (Audio voice assistant explanation reader)
export class VoiceSpeakerService {
  private isSpeaking = false;

  public speak(text: string, rate: number = 1.0, onFinish?: () => void) {
    if (!('speechSynthesis' in window)) return;

    this.stop();

    const cleanText = text
      .replace(/```[\s\S]*?```/g, '') // strip code blocks
      .replace(/[#*`_]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = Math.max(0.7, Math.min(rate, 1.4));
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onFinish) onFinish();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onFinish) onFinish();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const voiceSpeaker = new VoiceSpeakerService();
