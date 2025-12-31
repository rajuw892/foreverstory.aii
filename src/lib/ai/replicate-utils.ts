// ========================================
// Replicate Utility Functions
// Handles rate limiting, retries, and delays
// ========================================

/**
 * Delay between requests to avoid rate limiting
 */
export async function delayBetweenRequests(ms: number = 2000): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a Replicate API call with exponential backoff
 * Handles 429 rate limit errors automatically
 */
export async function replicateWithRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 5,
    initialDelay = 10000, // 10 seconds
    maxDelay = 120000, // 2 minutes
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add small delay before each request (except first)
      if (attempt > 0) {
        await delayBetweenRequests(1000);
      }

      const result = await fn();
      return result;
    } catch (error: any) {
      lastError = error;

      // Check if it's a rate limit error (429)
      const is429 =
        error?.message?.includes('429') ||
        error?.message?.includes('Too Many Requests') ||
        error?.message?.includes('rate limit') ||
        error?.response?.status === 429;

      if (!is429 || attempt >= maxRetries) {
        // Not a rate limit error or out of retries
        throw error;
      }

      // Calculate exponential backoff delay
      const exponentialDelay = Math.min(
        initialDelay * Math.pow(2, attempt),
        maxDelay
      );

      // Check for Retry-After header
      let retryDelay = exponentialDelay;
      if (error?.response?.headers?.['retry-after']) {
        const retryAfter = parseInt(error.response.headers['retry-after'], 10);
        if (!isNaN(retryAfter)) {
          retryDelay = retryAfter * 1000; // Convert to ms
        }
      }

      console.warn(
        `[Replicate] Rate limited (429). Retry ${attempt + 1}/${maxRetries} after ${Math.round(retryDelay / 1000)}s...`
      );

      onRetry?.(attempt + 1, error);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError;
}

/**
 * Batch Replicate requests with delays to avoid rate limits
 */
export async function batchReplicateRequests<T>(
  requests: Array<() => Promise<T>>,
  options: {
    batchSize?: number;
    delayBetweenBatches?: number;
    delayBetweenRequests?: number;
  } = {}
): Promise<T[]> {
  const {
    batchSize = 2,
    delayBetweenBatches = 2000,
    delayBetweenRequests = 1000,
  } = options;

  const results: T[] = [];

  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);

    console.log(
      `[Replicate] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(requests.length / batchSize)}`
    );

    // Process batch in parallel
    const batchPromises = batch.map(async (request, index) => {
      // Add stagger delay within batch
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests * index));
      }
      return request();
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Delay between batches (except after last batch)
    if (i + batchSize < requests.length) {
      console.log(`[Replicate] Waiting ${delayBetweenBatches}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return results;
}
