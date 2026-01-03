import { Injectable, signal, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

/**
 * Speech recognition result from the Web Speech API.
 */
export interface SpeechResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

/**
 * Speech service error types.
 */
export type SpeechErrorType = 
  | 'not-supported'
  | 'permission-denied'
  | 'no-speech'
  | 'audio-capture'
  | 'network'
  | 'aborted'
  | 'unknown';

/**
 * Speech service error.
 */
export interface SpeechError {
  type: SpeechErrorType;
  message: string;
}

/**
 * Web Speech API type definitions.
 * These are not included in TypeScript's lib.dom.d.ts by default.
 */
interface ISpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): ISpeechRecognitionAlternative;
  [index: number]: ISpeechRecognitionAlternative;
}

interface ISpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface ISpeechRecognitionResultList {
  readonly length: number;
  item(index: number): ISpeechRecognitionResult;
  [index: number]: ISpeechRecognitionResult;
}

interface ISpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: ISpeechRecognitionResultList;
}

interface ISpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

/**
 * Browser-agnostic SpeechRecognition type.
 * Handles webkit prefix for Chrome/Safari.
 */
declare global {
  interface Window {
    SpeechRecognition: ISpeechRecognitionConstructor;
    webkitSpeechRecognition: ISpeechRecognitionConstructor;
  }
}

/**
 * Service for Speech-to-Text (STT) and Text-to-Speech (TTS) functionality.
 * Uses the Web Speech API which is free and built into modern browsers.
 * 
 * Browser Support:
 * - Chrome/Edge: Full STT + TTS support
 * - Firefox: TTS only (STT experimental)
 * - Safari: Limited TTS, STT on iOS only
 */
@Injectable({
  providedIn: 'root'
})
export class SpeechService implements OnDestroy {
  // Speech Recognition (STT)
  private recognition: ISpeechRecognition | null = null;
  private recognitionSubject = new Subject<SpeechResult>();
  private errorSubject = new Subject<SpeechError>();
  
  // Speech Synthesis (TTS)
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  
  // State signals
  readonly isListening = signal(false);
  readonly isSpeaking = signal(false);
  readonly isSTTSupported = signal(false);
  readonly isTTSSupported = signal(false);
  
  // Available voices signal (exposed to UI)
  readonly availableVoices = signal<SpeechSynthesisVoice[]>([]);
  readonly currentVoiceName = signal<string>('');
  
  // TTS Settings
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private speechRate = 1.0;
  private speechPitch = 1.0;
  private speechVolume = 1.0;
  
  // LocalStorage key for voice preference
  private readonly VOICE_STORAGE_KEY = 'bonzi_selectedVoice';

  /** Observable for speech recognition results */
  readonly transcript$ = this.recognitionSubject.asObservable();
  
  /** Observable for speech errors */
  readonly error$ = this.errorSubject.asObservable();

  constructor(private localStorageService: LocalStorageService) {
    this.initializeSpeechAPIs();
  }

  /**
   * Initialize Web Speech APIs and check browser support.
   */
  private initializeSpeechAPIs(): void {
    // Check STT support (SpeechRecognition)
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      this.isSTTSupported.set(true);
      this.recognition = new SpeechRecognitionAPI();
      this.configureRecognition();
    } else {
      console.warn('Speech Recognition API not supported in this browser');
    }

