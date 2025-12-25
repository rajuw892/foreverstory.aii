// ========================================
// ForeverStory - 24 Cinematic Styles Configuration
// Each style creates a unique emotional video experience
// ========================================

export type CinematicStyleId =
  | 'ghibli_cherry_blossoms'
  | 'howls_castle_night'
  | 'disney_castle_fireworks'
  | 'tangled_lanterns'
  | 'pixar_up_balloons'
  | 'frozen_aurora'
  | 'toy_story_clouds'
  | 'shrek_swamp_sunset'
  | 'watercolor_handpainted'
  | 'vintage_super8'
  | 'polaroid_memories'
  | 'rainy_paris'
  | 'star_wars_hyperspace'
  | 'marvel_cinematic'
  | 'la_la_land_sunset'
  | 'harry_potter_great_hall'
  | 'notebook_rain_kiss'
  | 'pride_prejudice_fields'
  | 'interstellar_galaxy'
  | 'scifi_stardust'
  | 'steampunk_brass'
  | 'bollywood_dream'
  | 'kdrama_cherry_blossom'
  | 'valentine_roses';

export type ParticleType =
  | 'sakura'
  | 'embers'
  | 'fireworks'
  | 'lanterns'
  | 'balloons'
  | 'snowflakes'
  | 'stars'
  | 'fireflies'
  | 'inkdrops'
  | 'filmgrain'
  | 'rain'
  | 'hyperspace'
  | 'digital'
  | 'bokeh'
  | 'sparkles'
  | 'dandelions'
  | 'cosmic'
  | 'neon'
  | 'steam'
  | 'marigolds'
  | 'petals'
  | 'roses'
  | 'none';

export interface ColorGrading {
  saturation: number;    // 0-2, 1 is normal
  brightness: number;    // 0-2, 1 is normal
  contrast: number;      // 0-2, 1 is normal
  hue: number;          // -180 to 180
  sepia: number;        // 0-1
  blur: number;         // 0-20 pixels
  vignette: number;     // 0-1
}

export interface CinematicStyle {
  id: CinematicStyleId;
  name: string;
  description: string;
  category: 'animation' | 'classic' | 'vintage' | 'cinematic' | 'fantasy' | 'cultural';

  // Visual configuration
  gradient: {
    colors: string[];
    direction: number; // degrees
  };
  particleType: ParticleType;
  particleColor: string;
  particleCount: number;
  colorGrading: ColorGrading;

  // Typography
  titleFont: string;
  bodyFont: string;
  accentColor: string;
  textShadow: string;

  // Frame style for photos
  frameStyle: 'none' | 'polaroid' | 'vignette' | 'soft_edges' | 'vintage' | 'film' | 'ornate';

  // Music mood for matching
  musicMood: 'romantic_piano' | 'acoustic_dreams' | 'emotional_strings' | 'dreamy_ambience' | 'uplifting_adventure';

  // Background video/image URL (optional)
  backgroundUrl?: string;
}

// ========================================
// All 24 Cinematic Styles
// ========================================

