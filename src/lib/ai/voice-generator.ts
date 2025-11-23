import { SupportedLanguage, Scene } from '@/types';
import { ELEVENLABS_VOICES } from '@/lib/constants';

interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export async function generateVoiceover(
  scenes: Scene[],
  language: SupportedLanguage
): Promise<ArrayBuffer> {
  // Combine all narrations
  const fullNarration = scenes
    .map((scene) => scene.narration)
    .join('\n\n');

  // Get voice configuration for language
  const voiceConfig = ELEVENLABS_VOICES[language] || ELEVENLABS_VOICES['en'];

  const voiceSettings: ElevenLabsVoiceSettings = {
    stability: 0.75,
    similarity_boost: 0.75,
    style: 0.5,
    use_speaker_boost: true,
  };

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text: fullNarration,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error('Voice generation failed');
    }

    const audioBuffer = await response.arrayBuffer();
    return audioBuffer;
  } catch (error) {
    console.error('Voice generation error:', error);
    throw new Error('Failed to generate voiceover');
  }
}

export async function generateSceneVoiceovers(
  scenes: Scene[],
  language: SupportedLanguage
): Promise<ArrayBuffer[]> {
  const voiceConfig = ELEVENLABS_VOICES[language] || ELEVENLABS_VOICES['en'];
  const audioBuffers: ArrayBuffer[] = [];

  for (const scene of scenes) {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          },
          body: JSON.stringify({
            text: scene.narration,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.75,
              similarity_boost: 0.75,
              style: 0.5,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Voice generation failed for scene ${scene.sceneNumber}`);
      }

      const audioBuffer = await response.arrayBuffer();
      audioBuffers.push(audioBuffer);
    } catch (error) {
      console.error(`Error generating voice for scene ${scene.sceneNumber}:`, error);
      throw error;
    }
  }

  return audioBuffers;
}
