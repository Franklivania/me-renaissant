import type { OnboardingData, DoppelgangerPersona } from '@/types';

const RENAISSANCE_NAMES = {
  male: [
    'Alessandro', 'Lorenzo', 'Francesco', 'Giovanni', 'Marco', 'Niccolò', 
    'Raffaele', 'Benedetto', 'Cosimo', 'Giuliano', 'Matteo', 'Sebastiano'
  ],
  female: [
    'Isabella', 'Caterina', 'Lucrezia', 'Beatrice', 'Elisabetta', 'Margherita',
    'Vittoria', 'Bianca', 'Giulia', 'Francesca', 'Alessandra', 'Maddalena'
  ],
  neutral: [
    'Adriano', 'Celeste', 'Dante', 'Emilio', 'Fiorenzo', 'Gabriele',
    'Leone', 'Michelangelo', 'Orazio', 'Raffaello', 'Silvano', 'Valentino'
  ]
};

const RENAISSANCE_SURNAMES = [
  'da Vinci', 'de\' Medici', 'Borgia', 'Sforza', 'Gonzaga', 'Este',
  'della Rovere', 'Farnese', 'Orsini', 'Colonna', 'Visconti', 'Bentivoglio',
  'd\'Amaranta', 'del Fiore', 'di Montecroce', 'della Luna', 'del Sole'
];

const OCCUPATION_MAPPINGS: Record<string, string[]> = {
  'Artist of Digital Realms (Design, Engineering)': [
    'Master of Sacred Geometries', 'Architect of Divine Proportions', 
    'Illuminator of Manuscripts', 'Designer of Celestial Machines'
  ],
  'Keeper of Ancient Wisdom (Teacher)': [
    'Scholar of the Liberal Arts', 'Tutor to Noble Houses', 
    'Keeper of the Great Library', 'Master of Rhetoric and Philosophy'
  ],
  'Healer of Bodies and Souls (Healthcare)': [
    'Physician of Humours', 'Herbalist and Alchemist', 
    'Surgeon of the Court', 'Healer of Mind and Spirit'
  ],
  'Merchant (Entrepreneur, Businessperson)': [
    'Master of the Guild', 'Trader of Exotic Spices', 
    'Banker to Princes', 'Navigator of Commerce'
  ],
  'Guardian of Justice': [
    'Magistrate of the Republic', 'Defender of the Innocent', 
    'Judge of Sacred Law', 'Protector of the Realm'
  ],
  'Weaver of Stories (Content Creator)': [
    'Chronicler of Great Deeds', 'Bard of the Court', 
    'Scribe of Epic Tales', 'Poet of the Renaissance'
  ],
  'Seeker of Knowledge (Student)': [
    'Apprentice to the Masters', 'Student of Natural Philosophy', 
    'Novice of the Arts', 'Seeker of Hidden Truths'
  ],
  'Wanderer Between Worlds (Explorer)': [
    'Navigator of Unknown Seas', 'Cartographer of New Lands', 
    'Explorer of Hidden Realms', 'Discoverer of Ancient Mysteries'
  ]
};

const PERSONALITY_TRAITS_BY_HOBBIES: Record<string, string[]> = {
  'Gardening': ['nurturing', 'patient', 'connected to nature'],
  'Drawing': ['observant', 'artistic', 'detail-oriented'],
  'Gaming': ['strategic', 'competitive', 'analytical'],
  'Cooking': ['creative', 'generous', 'sensual'],
  'Stargazing': ['contemplative', 'philosophical', 'dreamy'],
  'Dancing': ['expressive', 'graceful', 'passionate'],
  'Collecting objects': ['meticulous', 'curious', 'preserving'],
  'Making potions (coffee/tea)': ['alchemical', 'ritualistic', 'warming'],
  'Reading strange tales': ['imaginative', 'scholarly', 'mysterious'],
  'Puzzling or logic': ['rational', 'methodical', 'persistent'],
  'Singing aloud': ['expressive', 'joyful', 'melodious'],
  'Wandering': ['adventurous', 'free-spirited', 'observant'],
  'Observing people': ['perceptive', 'empathetic', 'wise'],
  'Telling stories': ['charismatic', 'imaginative', 'entertaining'],
  'Woodworking': ['crafty', 'patient', 'practical'],
  'Alchemy (coding)': ['logical', 'transformative', 'innovative'],
  'Fixing broken things': ['resourceful', 'helpful', 'persistent'],
  'Journaling': ['reflective', 'introspective', 'articulate'],
  'Hunting for oddities': ['curious', 'adventurous', 'unconventional'],
  'Studying beasts': ['scientific', 'patient', 'observant'],
  'Learning new tongues': ['intellectual', 'communicative', 'cultured'],
  'Inventing machines': ['innovative', 'mechanical', 'visionary'],
  'Playing with fire': ['bold', 'experimental', 'passionate'],
  'Decorating spaces': ['aesthetic', 'harmonious', 'creative']
};

