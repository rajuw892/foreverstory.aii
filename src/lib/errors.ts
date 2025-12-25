// ========================================
// Error Handling Utilities
// ========================================

export class ForeverStoryError extends Error {
  public code: string;
  public statusCode: number;
  public isRetryable: boolean;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'ForeverStoryError';
    this.code = code;
    this.statusCode = statusCode;
    this.isRetryable = isRetryable;
  }
}

// Specific error types
export class UploadError extends ForeverStoryError {
  constructor(message: string, isRetryable: boolean = true) {
    super(message, 'UPLOAD_ERROR', 400, isRetryable);
    this.name = 'UploadError';
  }
}

export class RenderError extends ForeverStoryError {
  constructor(message: string, isRetryable: boolean = true) {
    super(message, 'RENDER_ERROR', 500, isRetryable);
    this.name = 'RenderError';
  }
}

export class ValidationError extends ForeverStoryError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400, false);
    this.name = 'ValidationError';
  }
}

export class PaymentError extends ForeverStoryError {
  constructor(message: string) {
    super(message, 'PAYMENT_ERROR', 402, false);
    this.name = 'PaymentError';
  }
}

export class NotFoundError extends ForeverStoryError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404, false);
    this.name = 'NotFoundError';
  }
}

// Error messages for user display
export const ERROR_MESSAGES: Record<string, string> = {
  UPLOAD_ERROR: "We couldn't upload your photos. Please try again.",
  RENDER_ERROR: "Oops! Something went wrong while creating your video. Let us try again...",
  VALIDATION_ERROR: "Please check your inputs and try again.",
  PAYMENT_ERROR: "There was an issue with the payment. Please try again.",
  NOT_FOUND: "We couldn't find what you're looking for.",
  NETWORK_ERROR: "Please check your internet connection and try again.",
  TIMEOUT_ERROR: "The request took too long. Please try again.",
  UNKNOWN_ERROR: "Something unexpected happened. Please try again later.",
};

// Error handler for API routes
export function handleApiError(error: unknown): {
  message: string;
  code: string;
  statusCode: number;
  isRetryable: boolean;
} {
  if (error instanceof ForeverStoryError) {
    return {
      message: ERROR_MESSAGES[error.code] || error.message,
      code: error.code,
      statusCode: error.statusCode,
      isRetryable: error.isRetryable,
    };
  }

  if (error instanceof Error) {
    // Log the actual error for debugging
    console.error('Unhandled error:', error);

    return {
      message: ERROR_MESSAGES.UNKNOWN_ERROR,
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
      isRetryable: true,
    };
  }

  return {
    message: ERROR_MESSAGES.UNKNOWN_ERROR,
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
    isRetryable: true,
  };
}

// Retry utility with exponential backoff
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if it's a non-retryable error
      if (error instanceof ForeverStoryError && !error.isRetryable) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

        if (onRetry) {
          onRetry(lastError, attempt + 1);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// Validate narration length (edge case handling)
export function trimNarration(text: string, maxWords: number = 500): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) {
    return text;
  }

  // Find a good breaking point (end of sentence)
  const trimmedWords = words.slice(0, maxWords);
  let result = trimmedWords.join(' ');

  // Try to end at a sentence
  const lastPeriod = result.lastIndexOf('.');
  const lastExclamation = result.lastIndexOf('!');
  const lastQuestion = result.lastIndexOf('?');

  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);

  if (lastSentenceEnd > result.length * 0.7) {
    result = result.substring(0, lastSentenceEnd + 1);
  }

  return result;
}

// Handle edge case: user uploads only 2 photos
export function expandPhotosIfNeeded(photos: string[], minPhotos: number = 6): string[] {
  if (photos.length >= minPhotos) {
    return photos;
  }

  const expanded: string[] = [...photos];
  let index = 0;

  while (expanded.length < minPhotos) {
    expanded.push(photos[index % photos.length]);
    index++;
  }

  return expanded;
}

// Generate default placeholder text for blank answers
export function getDefaultAnswer(field: string): string {
  const defaults: Record<string, string> = {
    coupleNames: "Two souls in love",
    howMet: "Their paths crossed in the most unexpected way, as if the universe had been waiting for this very moment.",
    firstDate: "That magical evening when nervous laughter turned into genuine connection, and strangers became something more.",
    iLoveYou: "Three words that changed everything, spoken from the heart in a moment that would be remembered forever.",
    insideJoke: "The little things that make their bond unique—secret smiles and shared laughter that only they understand.",
    adventure: "Together they discovered that the greatest adventures aren't about the destination, but who you're with.",
    futureDream: "A future painted in hopes and dreams, where every tomorrow is another page in their love story.",
  };

  return defaults[field] || "A beautiful moment in their journey together.";
}
