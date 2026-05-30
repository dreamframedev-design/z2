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
  codename: string;
  designation: string;
  domain: string;
  frequency: string;
  clearance: string;
  accent: string;
  accentRgb: string;
  hook: string;
  hidden?: boolean;
}

export const CELLS: CellSignal[] = [
  {
    id: "origin",
    codename: "SOURCE-LINE-ZERO",
    designation: "ORIGIN-FILE",
    domain: "The Guild Itself",
    frequency: "Founding",
    clearance: "L0 PUBLIC",
    accent: "text-amber-400",
    accentRgb: "251, 191, 36",
    hook: "Who we are. Why the Terminal exists. Dream with us.",
  },
  {
    id: "dreamframe",
    codename: "DF-CARRIER-WAVE",
    designation: "DF-CELL",
    domain: "Consciousness OS",
    frequency: "40Hz",
    clearance: "L0 PUBLIC",
    accent: "text-indigo-400",
    accentRgb: "129, 140, 248",
    hook: "Live spatial audio lab — these aren't mockups.",
  },
  {
    id: "subject",
    codename: "SUBJECT-NULL-ZERO",
    designation: "SUBJECT-NULL",
    domain: "Spatial Sound Tech",
    frequency: "Orbital",
    clearance: "L0 PUBLIC",
    accent: "text-emerald-400",
    accentRgb: "52, 211, 153",
    hook: "Patch the rack. Operate the impossible.",
  },
  {
    id: "games",
    codename: "PLAY-VECTOR-07",
    designation: "PLAY-VECTOR",
    domain: "Interactive Worlds",
    frequency: "Shard",
    clearance: "L1 ASSOCIATE",
    accent: "text-cyan-400",
    accentRgb: "34, 211, 238",
    hook: "Play the slice. Not the trailer.",
  },
  {
    id: "film",
    codename: "BRIEFING-SLATE-03",
    designation: "BRIEFING-SLATE",
    domain: "Moving Image",
    frequency: "Cinematic",
    clearance: "L0 PUBLIC",
    accent: "text-rose-400",
    accentRgb: "251, 113, 133",
    hook: "Evidence, not gallery. Briefing mode.",
  },
  {
    id: "forge",
    codename: "FORGE-LOG-INTERNAL",
    designation: "FORGE-LOG",
    domain: "Process / Dev",
    frequency: "Transmission",
    clearance: "L2 OPERATIVE",
    accent: "text-amber-400",
    accentRgb: "251, 191, 36",
    hook: "How the impossible gets made.",
  },
  {
    id: "anomaly",
    codename: "Z2-ANOMALY-UNCLASSIFIED",
    designation: "UNCLASSIFIED",
    domain: "Random Experiments",
    frequency: "Glitch",
    clearance: "WITNESSED",
    accent: "text-fuchsia-400",
    accentRgb: "232, 121, 249",
    hook: "Found, not listed. Rules break here.",
    hidden: true,
  },
];

export const FIELD_ORDERS = [
  {
    id: "FO-001",
    title: "Anchor Installation Protocol",
    objective: "Enable spatial monitoring and scan three signals.",
    reward: "+120 XP · Subject patch unlock",
  },
  {
    id: "FO-002",
    title: "Carrier Sequence // Part I",
    objective: "Breach DF-CELL and initiate room tone program.",
    reward: "+240 XP · Lore fragment",
  },
  {
    id: "FO-003",
    title: "Orbit Hold",
    objective: "Maintain Subject orbital pan for 30 seconds.",
    reward: "+180 XP · Clearance evidence",
  },
];

export function generateProtocolId(): string {
  const hex = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `Z2-ASSOC-${hex}`;
}
