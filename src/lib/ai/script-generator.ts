import Anthropic from '@anthropic-ai/sdk';
import { StoryFormData, GeneratedScript, Scene, SupportedLanguage } from '@/types';
import { STYLE_CONFIGS, CINEMATIC_STYLES } from '@/lib/constants';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish',
  id: 'Indonesian',
  pt: 'Portuguese',
  ar: 'Arabic',
  ko: 'Korean',
  tr: 'Turkish',
  bn: 'Bengali',
  vi: 'Vietnamese',
  fr: 'French',
  de: 'German',
};

// Check if a field was skipped (contains placeholder token)
function isSkipped(value: string): boolean {
  return !value || value.startsWith('[GENERATE_') || value === '[SKIPPED]' || value.trim() === '';
}

// Format field for prompt - either use user's answer or indicate AI should create it
function formatField(value: string, fieldName: string): string {
  if (isSkipped(value)) {
    return `[CREATE A BEAUTIFUL, ROMANTIC ${fieldName.toUpperCase()} - BE CREATIVE AND HEARTWARMING]`;
  }
  return value;
}

export async function generateScript(
  storyData: StoryFormData
): Promise<GeneratedScript> {
  // Get style name from cinematicStyleId first, fallback to legacy artStyle
  const cinematicStyle = storyData.cinematicStyleId ? CINEMATIC_STYLES[storyData.cinematicStyleId] : null;
  const styleName = cinematicStyle?.name || STYLE_CONFIGS[storyData.artStyle]?.name || 'Studio Ghibli';
  const languageName = LANGUAGE_NAMES[storyData.language] || 'English';

  // Check how many fields were skipped
  const skippedCount = [
    storyData.coupleNames,
    storyData.howMet,
    storyData.firstDate,
    storyData.iLoveYou,
    storyData.insideJoke,
    storyData.adventure,
    storyData.futureDream,
  ].filter(isSkipped).length;

  const isFullyGenerated = skippedCount === 7;
  const hasPartialInfo = skippedCount > 0 && skippedCount < 7;

  // Build context for AI
  const coupleNames = formatField(storyData.coupleNames, 'couple names');
  const howMet = formatField(storyData.howMet, 'how they met story');
  const firstDate = formatField(storyData.firstDate, 'first date memory');
  const iLoveYou = formatField(storyData.iLoveYou, 'love confession moment');
  const insideJoke = formatField(storyData.insideJoke, 'inside joke or special ritual');
  const adventure = formatField(storyData.adventure, 'adventure together');
  const futureDream = formatField(storyData.futureDream, 'future dream');

  // Special instructions based on how much was skipped
  let specialInstructions = '';
  if (isFullyGenerated) {
    specialInstructions = `
SPECIAL NOTE: The user has chosen to let you create their entire love story from scratch!
Create a COMPLETE, ORIGINAL, and deeply romantic love story. Invent beautiful names,
a magical meeting, tender moments, and a heartwarming journey. Make it feel real and emotional.
This should be a universal love story that anyone would find touching.`;
  } else if (hasPartialInfo) {
    specialInstructions = `
SPECIAL NOTE: Some details are marked with [CREATE...]. For these, invent beautiful,
romantic content that fits naturally with the provided details. Make the story cohesive.`;
  }

  const prompt = `You are a romantic storyteller and screenwriter. Your task is to transform a couple's love story into a beautiful 90-second animated movie script.

COUPLE'S STORY:
- Names: ${coupleNames}
- How they met: ${howMet}
- First date memory: ${firstDate}
- Who said "I love you" first: ${iLoveYou}
- Inside joke/ritual: ${insideJoke}
- Biggest adventure: ${adventure}
- Future dream: ${futureDream}
${specialInstructions}

STYLE: ${styleName} animation style
LANGUAGE: Write all narration in ${languageName}

Create a 6-scene script with exactly 15 seconds per scene. Each scene should be emotionally engaging and cinematic.

Return your response as a JSON object with this exact structure:
{
  "title": "A creative title for the love story",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene title",
      "visualDescription": "Detailed description of what should be shown visually (for image generation). Include setting, lighting, mood, character positions, and ${styleName} style elements.",
      "narration": "The voiceover text in ${languageName}. Keep it emotional, poetic, and about 2-3 sentences.",
      "emotionalTone": "The emotional tone (e.g., 'hopeful', 'romantic', 'playful', 'tender')",
      "duration": 15
    }
  ],
  "totalDuration": 90,
  "language": "${storyData.language}"
}

IMPORTANT:
- Scene 1: The magical beginning (how they met)
- Scene 2: First moments together (first date)
- Scene 3: The confession of love
- Scene 4: Their special bond (inside joke/ritual)
- Scene 5: Adventure together
- Scene 6: Dreams of forever (future together)

Make the visual descriptions specific and vivid for ${styleName} style. Include details like:
- Lighting (golden hour, soft moonlight, warm indoor glow)
- Setting (cherry blossoms, cozy cafe, starry sky, beach sunset)
- Character expressions and poses
- Magical elements appropriate for the style

Keep narration heartfelt and natural - as if telling their story to close friends.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the text content
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const script = JSON.parse(jsonMatch[0]) as GeneratedScript;

    // Validate script structure
    if (!script.scenes || script.scenes.length !== 6) {
      throw new Error('Invalid script structure');
    }

    return script;
  } catch (error) {
    console.error('Script generation error:', error);
    throw new Error('Failed to generate script');
  }
}
