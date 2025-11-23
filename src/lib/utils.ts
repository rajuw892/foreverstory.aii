import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function generateAnonymousId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function getAnonymousId(): string {
  if (typeof window === 'undefined') return generateAnonymousId();

  let id = localStorage.getItem('foreverstory_anonymous_id');
  if (!id) {
    id = generateAnonymousId();
    localStorage.setItem('foreverstory_anonymous_id', id);
  }
  return id;
}

export function detectLanguage(text: string): string {
  // Simple language detection based on character patterns
  const patterns: Record<string, RegExp> = {
    hi: /[\u0900-\u097F]/, // Hindi (Devanagari)
    ar: /[\u0600-\u06FF]/, // Arabic
    ko: /[\uAC00-\uD7AF]/, // Korean
    bn: /[\u0980-\u09FF]/, // Bengali
    vi: /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i, // Vietnamese
    de: /[äöüßÄÖÜ]/, // German
    fr: /[àâçéèêëïîôùûüÿœæ]/i, // French
    es: /[áéíóúüñ¿¡]/i, // Spanish
    pt: /[àáâãçéêíóôõú]/i, // Portuguese
    tr: /[çğıöşü]/i, // Turkish
    id: /\b(dan|yang|di|untuk|dengan|tidak|ini|itu|dari|ke)\b/i, // Indonesian common words
  };

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return lang;
    }
  }

  return 'en'; // Default to English
}

export function getProgressPercentage(status: string): number {
  const progressMap: Record<string, number> = {
    queued: 5,
    processing_script: 15,
    generating_characters: 30,
    creating_scenes: 50,
    generating_video: 70,
    adding_voice: 85,
    compiling: 95,
    completed: 100,
    failed: 0,
  };
  return progressMap[status] || 0;
}

export function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    queued: 'Preparing your love story...',
    processing_script: 'Writing your magical story...',
    generating_characters: 'Creating your characters...',
    creating_scenes: 'Drawing beautiful scenes...',
    generating_video: 'Bringing scenes to life...',
    adding_voice: 'Adding emotional narration...',
    compiling: 'Final magical touches...',
    completed: 'Your story is ready!',
    failed: 'Something went wrong...',
  };
  return messages[status] || 'Processing...';
}

export function formatCurrency(amount: number, currency: string = 'usd'): string {
  const formatter = new Intl.NumberFormat(currency === 'inr' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });
  return formatter.format(amount / 100);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
