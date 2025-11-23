import Anthropic from '@anthropic-ai/sdk';
import { StoryFormData, GeneratedScript, Scene, SupportedLanguage } from '@/types';
import { STYLE_CONFIGS } from '@/lib/constants';

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

export async function generateScript(
  storyData: StoryFormData
): Promise<GeneratedScript> {
  const styleName = STYLE_CONFIGS[storyData.artStyle]?.name || 'Studio Ghibli';
  const languageName = LANGUAGE_NAMES[storyData.language] || 'English';

  const prompt = `You are a romantic storyteller and screenwriter. Your task is to transform a couple's love story into a beautiful 90-second animated movie script.

COUPLE'S STORY:
- Names: ${storyData.coupleNames}
- How they met: ${storyData.howMet}
- First date memory: ${storyData.firstDate}
- Who said "I love you" first: ${storyData.iLoveYou}
- Inside joke/ritual: ${storyData.insideJoke}
- Biggest adventure: ${storyData.adventure}
- Future dream: ${storyData.futureDream}

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
