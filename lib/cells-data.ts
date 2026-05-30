export type CellId =
  | "origin"
  | "dreamframe"
  | "subject"
  | "games"
  | "film"
  | "anomaly"
  | "forge";

export interface CellSignal {
  id: CellId;
  index: string;
  title: string;
  kicker: string;
  domain: string;
  status: string;
  accent: string;
  accentRgb: string;
  hook: string;
  hidden?: boolean;
  memberOnly?: boolean;
}

/**
 * THE INDEX — Z2's disciplines, presented as editorial entries.
 * One signal red, varied in tone. No per-discipline rainbow.
 */
export const CELLS: CellSignal[] = [
  {
    id: "origin",
    index: "00",
    title: "Origin",
    kicker: "THE GUILD",
    domain: "Who we are",
    status: "OPEN",
    accent: "#e10600",
    accentRgb: "225, 6, 0",
    hook: "Two builders. One guild. Dreaming in public.",
  },
  {
    id: "dreamframe",
    index: "01",
    title: "DreamFrame",
    kicker: "CONSCIOUSNESS",
    domain: "Research instrument",
    status: "LIVE",
    accent: "#ff3b1f",
    accentRgb: "255, 59, 31",
    hook: "A research instrument for altered states. Listen — it's real.",
  },
  {
    id: "subject",
    index: "02",
    title: "Subject",
    kicker: "SOUND",
    domain: "Spatial audio",
    status: "LIVE",
    accent: "#c81912",
    accentRgb: "200, 25, 18",
    hook: "We build sound that is a place, not a track.",
  },
  {
    id: "games",
    index: "03",
    title: "Play Vector",
    kicker: "GAMES",
    domain: "Interactive worlds",
    status: "MEMBER",
    accent: "#ff5436",
    accentRgb: "255, 84, 54",
    hook: "Worlds you operate, not just watch. Play the slice.",
    memberOnly: true,
  },
  {
    id: "film",
    index: "04",
    title: "Briefing",
    kicker: "FILM",
    domain: "Moving image",
    status: "OPEN",
    accent: "#b0060b",
    accentRgb: "176, 6, 11",
    hook: "Evidence, not gallery. Scroll to declassify.",
  },
  {
    id: "forge",
    index: "05",
    title: "The Forge",
    kicker: "PROCESS",
    domain: "How it's made",
    status: "MEMBER",
    accent: "#e10600",
    accentRgb: "225, 6, 0",
    hook: "Failed experiments, celebrated. The making, unhidden.",
    memberOnly: true,
  },
  {
    id: "anomaly",
    index: "??",
    title: "Anomaly",
    kicker: "UNCLASSIFIED",
    domain: "It breaks the rules",
    status: "WITNESSED",
    accent: "#ff2d6b",
    accentRgb: "255, 45, 107",
    hook: "Not listed. Found. The rules end here.",
    hidden: true,
  },
];

export const FIELD_ORDERS = [
  {
    id: "FO-001",
    title: "Tune in",
    objective: "Enable sound and open three entries.",
    reward: "Access 01",
  },
  {
    id: "FO-002",
    title: "First signal",
    objective: "Open DreamFrame and start a session.",
    reward: "Fragment",
  },
  {
    id: "FO-003",
    title: "Hold the orbit",
    objective: "Keep the Subject field open for 30 seconds.",
    reward: "Evidence",
  },
];

export function generateProtocolId(): string {
  const hex = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `Z2-${hex}`;
}
