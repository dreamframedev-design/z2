# Z2 — The Whole Picture

> **Z2 is a guild and a gateway.** A two-person indie studio on the surface; underneath, a
> living hub where gamers, developers, designers, musicians, and explorers connect, vote,
> co-create, and ship strange new worlds together. This document is the north star — what
> we're building globally, and the order we build it in.

---

## 0. North star

**"We build worlds — together, in the open."**

Z2 is not a portfolio site. It's the *front door to a creative operating system*:

- a **brand showcase** that feels like a high-end game-studio title sequence (this site),
- a **guild** — membership, identity, reputation, ranks, game mechanics,
- a **commons** — boards, voting, and governance where the community decides what gets built,
- an **engine** — agentic automation that turns accepted ideas into real, shipped projects,
- a **studio in public** — games, the *Exos* film series, DreamFrame, spatial-sound tech,
- and a **live instrument** — collaborative, networked sound creation across the planet.

Everything below ladders up to that.

---

## 1. The pillars

### Pillar I — Identity & the Guild
Who you are inside Z2.
- **Accounts & auth** via Supabase (same stack as DreamFrame → one ecosystem, shared sessions
  possible later). Email + OAuth (Discord, GitHub, Google) — gamers/devs already live there.
- **Game mechanics already seeded** in `lib/store/terminal-store.ts`: `clearance` tiers (L0–L3),
  `xp`, `protocolId`, `breachedCells`, `fieldOrdersComplete`, `witnessedAnomaly`. Today these are
  local/persisted; Phase 1 moves them server-side so they become a real **progression system**.
- **Reputation**: XP + contribution (votes cast, ideas accepted, tasks completed, jams shipped)
  → ranks that unlock clearance, boards, drops, and beta access.
- **Optional web3 layer (later, opt-in, never required to participate):** token-gated tiers,
  on-chain reputation/badges (soulbound), and a guild token used for *signal* (boosting votes,
  funding bounties) — not speculation. Crypto is a **membership & coordination primitive**, bolted
  on only where it adds real utility (provenance, ownership of co-created sound/game assets).

### Pillar II — The Commons (social hub / "the Council")
Where the guild thinks out loud and decides.
- **Boards**: Reddit-style threaded discussion, scoped by world (Games, Sound, Film, DreamFrame,
  Forge/experiments). Posts, comments, reactions, tags.
- **Idea voting**: submit project ideas → the guild upvotes/ranks → top signals surface to the
  studio. Quadratic or reputation-weighted voting so it's not a popularity contest.
- **Task forwarding & bounties**: break an accepted idea into tasks; members claim them, or the
  guild routes them to the agentic engine (Pillar III). Optional bounty funding.
- **Governance**: lightweight, transparent — "what we build next" is a visible, living queue the
  community drives. This is the heart of the "incubator" feel.

### Pillar III — The Engine (agentic automation)
Where decisions become artifacts.
- Accepted ideas / claimed tasks feed an **agentic build pipeline** (Vercel AI SDK + Workflow DevKit
  for durable, resumable, multi-step jobs). Agents scaffold repos, draft designs, generate assets,
  open PRs, and report back to the board.
- **Human-in-the-loop**: the guild reviews/approves agent output; nothing ships unattended.
- **Events & rituals**: automated game jams, sound battles, "48-hour world" sprints — the engine
  spins up the scaffolding, the community fills it with soul.

### Pillar IV — The Worlds (the work itself)
What Z2 actually makes — each a "cell" in the index.
- **Games** — playable experiments; the platform itself can host game mechanics tied to identity.
- **DreamFrame** — the consciousness/altered-states research instrument (live, Supabase-backed).
- **The Exos** — a film series. *Chapter I* now lives on the site (Featured Film section). Future
  chapters get their own home + a behind-the-scenes board.
- **Spatial sound & instruments** — tools for altered perception, and the DAW below.