    // Check TTS support (SpeechSynthesis)
    if ('speechSynthesis' in window) {
      this.isTTSSupported.set(true);
      this.synthesis = window.speechSynthesis;
      
      // Load voices (may be async in some browsers)
      this.loadVoices();
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoices();
      }
    } else {
      console.warn('Speech Synthesis API not supported in this browser');
    }
  }

  /**
   * Configure speech recognition settings.
   */
  private configureRecognition(): void {
    if (!this.recognition) return;

    // Recognition settings
    this.recognition.continuous = true; // User controls when to stop by clicking mic again
    this.recognition.interimResults = true; // Show live results
    this.recognition.lang = 'en-US'; // Default language
    this.recognition.maxAlternatives = 1;

    // Event handlers
    this.recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      const transcript = result[0].transcript;
      const isFinal = result.isFinal;
      const confidence = result[0].confidence;

      this.recognitionSubject.next({ transcript, isFinal, confidence });
    };

    this.recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      const errorType = this.mapSpeechError(event.error);
      this.errorSubject.next({
        type: errorType,
        message: this.getErrorMessage(errorType)
      });
      this.isListening.set(false);
    };

    this.recognition.onend = () => {
      this.isListening.set(false);
    };

    this.recognition.onstart = () => {
      this.isListening.set(true);
    };
  }

  /**
   * Map Web Speech API error codes to our error types.
   */
  private mapSpeechError(error: string): SpeechErrorType {
    switch (error) {
      case 'not-allowed':
        return 'permission-denied';
      case 'no-speech':
        return 'no-speech';
      case 'audio-capture':
        return 'audio-capture';
      case 'network':
        return 'network';
      case 'aborted':
        return 'aborted';
      default:
        return 'unknown';
    }
  }

  /**
   * Get user-friendly error message.
   */
  private getErrorMessage(type: SpeechErrorType): string {
    switch (type) {
      case 'not-supported':
        return 'Speech recognition is not supported in your browser. Try Chrome or Edge.';
      case 'permission-denied':
        return 'Microphone access was denied. Please allow microphone access to use voice input.';
      case 'no-speech':
        return 'No speech was detected. Please try again.';
      case 'audio-capture':
        return 'No microphone was found. Please check your audio settings.';
      case 'network':
        return 'Network error occurred. Please check your connection.';
      case 'aborted':
        return 'Speech recognition was aborted.';
      default:
        return 'An error occurred with speech recognition.';
    }
  }

  /**
   * Load available TTS voices.
   * Prioritizes Philippine English for correct currency reading.
   */
  private loadVoices(): void {
    if (!this.synthesis) return;

    const voices = this.synthesis.getVoices();
    if (voices.length > 0) {
      // Update available voices signal
      this.availableVoices.set(voices);

      // Check for saved voice preference
      // Try user-scoped storage first, fall back to direct localStorage
      let savedVoiceName: string | null = null;
      
      if (this.localStorageService.getUserId() !== null) {
        // User is logged in - use user-scoped storage
        savedVoiceName = this.localStorageService.getItem<string>(this.VOICE_STORAGE_KEY);
      } else {
        // User not logged in yet - check direct localStorage as fallback
        savedVoiceName = localStorage.getItem(this.VOICE_STORAGE_KEY);
      }

      if (savedVoiceName) {
        const savedVoice = voices.find(v => v.name === savedVoiceName);
        if (savedVoice) {
          this.selectedVoice = savedVoice;
          this.currentVoiceName.set(savedVoice.name);
          return;
        }
      }

      // Default: Prefer Philippine English voices for correct peso reading
      // Priority: en-PH > fil-PH > Google English > Local English > Any English
      const preferredVoice = voices.find(v =>
        v.lang === 'en-PH'
      ) || voices.find(v =>
        v.lang === 'fil-PH'
      ) || voices.find(v =>
        v.lang.startsWith('en') && v.name.includes('Google')
      ) || voices.find(v =>
        v.lang.startsWith('en') && v.localService
      ) || voices.find(v =>
        v.lang.startsWith('en')
      ) || voices[0];

      this.selectedVoice = preferredVoice;
      this.currentVoiceName.set(preferredVoice.name);
    }
  }

  // ==================== STT Methods ====================

  /**
   * Start listening for speech input.
   * @returns Observable that emits speech results
   */
  startListening(): Observable<SpeechResult> {
    if (!this.recognition) {
      this.errorSubject.next({
        type: 'not-supported',
        message: this.getErrorMessage('not-supported')
      });
      return this.transcript$;
    }

    if (this.isListening()) {
      return this.transcript$;
    }

    try {
      this.recognition.start();
    } catch (error) {
      // Handle case where recognition is already started
      console.warn('Recognition already started:', error);
    }

    return this.transcript$;
  }

  /**
   * Stop listening for speech input.
   */
  stopListening(): void {
    if (this.recognition && this.isListening()) {
      this.recognition.stop();
    }
  }

  /**
   * Toggle speech recognition on/off.
   * @returns Current listening state after toggle
   */
  toggleListening(): boolean {
    if (this.isListening()) {
      this.stopListening();
    } else {
      this.startListening();
    }
    return this.isListening();
  }

  /**
   * Set the language for speech recognition.
   * @param lang BCP-47 language tag (e.g., 'en-US', 'es-ES', 'fil-PH')
   */
  setLanguage(lang: string): void {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  // ==================== TTS Methods ====================

  /**
   * Speak the given text aloud.
   * @param text Text to speak
   * @param options Optional TTS settings
   */
  speak(text: string, options?: { rate?: number; pitch?: number; volume?: number }): void {
    if (!this.synthesis) {
      console.warn('Text-to-speech not supported');
      return;
    }

    // Cancel any ongoing speech
    this.stopSpeaking();

    // Clean the text (remove markdown, HTML, etc.)
    const cleanText = this.cleanTextForSpeech(text);
    if (!cleanText.trim()) return;

    // Create utterance
    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    
    // Apply settings
    if (this.selectedVoice) {
      this.currentUtterance.voice = this.selectedVoice;
    }
    this.currentUtterance.rate = options?.rate ?? this.speechRate;
    this.currentUtterance.pitch = options?.pitch ?? this.speechPitch;
    this.currentUtterance.volume = options?.volume ?? this.speechVolume;

    // Event handlers
    this.currentUtterance.onstart = () => {
      this.isSpeaking.set(true);
    };

    this.currentUtterance.onend = () => {
      this.isSpeaking.set(false);
      this.currentUtterance = null;
    };

    this.currentUtterance.onerror = (event) => {
      console.error('TTS Error:', event.error);
      this.isSpeaking.set(false);
      this.currentUtterance = null;
    };

    // Speak
    this.synthesis.speak(this.currentUtterance);
  }

  /**
   * Stop speaking.
   */
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking.set(false);
      this.currentUtterance = null;
    }
  }

  /**
   * Toggle speaking on/off for given text.
   * @param text Text to speak (only used when starting)
   */
  toggleSpeaking(text: string): void {
    if (this.isSpeaking()) {
      this.stopSpeaking();
    } else {
      this.speak(text);
    }
  }

  /**
   * Get available TTS voices.
   * @returns Array of available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  /**
   * Set voice for TTS.
   * @param voice Voice to use
   * @param persist Whether to save to localStorage (default: true)
   */
  setVoice(voice: SpeechSynthesisVoice, persist = true): void {
    this.selectedVoice = voice;
    this.currentVoiceName.set(voice.name);

    if (persist) {
      // Try user-scoped storage first, fall back to direct localStorage
      if (this.localStorageService.getUserId() !== null) {
        this.localStorageService.setItem(this.VOICE_STORAGE_KEY, voice.name);
      } else {
        // User not logged in yet - use direct localStorage
        localStorage.setItem(this.VOICE_STORAGE_KEY, voice.name);
      }
    }
  }

  /**
   * Set voice by name.
   * @param voiceName Name of the voice to use
   * @returns true if voice was found and set, false otherwise
   */
  setVoiceByName(voiceName: string): boolean {
    const voice = this.availableVoices().find(v => v.name === voiceName);
    if (voice) {
      this.setVoice(voice);
      return true;
    }
    return false;
  }

  /**
   * Get the currently selected voice.
   */
  getSelectedVoice(): SpeechSynthesisVoice | null {
    return this.selectedVoice;
  }

  /**
   * Set TTS speech rate.
   * @param rate Rate from 0.1 to 10 (1 is normal)
   */
  setRate(rate: number): void {
    this.speechRate = Math.max(0.1, Math.min(10, rate));
  }

  /**
   * Set TTS pitch.
   * @param pitch Pitch from 0 to 2 (1 is normal)
   */
  setPitch(pitch: number): void {
    this.speechPitch = Math.max(0, Math.min(2, pitch));
  }

  /**
   * Set TTS volume.
   * @param volume Volume from 0 to 1
   */
  setVolume(volume: number): void {
    this.speechVolume = Math.max(0, Math.min(1, volume));
  }

  // ==================== Utility Methods ====================

  /**
   * Clean text for speech synthesis.
   * Removes markdown, HTML, URLs, emojis, and other non-speech content.
   */
  private cleanTextForSpeech(text: string): string {
    return text
      // Remove emojis (comprehensive Unicode ranges)
      // Emoticons: 😀-🙏 (U+1F600-U+1F64F)
      // Symbols & Pictographs: 🌀-🗿 (U+1F300-U+1F5FF)
      // Transport & Map: 🚀-🛿 (U+1F680-U+1F6FF)
      // Supplemental Symbols: 🤀-🧿 (U+1F900-U+1F9FF)
      // Misc Symbols: ☀-⛿ (U+2600-U+26FF)
      // Dingbats: ✀-➿ (U+2700-U+27BF)
      // Misc Symbols and Arrows: ⬀-⮿ (U+2B00-U+2BFF)
      // Additional Emoticons: 🥀-🥶 (U+1F940-U+1F976)
      // Flags: 🇦-🇿 (U+1F1E6-U+1F1FF)
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}]/gu, '')
      // Remove markdown code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`[^`]+`/g, '')
      // Remove markdown links, keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown bold/italic
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove markdown headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, '')
      // Remove HTML tags
      .replace(/<[^>]+>/g, '')
      // Remove special characters that sound awkward
      .replace(/[*#_~`]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Check if browser supports both STT and TTS.
   */
  isFullySupported(): boolean {
    return this.isSTTSupported() && this.isTTSSupported();
  }

  /**
   * Get browser support status as a descriptive string.
   */
  getSupportStatus(): string {
    if (this.isFullySupported()) {
      return 'full';
    } else if (this.isTTSSupported()) {
      return 'tts-only';
    } else if (this.isSTTSupported()) {
      return 'stt-only';
    }
    return 'none';
  }

  /**
   * Reload voices and reapply current user's voice preference.
   * Call this when user logs in to load their saved voice.
   */
  reloadVoices(): void {
    this.loadVoices();
  }

  /**
   * Cleanup on service destroy.
   */
  ngOnDestroy(): void {
    this.stopListening();
    this.stopSpeaking();
    this.recognitionSubject.complete();
    this.errorSubject.complete();
  }
}
