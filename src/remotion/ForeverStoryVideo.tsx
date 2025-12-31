import { Composition } from 'remotion';
import { MovieComposition } from './MovieComposition';

export const ForeverStoryVideo: React.FC = () => {
  return (
    <Composition
      id="ForeverStoryVideo"
      component={MovieComposition}
      durationInFrames={1800} // 60 seconds at 30fps
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        partner1Name: 'Partner 1',
        partner2Name: 'Partner 2',
        anniversaryDate: '2024-01-01',
        howWeMet: '',
        firstDate: '',
        funniestMoment: '',
        whenIKnew: '',
        favoriteThing: '',
        futureDream: '',
        photoUrls: [],
        narrationAudioUrl: '',
        musicUrl: '',
        styleId: 'ghibli_cherry_blossoms',
      }}
    />
  );
};