export class DoppelgangerGenerator {
  static generatePersona(data: OnboardingData): DoppelgangerPersona {
    // Determine gender for name selection
    const nameGender = this.determineNameGender(data.gender);
    
    // Generate name
    const firstName = this.getRandomFromArray(RENAISSANCE_NAMES[nameGender]);
    const lastName = this.getRandomFromArray(RENAISSANCE_SURNAMES);
    const name = `${firstName} ${lastName}`;

    // Generate occupation and title
    const occupations = OCCUPATION_MAPPINGS[data.role] || ['Artisan of Unknown Arts'];
    const occupation = this.getRandomFromArray(occupations);
    const title = this.generateTitle(data, occupation);

    // Generate personality traits
    const traits = this.generatePersonalityTraits(data.hobbies);
    
    // Determine speaking style
    const speakingStyle = this.determineSpeakingStyle(data);

    // Generate background story
    const description = this.generateBackgroundStory(name, occupation, data, traits);

    return {
      name,
      title,
      occupation,
      description,
      personality_traits: traits,
      speaking_style: speakingStyle,
      background_story: description
    };
  }

  private static determineNameGender(userGender: string): 'male' | 'female' | 'neutral' {
    // 70% chance to match user's gender, 30% chance for variation
    const shouldMatch = Math.random() < 0.7;
    
    if (!shouldMatch) {
      return 'neutral';
    }

    switch (userGender.toLowerCase()) {
      case 'man':
        return 'male';
      case 'woman':
        return 'female';
      default:
        return 'neutral';
    }
  }

  private static generateTitle(data: OnboardingData, occupation: string): string {
    const titlePrefixes = [
      'Master', 'Keeper of', 'Guardian of', 'Weaver of', 'Scholar of',
      'Chronicler of', 'Seeker of', 'Protector of', 'Artist of'
    ];
    
    const titleSuffixes = [
      'the Eternal Flame', 'Hidden Mysteries', 'Ancient Wisdom', 'Lost Arts',
      'Sacred Knowledge', 'Forgotten Realms', 'Divine Inspiration', 'Celestial Harmonies'
    ];

    // Create title based on hobbies and role
    if (data.hobbies.includes('Stargazing')) {
      return `${this.getRandomFromArray(titlePrefixes)} Celestial Mysteries`;
    }
    if (data.hobbies.includes('Reading strange tales')) {
      return `${this.getRandomFromArray(titlePrefixes)} Forgotten Lore`;
    }
    if (data.hobbies.includes('Alchemy (coding)')) {
      return `${this.getRandomFromArray(titlePrefixes)} Transformative Arts`;
    }

    return `${this.getRandomFromArray(titlePrefixes)} ${this.getRandomFromArray(titleSuffixes)}`;
  }

  private static generatePersonalityTraits(hobbies: string[]): string[] {
    const traits = new Set<string>();
    
    hobbies.forEach(hobby => {
      const hobbyTraits = PERSONALITY_TRAITS_BY_HOBBIES[hobby] || [];
      hobbyTraits.forEach(trait => traits.add(trait));
    });

    return Array.from(traits).slice(0, 6); // Limit to 6 traits
  }

  private static determineSpeakingStyle(data: OnboardingData): 'formal' | 'poetic' | 'mystical' | 'scholarly' {
    if (data.hobbies.includes('Reading strange tales') || data.hobbies.includes('Stargazing')) {
      return 'mystical';
    }
    if (data.hobbies.includes('Telling stories') || data.hobbies.includes('Singing aloud')) {
      return 'poetic';
    }
    if (data.role.includes('Teacher') || data.hobbies.includes('Learning new tongues')) {
      return 'scholarly';
    }
    return 'formal';
  }

  private static generateBackgroundStory(
    name: string, 
    occupation: string, 
    data: OnboardingData, 
    traits: string[]
  ): string {
    const storyElements = [
      `Born under a ${this.getRandomFromArray(['crescent moon', 'blazing star', 'solar eclipse', 'harvest moon'])}`,
      `${name} ${this.getRandomFromArray(['wandered', 'studied', 'crafted', 'discovered'])} in the ${this.getRandomFromArray(['hills of Tuscany', 'libraries of Florence', 'workshops of Venice', 'courts of Milan'])}`,
      `Known for their ${traits.slice(0, 2).join(' and ')} nature`,
      `Once ${this.getRandomFromArray(['convinced a prince to change his mind', 'solved a mystery that baffled scholars', 'created something that amazed the court', 'discovered a truth hidden for centuries'])}`
    ];

    // Add hobby-specific elements
    if (data.hobbies.includes('Stargazing')) {
      storyElements.push('They read the stars like others read books');
    }
    if (data.hobbies.includes('Cooking')) {
      storyElements.push('Their feasts are legendary throughout the land');
    }
    if (data.hobbies.includes('Gaming')) {
      storyElements.push('No chess master has ever defeated them');
    }

    return storyElements.join('. ') + '. A kindred spirit to thee, yet forged in different times.';
  }

  private static getRandomFromArray<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}