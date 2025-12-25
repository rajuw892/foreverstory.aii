// ========================================
// SSML Utilities for Edge-TTS
// Add emotional pauses and emphasis to narration
// ========================================

export interface SSMLOptions {
  rate?: 'x-slow' | 'slow' | 'medium' | 'fast' | 'x-fast' | string;
  pitch?: 'x-low' | 'low' | 'medium' | 'high' | 'x-high' | string;
  volume?: 'silent' | 'x-soft' | 'soft' | 'medium' | 'loud' | 'x-loud' | string;
}

/**
 * Wraps text in SSML speak tags
 */
export function wrapInSSML(text: string, options: SSMLOptions = {}): string {
  const { rate = 'medium', pitch = 'medium', volume = 'medium' } = options;

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <prosody rate="${rate}" pitch="${pitch}" volume="${volume}">
      ${text}
    </prosody>
  </speak>`;
}

/**
 * Adds a pause/break in the narration
 * @param ms - Duration in milliseconds (max 5000ms)
 */
export function addPause(ms: number = 500): string {
  const duration = Math.min(ms, 5000);
  return `<break time="${duration}ms"/>`;
}

/**
 * Adds emphasis to a word or phrase
 */
export function addEmphasis(text: string, level: 'strong' | 'moderate' | 'reduced' = 'moderate'): string {
  return `<emphasis level="${level}">${text}</emphasis>`;
}

/**
 * Wraps text to be spoken at a specific rate
 */
export function setRate(text: string, rate: SSMLOptions['rate'] = 'medium'): string {
  return `<prosody rate="${rate}">${text}</prosody>`;
}

/**
 * Adds a soft, romantic feeling to the narration
 */
export function makeRomantic(text: string): string {
  return `<prosody rate="slow" pitch="-5%" volume="soft">${text}</prosody>`;
}

/**
 * Process narration text to add natural pauses and emphasis
 */
export function processNarrationForSSML(narration: string): string {
  let processed = narration;

  // Add pauses after sentences
  processed = processed.replace(/\. /g, `. ${addPause(400)} `);
  processed = processed.replace(/\? /g, `? ${addPause(500)} `);
  processed = processed.replace(/! /g, `! ${addPause(400)} `);

  // Add longer pauses after paragraphs
  processed = processed.replace(/\n\n/g, `\n${addPause(800)}\n`);

  // Add emphasis to romantic keywords
  const romanticWords = [
    'love', 'heart', 'forever', 'always', 'together',
    'beautiful', 'magical', 'special', 'wonderful', 'perfect',
    'first', 'moment', 'remember', 'dream', 'future',
    'kiss', 'smile', 'laugh', 'joy', 'happiness'
  ];

  romanticWords.forEach(word => {
    const regex = new RegExp(`\\b(${word})\\b`, 'gi');
    processed = processed.replace(regex, addEmphasis('$1', 'moderate'));
  });

  // Add pauses before and after names (usually in quotes or capitalized)
  processed = processed.replace(
    /(['"][A-Z][a-zA-Z]+['"])/g,
    `${addPause(200)}$1${addPause(200)}`
  );

  // Slow down for emotional moments
  const emotionalPhrases = [
    'I love you',
    'forever',
    'always and forever',
    'our love story',
    'happily ever after'
  ];

  emotionalPhrases.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    processed = processed.replace(regex, makeRomantic(phrase));
  });

  return wrapInSSML(processed, {
    rate: '95%', // Slightly slower than normal for romantic effect
    pitch: 'medium',
    volume: 'medium',
  });
}

/**
 * Generate SSML for a specific scene/section
 */
export function generateSceneSSML(
  sceneText: string,
  sceneType: 'intro' | 'story' | 'highlight' | 'outro'
): string {
  switch (sceneType) {
    case 'intro':
      return wrapInSSML(
        `${addPause(500)}${setRate(sceneText, 'slow')}${addPause(800)}`,
        { pitch: 'medium', volume: 'soft' }
      );

    case 'story':
      return processNarrationForSSML(sceneText);

    case 'highlight':
      return wrapInSSML(
        `${addPause(600)}${makeRomantic(sceneText)}${addPause(600)}`,
        { volume: 'medium' }
      );

    case 'outro':
      return wrapInSSML(
        `${addPause(800)}${setRate(addEmphasis(sceneText, 'strong'), 'x-slow')}`,
        { pitch: '-10%', volume: 'soft' }
      );

    default:
      return processNarrationForSSML(sceneText);
  }
}

/**
 * Split narration into timed segments for subtitles
 */
export function splitNarrationIntoSegments(
  narration: string,
  wordsPerSegment: number = 10
): Array<{ text: string; estimatedDuration: number }> {
  const words = narration.split(/\s+/);
  const segments: Array<{ text: string; estimatedDuration: number }> = [];

  for (let i = 0; i < words.length; i += wordsPerSegment) {
    const segmentWords = words.slice(i, i + wordsPerSegment);
    const text = segmentWords.join(' ');

    // Estimate duration based on average speaking rate (150 words per minute)
    const estimatedDuration = (segmentWords.length / 150) * 60 * 1000; // in ms

    segments.push({ text, estimatedDuration });
  }

  return segments;
}

/**
 * Calculate total narration duration estimate
 */
export function estimateNarrationDuration(narration: string): number {
  const words = narration.split(/\s+/).length;
  // Average speaking rate: ~140 words per minute for emotional narration
  const baseMinutes = words / 140;

  // Add time for pauses (roughly 10% extra)
  const pauseBuffer = baseMinutes * 0.1;

  return (baseMinutes + pauseBuffer) * 60; // Return in seconds
}
