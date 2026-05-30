/* Content for the brand modules: capabilities, reel, dispatch. */

export interface Capability {
  id: string;
  no: string;
  title: string;
  body: string;
  tags: string[];
}

export const CAPABILITIES: Capability[] = [
  {
    id: 'games',
    no: '01',
    title: 'Games',
    body: 'Original worlds with mechanics you have not seen before. We build the strange ones — systems-driven, atmospheric, made to be felt.',
    tags: ['Roguelite', 'Systems', 'Web + PC'],
  },
  {
    id: 'sound',
    no: '02',
    title: 'Spatial Sound',
    body: 'Audio that behaves like a place, not a track. Procedural, reactive, and engineered for headphones and altered states alike.',
    tags: ['Procedural', 'Binaural', 'Engines'],
  },
  {
    id: 'film',
    no: '03',
    title: 'Film & Motion',
    body: 'Short films, reels, and moving image that treat the screen as evidence. Cinematic, restrained, and a little uncanny.',
    tags: ['Shorts', 'Reels', 'Title design'],
  },
  {
    id: 'tools',
    no: '04',
    title: 'Tools & Instruments',
    body: 'Software for people who make things — research instruments, creative toys, and the experiments that do not fit anywhere else.',
    tags: ['R&D', 'Open builds', 'Weird'],
  },
];

export interface Clip {
  id: string;
  title: string;
  kind: string;
  duration: string;
  /** css gradient used as the poster */
  poster: string;
  accent: string;
  note: string;
}

export const CLIPS: Clip[] = [
  {
    id: 'spore',
    title: 'Spore // first descent',
    kind: 'Game capture',
    duration: '0:42',
    poster: 'linear-gradient(135deg, #2a0a1e 0%, #ff2e6c 120%)',
    accent: '#ff2e6c',
    note: 'Bloom — vertical slice, raw capture.',
  },
  {
    id: 'roomtone',
    title: 'Room tone study',
    kind: 'Sound reel',
    duration: '1:18',
    poster: 'linear-gradient(135deg, #07121f 0%, #1f6bff 130%)',
    accent: '#3b82f6',
    note: 'Subject — spatial field, binaural.',
  },
  {
    id: 'declass',
    title: 'Declassified // teaser',
    kind: 'Film',
    duration: '0:30',
    poster: 'linear-gradient(135deg, #1a0606 0%, #ff2240 130%)',
    accent: '#ff2240',
    note: 'Briefing — cut one, no color.',
  },
  {
    id: 'dream',
    title: 'Altered state walk',
    kind: 'Instrument',
    duration: '2:04',
    poster: 'linear-gradient(135deg, #0a0a1e 0%, #7c3aed 130%)',
    accent: '#a855f7',
    note: 'DreamFrame — live session recording.',
  },
  {
    id: 'forge',
    title: 'The Forge // scraps',
    kind: 'Process',
    duration: '0:55',
    poster: 'linear-gradient(135deg, #1a1206 0%, #ff8a1f 130%)',
    accent: '#ff8a1f',
    note: 'Failed builds, celebrated.',
  },
  {
    id: 'vector',
    title: 'Play Vector // loop',
    kind: 'Game capture',
    duration: '0:18',
    poster: 'linear-gradient(135deg, #06160f 0%, #10b981 130%)',
    accent: '#10b981',
    note: 'A 60-second arcade slice.',
  },
];

export interface Dispatch {
  id: string;
  date: string;
  tag: string;
  title: string;
  excerpt: string;
}

export const DISPATCHES: Dispatch[] = [
  {
    id: 'd-004',
    date: '2026.05',
    tag: 'DEVLOG',
    title: 'Mycelium pathfinding, rebuilt from scratch',
    excerpt:
      'Bloom\u2019s spores now negotiate the network instead of following it. Notes on the new cost model and why the old one felt dead.',
  },
  {
    id: 'd-003',
    date: '2026.04',
    tag: 'SOUND',
    title: 'Turning a room into an instrument',
    excerpt:
      'How Subject treats reverb as geometry, and the moment a test build started to feel like somewhere real.',
  },
  {
    id: 'd-002',
    date: '2026.03',
    tag: 'STUDIO',
    title: 'Two builders, one guild',
    excerpt:
      'Why we started Z2, what \u201cunclassifiable\u201d actually means to us, and the kind of work we are chasing.',
  },
];