export const CINEMATIC_STYLES: Record<CinematicStyleId, CinematicStyle> = {
  // ========================================
  // ANIMATION STYLES (1-8)
  // ========================================

  ghibli_cherry_blossoms: {
    id: 'ghibli_cherry_blossoms',
    name: 'Studio Ghibli Cherry Blossoms',
    description: 'Soft pink petals dancing in a gentle spring breeze',
    category: 'animation',
    gradient: {
      colors: ['#FFE4EC', '#FFB7C5', '#FFDAB9'],
      direction: 135,
    },
    particleType: 'sakura',
    particleColor: '#FFB7C5',
    particleCount: 50,
    colorGrading: {
      saturation: 1.1,
      brightness: 1.05,
      contrast: 0.95,
      hue: 0,
      sepia: 0.05,
      blur: 0,
      vignette: 0.2,
    },
    titleFont: 'Playfair Display',
    bodyFont: 'Lora',
    accentColor: '#FFB7C5',
    textShadow: '0 2px 20px rgba(255,183,197,0.5)',
    frameStyle: 'soft_edges',
    musicMood: 'romantic_piano',
  },

  howls_castle_night: {
    id: 'howls_castle_night',
    name: "Howl's Moving Castle Rooftop Night",
    description: 'Magical starlit sky with golden embers rising slowly',
    category: 'animation',
    gradient: {
      colors: ['#0D1B2A', '#1B263B', '#415A77'],
      direction: 180,
    },
    particleType: 'embers',
    particleColor: '#FFD700',
    particleCount: 35,
    colorGrading: {
      saturation: 1.0,
      brightness: 0.9,
      contrast: 1.1,
      hue: -10,
      sepia: 0,
      blur: 0,
      vignette: 0.4,
    },
    titleFont: 'Cinzel',
    bodyFont: 'Cormorant Garamond',
    accentColor: '#4169E1',
    textShadow: '0 0 30px rgba(65,105,225,0.6)',
    frameStyle: 'vignette',
    musicMood: 'dreamy_ambience',
  },

  disney_castle_fireworks: {
    id: 'disney_castle_fireworks',
    name: 'Disney Castle Fireworks',
    description: 'Royal blue gradient with magical firework bursts',
    category: 'animation',
    gradient: {
      colors: ['#1A1A4E', '#2E2E7A', '#4A4AA6'],
      direction: 180,
    },
    particleType: 'fireworks',
    particleColor: '#FFD700',
    particleCount: 25,
    colorGrading: {
      saturation: 1.2,
      brightness: 1.0,
      contrast: 1.05,
      hue: 0,
      sepia: 0,
      blur: 0,
      vignette: 0.3,
    },
    titleFont: 'Dancing Script',
    bodyFont: 'Quicksand',
    accentColor: '#FFD700',
    textShadow: '0 0 40px rgba(255,215,0,0.7)',
    frameStyle: 'ornate',
    musicMood: 'emotional_strings',
  },

  tangled_lanterns: {
    id: 'tangled_lanterns',
    name: 'Tangled Lanterns Night',
    description: 'Glowing orange lanterns floating against a purple night sky',
    category: 'animation',
    gradient: {
      colors: ['#1A0A2E', '#2D1B4E', '#4A2C7A'],
      direction: 180,
    },
    particleType: 'lanterns',
    particleColor: '#FFA500',
    particleCount: 30,
    colorGrading: {
      saturation: 1.1,
      brightness: 0.95,
      contrast: 1.0,
      hue: 10,
      sepia: 0.1,
      blur: 0,
      vignette: 0.35,
    },
    titleFont: 'Great Vibes',
    bodyFont: 'Libre Baskerville',
    accentColor: '#FFA500',
    textShadow: '0 0 25px rgba(255,165,0,0.6)',
    frameStyle: 'soft_edges',
    musicMood: 'acoustic_dreams',
  },

  pixar_up_balloons: {
    id: 'pixar_up_balloons',
    name: 'Pixar Up Balloons',
    description: 'Bright blue sky with colorful balloons floating upward',
    category: 'animation',
    gradient: {
      colors: ['#87CEEB', '#ADD8E6', '#E0F7FF'],
      direction: 180,
    },
    particleType: 'balloons',
    particleColor: '#FF6B6B',
    particleCount: 40,
    colorGrading: {
      saturation: 1.15,
      brightness: 1.1,
      contrast: 1.0,
      hue: 0,
      sepia: 0,
      blur: 0,
      vignette: 0.15,
    },
    titleFont: 'Quicksand',
    bodyFont: 'Nunito',
    accentColor: '#FF6B6B',
    textShadow: '0 4px 15px rgba(0,0,0,0.2)',
    frameStyle: 'soft_edges',
    musicMood: 'uplifting_adventure',
  },

  frozen_aurora: {
    id: 'frozen_aurora',
    name: 'Frozen Aurora Nights',
    description: 'Icy blue gradient with aurora borealis and gentle snowflakes',
    category: 'animation',
    gradient: {
      colors: ['#0B132B', '#1C2541', '#3A506B', '#5BC0BE'],
      direction: 180,
    },
    particleType: 'snowflakes',
    particleColor: '#FFFFFF',
    particleCount: 60,
    colorGrading: {
      saturation: 0.95,
      brightness: 0.95,
      contrast: 1.1,
      hue: -15,
      sepia: 0,
      blur: 0,
      vignette: 0.3,
    },
    titleFont: 'Cinzel',
    bodyFont: 'Raleway',
    accentColor: '#5BC0BE',
    textShadow: '0 0 30px rgba(91,192,190,0.6)',
    frameStyle: 'vignette',
    musicMood: 'dreamy_ambience',
  },

  toy_story_clouds: {
    id: 'toy_story_clouds',
    name: 'Toy Story Cloudy Sky',
    description: 'Light blue sky with fluffy animated clouds',
    category: 'animation',
    gradient: {
      colors: ['#87CEEB', '#B0E0E6', '#E6F3FF'],
      direction: 180,
    },
    particleType: 'stars',
    particleColor: '#FFD700',
    particleCount: 20,
    colorGrading: {
      saturation: 1.2,
      brightness: 1.1,
      contrast: 1.0,
      hue: 5,
      sepia: 0,
      blur: 0,
      vignette: 0.1,
    },
    titleFont: 'Fredoka One',
    bodyFont: 'Nunito',
    accentColor: '#4A90D9',
    textShadow: '0 3px 10px rgba(0,0,0,0.15)',
    frameStyle: 'polaroid',
    musicMood: 'uplifting_adventure',
  },

  shrek_swamp_sunset: {
    id: 'shrek_swamp_sunset',
    name: 'Shrek Swamp Sunset',
    description: 'Orange-to-green gradient with fireflies and falling leaves',
    category: 'animation',
    gradient: {
      colors: ['#FF8C00', '#228B22', '#006400'],
      direction: 180,
    },
    particleType: 'fireflies',
    particleColor: '#FFFF99',
    particleCount: 35,
    colorGrading: {
      saturation: 1.1,
      brightness: 1.0,
      contrast: 1.0,
      hue: 15,
      sepia: 0.15,
      blur: 0,
      vignette: 0.25,
    },
    titleFont: 'Merriweather',
    bodyFont: 'Source Serif Pro',
    accentColor: '#90EE90',
    textShadow: '0 2px 15px rgba(0,100,0,0.4)',
    frameStyle: 'vintage',
    musicMood: 'acoustic_dreams',
  },

  // ========================================
  // VINTAGE/ARTISTIC STYLES (9-12)
  // ========================================

  watercolor_handpainted: {
    id: 'watercolor_handpainted',
    name: 'Watercolor Hand-Painted',
    description: 'Soft cream with watercolor wash texture and ink blooms',
    category: 'vintage',
    gradient: {
      colors: ['#FFF8E7', '#FAF0E6', '#FFEFD5'],
      direction: 135,
    },
    particleType: 'inkdrops',
    particleColor: '#DEB887',
    particleCount: 15,
    colorGrading: {
      saturation: 0.9,
      brightness: 1.05,
      contrast: 0.9,
      hue: 10,
      sepia: 0.2,
      blur: 1,
      vignette: 0.25,
    },
    titleFont: 'Dancing Script',
    bodyFont: 'Lora',
    accentColor: '#D4A574',
    textShadow: '0 2px 10px rgba(212,165,116,0.3)',
    frameStyle: 'soft_edges',
    musicMood: 'acoustic_dreams',
  },

  vintage_super8: {
    id: 'vintage_super8',
    name: 'Vintage Super 8 Film',
    description: 'Warm sepia tones with film grain and light leaks',
    category: 'vintage',
    gradient: {
      colors: ['#D4A574', '#C4956A', '#8B7355'],
      direction: 180,
    },
    particleType: 'filmgrain',
    particleColor: '#FFFFFF',
    particleCount: 100,
    colorGrading: {
      saturation: 0.8,
      brightness: 0.95,
      contrast: 1.1,
      hue: 20,
      sepia: 0.4,
      blur: 0.5,
      vignette: 0.5,
    },
    titleFont: 'Special Elite',
    bodyFont: 'Courier Prime',
    accentColor: '#8B7355',
    textShadow: '0 2px 8px rgba(139,115,85,0.5)',
    frameStyle: 'film',
    musicMood: 'romantic_piano',
  },

  polaroid_memories: {
    id: 'polaroid_memories',
    name: 'Polaroid Memories',
    description: 'Clean white aesthetic with slightly faded vintage tones',
    category: 'vintage',
    gradient: {
      colors: ['#FFFFFF', '#F5F5F5', '#EBEBEB'],
      direction: 180,
    },
    particleType: 'none',
    particleColor: '#FFFFFF',
    particleCount: 0,
    colorGrading: {
      saturation: 0.9,
      brightness: 1.0,
      contrast: 0.95,
      hue: 5,
      sepia: 0.15,
      blur: 0,
      vignette: 0.15,
    },
    titleFont: 'Permanent Marker',
    bodyFont: 'Indie Flower',
    accentColor: '#666666',
    textShadow: 'none',
    frameStyle: 'polaroid',
    musicMood: 'acoustic_dreams',
  },

  rainy_paris: {
    id: 'rainy_paris',
    name: 'Rainy Paris Window',
    description: 'Blurred city lights through rain with moody atmosphere',
    category: 'vintage',
    gradient: {
      colors: ['#2F4F4F', '#4A6670', '#708090'],
      direction: 180,
    },
    particleType: 'rain',
    particleColor: '#B0C4DE',
    particleCount: 80,
    colorGrading: {
      saturation: 0.85,
      brightness: 0.9,
      contrast: 1.05,
      hue: -5,
      sepia: 0.1,
      blur: 2,
      vignette: 0.4,
    },
    titleFont: 'Libre Baskerville',
    bodyFont: 'EB Garamond',
    accentColor: '#B0C4DE',
    textShadow: '0 0 20px rgba(176,196,222,0.5)',
    frameStyle: 'vignette',
    musicMood: 'romantic_piano',
  },

  // ========================================
  // CINEMATIC/SCI-FI STYLES (13-20)
  // ========================================

  star_wars_hyperspace: {
    id: 'star_wars_hyperspace',
    name: 'Star Wars Hyperspace',
    description: 'Black with blue hyperspace streaks and lens flares',
    category: 'cinematic',
    gradient: {
      colors: ['#000000', '#000033', '#000066'],
      direction: 180,
    },
    particleType: 'hyperspace',
    particleColor: '#00BFFF',
    particleCount: 100,
    colorGrading: {
      saturation: 1.0,
      brightness: 0.95,
      contrast: 1.3,
      hue: 0,
      sepia: 0,
      blur: 0,
      vignette: 0.3,
    },
    titleFont: 'Orbitron',
    bodyFont: 'Exo 2',
    accentColor: '#00BFFF',
    textShadow: '0 0 20px rgba(0,191,255,0.8)',
    frameStyle: 'none',
    musicMood: 'emotional_strings',
  },

  marvel_cinematic: {
    id: 'marvel_cinematic',
    name: 'Marvel Cinematic Credits',
    description: 'Dark gradient with digital particles and teal-orange look',
    category: 'cinematic',
    gradient: {
      colors: ['#1A1A2E', '#16213E', '#0F3460'],
      direction: 135,
    },
    particleType: 'digital',
    particleColor: '#E94560',
    particleCount: 40,
    colorGrading: {
      saturation: 1.1,
      brightness: 0.95,
      contrast: 1.15,
      hue: -10,
      sepia: 0,
      blur: 0,
      vignette: 0.35,
    },
    titleFont: 'Montserrat',
    bodyFont: 'Open Sans',
    accentColor: '#E94560',
    textShadow: '0 0 25px rgba(233,69,96,0.6)',
    frameStyle: 'none',
    musicMood: 'emotional_strings',
  },

  la_la_land_sunset: {
    id: 'la_la_land_sunset',
    name: 'La La Land Sunset',
    description: 'Purple-pink-orange LA sunset with dreamy bokeh',
    category: 'cinematic',
    gradient: {
      colors: ['#4A0E4E', '#C060A1', '#FF6F61', '#FFBB5C'],
      direction: 180,
    },
    particleType: 'bokeh',
    particleColor: '#FFD700',
    particleCount: 25,
    colorGrading: {
      saturation: 1.15,
      brightness: 1.0,
      contrast: 0.95,
      hue: 5,
      sepia: 0.05,
      blur: 0,
      vignette: 0.2,
    },
    titleFont: 'Poiret One',
    bodyFont: 'Josefin Sans',
    accentColor: '#FFD700',
    textShadow: '0 0 30px rgba(255,215,0,0.5)',
    frameStyle: 'soft_edges',
    musicMood: 'romantic_piano',
  },

  harry_potter_great_hall: {
    id: 'harry_potter_great_hall',
    name: 'Harry Potter Great Hall',
    description: 'Dark stone ambiance with floating candles and golden sparkles',
    category: 'fantasy',
    gradient: {
      colors: ['#1A1A1A', '#2D2D2D', '#3D3D3D'],
      direction: 180,
    },
    particleType: 'sparkles',
    particleColor: '#FFD700',
    particleCount: 45,
    colorGrading: {
      saturation: 1.0,
      brightness: 0.85,
      contrast: 1.1,
      hue: 15,
      sepia: 0.1,
      blur: 0,
      vignette: 0.45,
    },
    titleFont: 'Uncial Antiqua',
    bodyFont: 'Crimson Text',
    accentColor: '#FFD700',
    textShadow: '0 0 20px rgba(255,215,0,0.6)',
    frameStyle: 'ornate',
    musicMood: 'dreamy_ambience',
  },

  notebook_rain_kiss: {
    id: 'notebook_rain_kiss',
    name: 'The Notebook Rain Kiss',
    description: 'Stormy blue-grey with heavy rain and dramatic contrast',
    category: 'cinematic',
    gradient: {
      colors: ['#2C3E50', '#34495E', '#5D6D7E'],
      direction: 180,
    },
    particleType: 'rain',
    particleColor: '#87CEEB',
    particleCount: 120,
    colorGrading: {
      saturation: 0.85,
      brightness: 0.9,
      contrast: 1.2,
      hue: -5,
      sepia: 0.05,
      blur: 0,
      vignette: 0.4,
    },
    titleFont: 'Crimson Text',
    bodyFont: 'Lora',
    accentColor: '#87CEEB',
    textShadow: '0 0 15px rgba(135,206,235,0.4)',
    frameStyle: 'vignette',
    musicMood: 'emotional_strings',
  },

  pride_prejudice_fields: {
    id: 'pride_prejudice_fields',
    name: 'Pride & Prejudice Fields',
    description: 'Golden hour fields with dandelion seeds and warm period glow',
    category: 'cinematic',
    gradient: {
      colors: ['#DAA520', '#F0E68C', '#FFFACD'],
      direction: 180,
    },
    particleType: 'dandelions',
    particleColor: '#FFFFFF',
    particleCount: 30,
    colorGrading: {
      saturation: 1.1,
      brightness: 1.05,
      contrast: 0.95,
      hue: 10,
      sepia: 0.2,
      blur: 0,
      vignette: 0.25,
    },
    titleFont: 'Cormorant',
    bodyFont: 'EB Garamond',
    accentColor: '#8B7355',
    textShadow: '0 2px 15px rgba(139,115,85,0.4)',
    frameStyle: 'vintage',
    musicMood: 'romantic_piano',
  },

  interstellar_galaxy: {
    id: 'interstellar_galaxy',
    name: 'Interstellar Galaxy',
    description: 'Deep space with vibrant nebula colors and cosmic dust',
    category: 'cinematic',
    gradient: {
      colors: ['#000000', '#1A0533', '#2D0B4E', '#3D1466'],
      direction: 135,
    },
    particleType: 'cosmic',
    particleColor: '#9B59B6',
    particleCount: 50,
    colorGrading: {
      saturation: 1.2,
      brightness: 0.9,
      contrast: 1.15,
      hue: 0,
      sepia: 0,
      blur: 0,
      vignette: 0.35,
    },
    titleFont: 'Rajdhani',
    bodyFont: 'Exo 2',
    accentColor: '#9B59B6',
    textShadow: '0 0 30px rgba(155,89,182,0.7)',
    frameStyle: 'none',
    musicMood: 'dreamy_ambience',
  },

  scifi_stardust: {
    id: 'scifi_stardust',
    name: 'Sci-Fi Stardust',
    description: 'Dark blue space with neon particle formations',
    category: 'cinematic',
    gradient: {
      colors: ['#0D0D1A', '#1A1A33', '#26264D'],
      direction: 180,
    },
    particleType: 'neon',
    particleColor: '#00FFFF',
    particleCount: 60,
    colorGrading: {
      saturation: 1.1,
      brightness: 0.95,
      contrast: 1.2,
      hue: -10,
      sepia: 0,
      blur: 0,
      vignette: 0.3,
    },
    titleFont: 'Exo 2',
    bodyFont: 'Roboto',
    accentColor: '#00FFFF',
    textShadow: '0 0 25px rgba(0,255,255,0.8)',
    frameStyle: 'none',
    musicMood: 'dreamy_ambience',
  },

  // ========================================
  // FANTASY STYLES (21)
  // ========================================

  steampunk_brass: {
    id: 'steampunk_brass',
    name: 'Steampunk Brass Gears',
    description: 'Brass-to-copper gradient with steam wisps and clockwork',
    category: 'fantasy',
    gradient: {
      colors: ['#8B4513', '#CD853F', '#D2691E'],
      direction: 135,
    },
    particleType: 'steam',
    particleColor: '#FFFFFF',
    particleCount: 25,
    colorGrading: {
      saturation: 1.05,
      brightness: 0.95,
      contrast: 1.1,
      hue: 15,
      sepia: 0.3,
      blur: 0,
      vignette: 0.35,
    },
    titleFont: 'Bree Serif',
    bodyFont: 'Merriweather',
    accentColor: '#CD853F',
    textShadow: '0 2px 15px rgba(205,133,63,0.5)',
    frameStyle: 'ornate',
    musicMood: 'emotional_strings',
  },

  // ========================================
  // CULTURAL STYLES (22-24)
  // ========================================

  bollywood_dream: {
    id: 'bollywood_dream',
    name: 'Bollywood Dream Sequence',
    description: 'Vibrant magenta-to-gold with marigold petals and glitter',
    category: 'cultural',
    gradient: {
      colors: ['#C71585', '#FF1493', '#FFD700'],
      direction: 135,
    },
    particleType: 'marigolds',
    particleColor: '#FFD700',
    particleCount: 45,
    colorGrading: {
      saturation: 1.3,
      brightness: 1.05,
      contrast: 1.0,
      hue: 5,
      sepia: 0,
      blur: 0,
      vignette: 0.2,
    },
    titleFont: 'Amatic SC',
    bodyFont: 'Poppins',
    accentColor: '#FFD700',
    textShadow: '0 0 25px rgba(255,215,0,0.7)',
    frameStyle: 'ornate',
    musicMood: 'uplifting_adventure',
  },

  kdrama_cherry_blossom: {
    id: 'kdrama_cherry_blossom',
    name: 'K-Drama Cherry Blossom Road',
    description: 'Soft pastel pink with romantic swirling petals',
    category: 'cultural',
    gradient: {
      colors: ['#FFE4EC', '#FFB6C1', '#FFC0CB'],
      direction: 180,
    },
    particleType: 'petals',
    particleColor: '#FFB6C1',
    particleCount: 55,
    colorGrading: {
      saturation: 1.0,
      brightness: 1.1,
      contrast: 0.9,
      hue: 0,
      sepia: 0,
      blur: 1,
      vignette: 0.15,
    },
    titleFont: 'Noto Sans KR',
    bodyFont: 'Noto Serif KR',
    accentColor: '#FF69B4',
    textShadow: '0 2px 20px rgba(255,105,180,0.4)',
    frameStyle: 'soft_edges',
    musicMood: 'romantic_piano',
  },

  valentine_roses: {
    id: 'valentine_roses',
    name: "Valentine's Red Roses",
    description: 'Deep red-to-pink with swirling rose petals',
    category: 'cultural',
    gradient: {
      colors: ['#8B0000', '#DC143C', '#FF69B4'],
      direction: 135,
    },
    particleType: 'roses',
    particleColor: '#DC143C',
    particleCount: 40,
    colorGrading: {
      saturation: 1.15,
      brightness: 1.0,
      contrast: 1.05,
      hue: 0,
      sepia: 0,
      blur: 0,
      vignette: 0.25,
    },
    titleFont: 'Tangerine',
    bodyFont: 'Cormorant Garamond',
    accentColor: '#FF69B4',
    textShadow: '0 0 25px rgba(255,105,180,0.6)',
    frameStyle: 'ornate',
    musicMood: 'emotional_strings',
  },
};

