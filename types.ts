

export interface Character {
  id: string;
  name: string;
  icon: string;
  title: string;
  description: string;
  systemInstruction: string;
  welcomeMessage: string;
  color: string;
  gradient: string;
}

export interface ChatMessage {
  id:string;
  sender: 'user' | 'ai';
  text: string;
  imageUrl?: string;
  character?: Character;
  isStreaming?: boolean;
  status?: 'failed';
}

export interface Mood {
  id: string;
  name: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface SavedChat {
  id: string;
  savedAt: string; // ISO string date
  character: Character;
  chatHistory: ChatMessage[];
  summary: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export type Screen = 'welcome' | 'selection' | 'moodCheckin' | 'chat';
export type View = 'aiChat' | 'community' | 'journal' | 'profile' | 'settings';


// Add type definitions for Web Speech API to fix TypeScript errors.
// This API is not part of the standard DOM typings and is browser-specific.
export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  // Fix: Add missing resultIndex property according to Web Speech API spec.
  resultIndex: number;
}

export interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

export interface SpeechRecognitionResult {
  [index: number]: { transcript: string };
  length: number;
  // Fix: Add missing isFinal property according to Web Speech API spec.
  isFinal: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}