### Pillar V — The Instrument (community DAW / "JamForge")
The most ambitious, most differentiated pillar — and the one the founder (audio engineer) is built
to lead.
- A **browser-native, community DAW** — not a clone of FL Studio beat battles, but a *new breed*:
  sessions are social objects. You join a room, contribute a stem/loop/pattern, and the piece grows.
- **Networked co-creation across distance** — e.g. an Ableton rig in **Sweden** jamming with one in
  **Long Beach, CA**, in near-real-time. Technical path:
  - **Web Audio + WASM DSP** for the in-browser engine,
  - **WebRTC data + audio** (or a media SFU) for low-latency peer sync,
  - **clock/transport sync** (shared tempo, bar-quantized hand-offs) so latency is musical, not fatal,
  - **bridges to native DAWs** (Ableton Link for tempo/phase; Link is LAN-native, so remote needs a
    relay — a Z2 "Link-over-internet" service — plus optional Max for Live / OSC device).
  - **persistence & provenance**: every session/stem versioned (and optionally signed on-chain so
    co-creators provably own their contributions).
- **Formats**: live "beat battles," open jams, async collab tracks, and curated community releases.

---

## 2. Phased roadmap

**P0 — Brand showcase (now).** The cinematic hero (animated Z2 sigil + photon pathways), the work
index, the reel, the *Exos* film, dispatch, the guild CTA. Make Z2 *feel* like a world worth
entering. ✅ in progress.

**P1 — Accounts & the Commons.** Supabase auth; move progression server-side; ship boards + idea
voting + profiles/ranks. The site stops being a brochure and becomes a *place*. Realtime presence
("who's in the guild right now") via Supabase Realtime.

**P2 — The Engine + live feeds.** Agentic pipeline (AI SDK + Workflow) wired to the voting queue;
project pages with live status pulled from real DBs/APIs; automated events. The guild's decisions
start producing artifacts.

**P3 — JamForge MVP.** Browser DAW with a single shared room, Web Audio engine, WebRTC sync,
tempo-locked hand-offs. One real cross-continent jam as the proof. Then native-DAW bridges.

**P4 — Web3 & ownership (opt-in).** Token-gated tiers, soulbound reputation, signed provenance for
co-created sound/game assets, optional bounty funding. Only where it earns its place.

---

## 3. Tech architecture (grounded in what we already run)

| Concern | Choice | Why |
|---|---|---|
| App / rendering | **Next.js 16 (App Router) on Vercel** | already here; RSC + edge + streaming |
| Auth / DB / realtime | **Supabase** | already proven in DreamFrame; auth + Postgres + Realtime + storage in one |
| Agentic builds | **Vercel AI SDK + Workflow DevKit** | durable, resumable multi-step agent jobs; human-in-loop |
| Live audio | **Web Audio + WASM DSP + WebRTC / SFU** | low-latency, browser-native, no install |
| Native-DAW bridge | **Ableton Link relay + OSC / Max for Live** | tempo/phase sync to real rigs |
| Web3 (later) | **opt-in chain + soulbound rep + signed assets** | provenance & coordination, not speculation |
| Motion / 3D | **framer-motion, three / R3F, canvas FX** | the showcase layer (this site) |

**Design language** stays constant across every surface: void-black canvas, bone type, the signal-red
→ crimson → ruby → midnight-violet spectrum with an electric-cyan photon accent, Space Grotesk +
JetBrains Mono, restrained cinematic motion. The brand is the throughline from the hero sigil to the
guild boards to the DAW.

---

## 4. Connected projects
- **DreamFrame** (`D:\dreamframe`) — sibling Next.js + Supabase app (consciousness/altered-states
  research instrument). Shares the stack and, eventually, identity. Already represented as a cell
  in the Z2 index.
- **The Exos** — film series; Chapter I embedded now; the series gets its own evolving home.

---

*This is a living document. The point of Z2 is that the community helps decide what the next line of
it says. — o7*