// ========================================
// Style Categories for UI Display
// ========================================

export const STYLE_CATEGORIES = [
  {
    id: 'animation',
    name: 'Animated Movie Magic',
    description: 'Inspired by beloved animated films',
    styles: ['ghibli_cherry_blossoms', 'howls_castle_night', 'disney_castle_fireworks', 'tangled_lanterns', 'pixar_up_balloons', 'frozen_aurora', 'toy_story_clouds', 'shrek_swamp_sunset'],
  },
  {
    id: 'vintage',
    name: 'Vintage & Artistic',
    description: 'Timeless nostalgic aesthetics',
    styles: ['watercolor_handpainted', 'vintage_super8', 'polaroid_memories', 'rainy_paris'],
  },
  {
    id: 'cinematic',
    name: 'Cinematic Blockbusters',
    description: 'Hollywood-inspired dramatic visuals',
    styles: ['star_wars_hyperspace', 'marvel_cinematic', 'la_la_land_sunset', 'notebook_rain_kiss', 'pride_prejudice_fields', 'interstellar_galaxy', 'scifi_stardust'],
  },
  {
    id: 'fantasy',
    name: 'Fantasy & Magic',
    description: 'Enchanted and mystical themes',
    styles: ['harry_potter_great_hall', 'steampunk_brass'],
  },
  {
    id: 'cultural',
    name: 'Cultural Romance',
    description: 'Inspired by global love stories',
    styles: ['bollywood_dream', 'kdrama_cherry_blossom', 'valentine_roses'],
  },
];

