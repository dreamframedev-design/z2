# Z2 Terminal

**The guild is real. The clearance is earned. The site is alive.**

Z2 Terminal is the audience-facing hub for [Z2](https://github.com/dreamframedev-design/z2) — a creative guild building games, spatial sound technology, interactive consciousness research tools, experimental concepts, film, and things that refuse categories.

Founded by **DreamFrame** builders exploring what a studio can be when the website itself is a synthesizer.

---

## What this is

Not a portfolio brochure. A **live breach interface** into Z2's black-site creative collective:

- **Discover** — Signal Scanner: projects as transmissions, breach to enter
- **Belong** — Clearance tiers, Protocol IDs, Field Orders, shared XP
- **Play** — Web Audio room tone, spatial Subject rack, playable game shards, live binaural programs

### Cells (project divisions)

| Entry | Domain |
|-------|--------|
| `00 Origin` | The guild itself |
| `01 DreamFrame` | Consciousness research instrument |
| `02 Subject` | Spatial sound technology |
| `03 Bloom` | Reverse-TD roguelite (Unity 6) — *a spore's journey* |
| `04 Play Vector` | Web-playable arcade slice |
| `05 Briefing` | Film & moving image |
| `06 The Forge` | Process & dev logs |
| `?? Anomaly` | Experiments (witness-only) |

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

1. Complete boot sequence  
2. Accept spatial monitoring (headphones recommended)  
3. Breach cells from the Signal Scanner  
4. Request clearance for Associate status  

```bash
npm run build   # production build
npm run start   # serve production
```

---

## Stack

- **Next.js 16** · React 19 · TypeScript  
- **Three.js / R3F** — hypercube sigil, bloom postprocessing  
- **Framer Motion** — breach transitions, boot sequence  
- **Web Audio API** — custom Z2 psychoacoustic engine (room tone, Subject rack, UI synth)  
- **Zustand** — clearance state (persisted locally)  

---

## Roadmap (Epochs)

- **Epoch-01 — The Signal** ← you are here  
- **Epoch-02 — The Forge** — CMS, DreamFrame SSO, Constellation 3D map  
- **Epoch-03 — The Broadcast** — premiere events, film drops  
- **Epoch-04 — The Bridge** — experiments that don't fit any cell  

---

## Repository

```
z2/
├── app/                    # Next.js App Router
├── components/
│   ├── terminal/           # Scanner, sigil, clearance, breach shell
│   ├── cells/              # Per-division breach experiences
│   └── ui/                 # Particles, overlays
└── lib/
    ├── audio/              # Z2AudioEngine
    ├── store/              # Terminal state
    └── cells-data.ts       # Cell registry & Field Orders
```

---

## License

Private — © Z2. All rights reserved.

---

<p align="center">
  <code>[ Z2-SOURCE-LINE // NO CEILING PROTOCOL ACTIVE ]</code><br/>
  <em>The tesseract never stops turning.</em>
</p>