// ========================================
// Music Track Mapping for Styles
// ========================================

 export const MUSIC_TRACKS_BY_MOOD = {
  romantic_piano: {
    name: 'Romantic Piano',
    description: 'Soft & Emotional',
    // Sample short piano-ish synth loop (3s)
    url: 'https://download.samplelib.com/mp3/sample-3s.mp3',
    styles: [
      'ghibli_cherry_blossoms',
      'vintage_super8',
      'rainy_paris',
      'la_la_land_sunset',
      'pride_prejudice_fields',
      'kdrama_cherry_blossom',
    ],
  },
  acoustic_dreams: {
    name: 'Acoustic Dreams',
    description: 'Warm Guitar',
    // Slightly longer loop (6s)
    url: 'https://download.samplelib.com/mp3/sample-6s.mp3',
    styles: [
      'tangled_lanterns',
      'shrek_swamp_sunset',
      'watercolor_handpainted',
      'polaroid_memories',
    ],
  },
  emotional_strings: {
    name: 'Emotional Strings',
    description: 'Orchestral',
    // 9s loop
    url: 'https://download.samplelib.com/mp3/sample-9s.mp3',
    styles: [
      'disney_castle_fireworks',
      'star_wars_hyperspace',
      'marvel_cinematic',
      'notebook_rain_kiss',
      'steampunk_brass',
      'valentine_roses',
    ],
  },
  dreamy_ambience: {
    name: 'Dreamy Ambience',
    description: 'Ethereal',
    // 12s loop
    url: 'https://download.samplelib.com/mp3/sample-12s.mp3',
    styles: [
      'howls_castle_night',
      'frozen_aurora',
      'harry_potter_great_hall',
      'interstellar_galaxy',
      'scifi_stardust',
    ],
  },
  uplifting_adventure: {
    name: 'Uplifting Adventure',
    description: 'Happy Orchestral',
    // 15s loop
    url: 'https://download.samplelib.com/mp3/sample-15s.mp3',
    styles: [
      'pixar_up_balloons',
      'toy_story_clouds',
      'bollywood_dream',
    ],
  },
};


// Helper function to get music URL for a style
export function getMusicUrlForStyle(styleId: CinematicStyleId): string {
  const style = CINEMATIC_STYLES[styleId];
  const mood = style.musicMood;
  return MUSIC_TRACKS_BY_MOOD[mood].url;
}

// Helper to get style by ID with fallback
export function getStyleById(styleId: string): CinematicStyle {
  return CINEMATIC_STYLES[styleId as CinematicStyleId] || CINEMATIC_STYLES.ghibli_cherry_blossoms;
}
