'use client';

import { useEffect, useRef } from 'react';

/**
 * PHOTON FIELD — the sigil's power network.
 *
 * A single screen-blended <canvas> sits just above the badge. It etches a
 * network of rune / circuit pathways that radiate from the dark and carve
 * through the mark, with photons (white-hot heads + brand-gradient comet tails)
 * travelling the lines. Screen blending means every stroke ADDS light: glowing
 * gradients course over the sigil and conduits ignite the void around it.
 *
 * Brand spectrum, warm → cool: cinnabar → strawberry → crimson → ruby →
 * magenta → violet, with an electric-cyan photon accent as the high-energy tip.
 *
 * Intro: each pathway is *drawn by* its own photon head (the photon etches the
 * line as it travels), staggered, resolving as the badge locks. Idle: pulses
 * recirculate + rune nodes breathe. Reduced motion: one static etched frame.
 */

const VW = 457.81;
const VH = 434.72;

type RGB = [number, number, number];
const hexToRgb = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgba = ([r, g, b]: RGB, a: number) => `rgba(${r},${g},${b},${a})`;

const C = {
  cinnabar: hexToRgb('#E53530'),
  strawberry: hexToRgb('#E42F32'),
  crimson: hexToRgb('#DB133B'),
  ruby: hexToRgb('#AF052C'),
  ember: hexToRgb('#FF5A1F'),
  magenta: hexToRgb('#FF2E6E'),
  violet: hexToRgb('#9A3BFF'),
  cyan: hexToRgb('#2FE6FF'),
  white: hexToRgb('#FFEDE4'),
};

interface StrokeDef {
  pts: [number, number][];
  smooth?: boolean;
  a: RGB; // gradient start (tail end)
  b: RGB; // gradient end + comet head colour
  w: number; // line width (viewBox units)
  t0: number; // etch start offset (s)
  dur: number; // etch duration (s)
  idle: number; // seconds between idle pulses
  main?: boolean; // spine traces carry the travelling photons
}

// A pad / via where a trace terminates.
interface Pad {
  x: number;
  y: number;
  r: number;
  c: RGB;
  ring: boolean;
  at: number; // ignite time (s)
}

// Seeded PRNG → the circuit is intricate but deterministic (same every load).
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Principal routes that lie ON the logo's own strokes (slash, top bar, the 2).
// The circuit grows fine branch-traces off these; the whole field is masked to
// the silhouette, so any trace that runs past an edge is clipped cleanly — it
// reads like a board routing to its border. Warm tones only.
const SPINES: { pts: [number, number][]; a: RGB; b: RGB; lanes: number; half: number }[] = [
  // the slash — a wide bus of parallel current lanes
  { pts: [[262, 140], [205, 225], [150, 305], [104, 360], [150, 387], [206, 392]], a: C.cinnabar, b: C.ember, lanes: 5, half: 15 },
  // top bar
  { pts: [[82, 64], [190, 62], [300, 62]], a: C.crimson, b: C.strawberry, lanes: 3, half: 8.5 },
  // the "2"
  { pts: [[348, 128], [396, 188], [380, 266], [300, 306], [256, 310]], a: C.ember, b: C.cinnabar, lanes: 4, half: 11 },
];

interface Path {
  d: [number, number][]; // densified points
  cum: number[]; // cumulative length
  len: number;
  def: StrokeDef;
}

function densify(pts: [number, number][], smooth: boolean): [number, number][] {
  if (pts.length < 2) return pts.slice();
  const out: [number, number][] = [];
  if (smooth) {
    const p = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2);
      const steps = 26;
      for (let s = 0; s < steps; s++) {
        const t = s / steps, t2 = t * t, t3 = t2 * t;
        const x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
        const y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
        out.push([x, y]);
      }
    }
    out.push(pts[pts.length - 1]);
  } else {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      const d = Math.hypot(bx - ax, by - ay);
      const steps = Math.max(2, Math.round(d / 5));
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        out.push([ax + (bx - ax) * t, ay + (by - ay) * t]);
      }
    }
    out.push(pts[pts.length - 1]);
  }
  return out;
}

function buildPath(pts: [number, number][], def: StrokeDef): Path {
  const d = densify(pts, !!def.smooth);
  const cum = [0];
  for (let i = 1; i < d.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(d[i][0] - d[i - 1][0], d[i][1] - d[i - 1][1]));
  }
  return { d, cum, len: cum[cum.length - 1], def };
}

// Build a COHERENT flowing lattice: each logo stroke becomes a bus of parallel
// current-lanes; regular cross-rungs + vias tie them together; fine micro-traces
// add density; concentric hubs mark where strokes meet. Energy flows ALONG the
// form — it reads as intentional circuitry, not random spurs. Masked to the mark.
function buildCircuit(): { paths: Path[]; pads: Pad[] } {
  const rand = mulberry32(13);
  type Seg = { pts: [number, number][]; a: RGB; b: RGB; w: number; main: boolean };
  const segs: Seg[] = [];
  const pads: Pad[] = [];

  const normalAt = (pts: [number, number][], i: number): [number, number] => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const tx = b[0] - a[0], ty = b[1] - a[1];
    const tl = Math.hypot(tx, ty) || 1;
    return [-ty / tl, tx / tl];
  };

  for (const s of SPINES) {
    const center = densify(s.pts, true);
    const L = center.length;
    const mid = Math.floor(s.lanes / 2);

    // 1) parallel lanes flowing along the stroke (the bus)
    for (let k = 0; k < s.lanes; k++) {
      const off = s.lanes > 1 ? (k / (s.lanes - 1) - 0.5) * 2 * s.half : 0;
      const pts = center.map((pt, i): [number, number] => {
        const [nx, ny] = normalAt(center, i);
        return [pt[0] + nx * off, pt[1] + ny * off];
      });
      const main = k === mid;
      segs.push({ pts, a: s.a, b: s.b, w: main ? 1.0 : 0.5, main });
    }

    // 2) cross-rungs at regular intervals + vias
    const step = Math.max(6, Math.floor(L / 13));
    let rungIdx = 0;
    for (let i = step; i < L - step; i += step, rungIdx++) {
      const [nx, ny] = normalAt(center, i);
      const [cx, cy] = center[i];
      segs.push({
        pts: [[cx - nx * s.half, cy - ny * s.half], [cx + nx * s.half, cy + ny * s.half]],
        a: s.a, b: s.b, w: 0.42, main: false,
      });
      pads.push({ x: cx + nx * s.half, y: cy + ny * s.half, r: 1.0, c: s.b, ring: false, at: 0 });
      pads.push({ x: cx - nx * s.half, y: cy - ny * s.half, r: 1.0, c: s.b, ring: false, at: 0 });
      if (rungIdx % 2 === 0) pads.push({ x: cx, y: cy, r: 1.5, c: C.white, ring: true, at: 0 });
    }

    // 3) fine micro-traces slanting along the flow (texture / density)
    for (let i = Math.floor(step / 2); i < L - step; i += step) {
      if (rand() < 0.4) continue;
      const j = Math.min(L - 1, i + Math.floor(step * 0.7));
      const [nx, ny] = normalAt(center, i);
      const [nx2, ny2] = normalAt(center, j);
      const o1 = (rand() - 0.5) * 1.7 * s.half;
      const o2 = o1 + (rand() < 0.5 ? 1 : -1) * s.half * (0.4 + rand() * 0.4);
      segs.push({
        pts: [[center[i][0] + nx * o1, center[i][1] + ny * o1], [center[j][0] + nx2 * o2, center[j][1] + ny2 * o2]],
        a: s.a, b: s.b, w: 0.38, main: false,
      });
    }
  }

  // 4) junction hubs — concentric arcs where strokes meet
  const HUBS: [number, number][] = [[262, 142], [300, 62], [348, 130], [206, 392], [256, 310]];
  for (const [hx, hy] of HUBS) {
    for (let ri = 0; ri < 2; ri++) {
      const rr = 5 + ri * 4;
      const a0 = rand() * Math.PI * 2;
      const a1 = a0 + 1.7 + rand() * 1.5;
      const arc: [number, number][] = [];
      for (let t = 0; t <= 9; t++) {
        const aa = a0 + ((a1 - a0) * t) / 9;
        arc.push([hx + Math.cos(aa) * rr, hy + Math.sin(aa) * rr]);
      }
      segs.push({ pts: arc, a: C.ember, b: C.cinnabar, w: 0.5, main: false });
    }
    pads.push({ x: hx, y: hy, r: 2, c: C.white, ring: true, at: 0 });
  }

  // etch order — a diagonal sweep echoing the slash (top-right → bottom-left)
  const sweep = (x: number, y: number) => -x * 0.45 + y;
  const rep = (pts: [number, number][]) => pts[Math.floor(pts.length / 2)];
  let lo = Infinity, hi = -Infinity;
  for (const s of segs) { const [x, y] = rep(s.pts); const v = sweep(x, y); if (v < lo) lo = v; if (v > hi) hi = v; }
  for (const p of pads) { const v = sweep(p.x, p.y); if (v < lo) lo = v; if (v > hi) hi = v; }
  const norm = (v: number) => (v - lo) / ((hi - lo) || 1);
  const T0 = 0.2, SPAN = 1.7;

  const paths: Path[] = segs.map((s) => {
    const [rx, ry] = rep(s.pts);
    const t0 = T0 + norm(sweep(rx, ry)) * SPAN;
    const def: StrokeDef = {
      pts: s.pts,
      smooth: s.pts.length > 2,
      a: s.a,
      b: s.b,
      w: s.w,
      t0,
      dur: s.main ? 1.0 : 0.4,
      idle: s.main ? 5 + rand() * 3 : 99,
      main: s.main,
    };
    return buildPath(s.pts, def);
  });
  for (const p of pads) p.at = T0 + norm(sweep(p.x, p.y)) * SPAN + 0.12;

  return { paths, pads };
}

function posAt(path: Path, dist: number): { x: number; y: number; i: number } {
  const { d, cum } = path;
  const dd = Math.max(0, Math.min(path.len, dist));
  let i = 1;
  while (i < cum.length && cum[i] < dd) i++;
  i = Math.min(i, d.length - 1);
  const seg = cum[i] - cum[i - 1] || 1;
  const t = (dd - cum[i - 1]) / seg;
  return { x: d[i - 1][0] + (d[i][0] - d[i - 1][0]) * t, y: d[i - 1][1] + (d[i][1] - d[i - 1][1]) * t, i };
}

interface Transform {
  s: number;
  ox: number;
  oy: number;
}

export default function PhotonField({
  delay = 0.6,
  reduce = false,
  lite = false,
}: {
  delay?: number;
  reduce?: boolean;
  lite?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    (window as unknown as { __photonV?: number }).__photonV = 11;

    const { paths, pads } = buildCircuit();
    let tf: Transform = { s: 1, ox: 0, oy: 0 };
    let dpr = 1;
    let raf = 0;
    let startT = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      let cw = rect.width;
      let ch = rect.height;
      // an inset element can measure 0 before layout settles — fall back to the
      // parent box (the badge), scaled up to the canvas's -inset-[40%] size.
      if (!cw && canvas.parentElement) {
        const pr = canvas.parentElement.getBoundingClientRect();
        cw = pr.width;
        ch = pr.height;
      }
      if (!cw) return;
      dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.1 : 1.4);
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      // canvas == badge box; the viewBox maps straight onto it (the CSS mask
      // confines every stroke to the logo silhouette).
      const s = cw / VW;
      tf = { s, ox: 0, oy: 0 };
    };

    const X = (x: number) => tf.ox + x * tf.s;
    const Y = (y: number) => tf.oy + y * tf.s;

    // Glow without shadowBlur: layered translucent strokes under 'lighter'
    // compositing accumulate into a soft halo. Cheap + 60fps-safe.
    const tracePath = (p: Path, upto: number) => {
      ctx.beginPath();
      ctx.moveTo(X(p.d[0][0]), Y(p.d[0][1]));
      for (let i = 1; i < p.d.length; i++) {
        if (p.cum[i] > upto) break;
        ctx.lineTo(X(p.d[i][0]), Y(p.d[i][1]));
      }
    };

    const drawBase = (p: Path, frac: number, glow: number) => {
      const upto = frac * p.len;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const grad = ctx.createLinearGradient(X(p.d[0][0]), Y(p.d[0][1]), X(p.d[p.d.length - 1][0]), Y(p.d[p.d.length - 1][1]));
      grad.addColorStop(0, rgba(p.def.a, 0));
      grad.addColorStop(0.5, rgba(p.def.a, 1));
      grad.addColorStop(1, rgba(p.def.b, 1));
      tracePath(p, upto);
      // tight underglow — narrow enough that parallel traces stay distinct
      ctx.strokeStyle = grad;
      ctx.globalAlpha = 0.05 * glow;
      ctx.lineWidth = p.def.w * tf.s * 1.9;
      ctx.stroke();
      // mid colour body
      ctx.globalAlpha = 0.28 * glow;
      ctx.lineWidth = p.def.w * tf.s * 0.9;
      ctx.stroke();
      // fine hot core
      ctx.strokeStyle = rgba(C.white, 0.5);
      ctx.globalAlpha = 0.52 * glow;
      ctx.lineWidth = Math.max(0.55, p.def.w * tf.s * 0.36);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    // comet head riding the path at `dist` — layered strokes + radial tip
    const drawComet = (p: Path, dist: number, intensity = 1) => {
      const tail = Math.min(p.len * 0.5, 80);
      const N = 10;
      ctx.lineCap = 'round';
      for (let k = 0; k < N; k++) {
        const f0 = k / N, f1 = (k + 1) / N;
        const a = posAt(p, dist - tail * (1 - f0));
        const b = posAt(p, dist - tail * (1 - f1));
        const al = f1 * f1 * intensity;
        ctx.beginPath();
        ctx.moveTo(X(a.x), Y(a.y));
        ctx.lineTo(X(b.x), Y(b.y));
        // glow pass
        ctx.strokeStyle = rgba(p.def.b, al * 0.5);
        ctx.lineWidth = (1 + f1 * p.def.w * 2.6) * tf.s;
        ctx.stroke();
        // hot core pass
        ctx.strokeStyle = rgba(C.white, al * 0.5);
        ctx.lineWidth = (0.4 + f1 * p.def.w * 0.7) * tf.s;
        ctx.stroke();
      }
      // white-hot tip via radial gradient (no shadowBlur)
      const h = posAt(p, dist);
      const hx = X(h.x), hy = Y(h.y), gr = Math.max(5, p.def.w * tf.s * 5.5);
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, gr);
      g.addColorStop(0, rgba(C.white, 0.95 * intensity));
      g.addColorStop(0.3, rgba(p.def.b, 0.7 * intensity));
      g.addColorStop(1, rgba(p.def.b, 0));
      ctx.fillStyle = g;
      ctx.fillRect(hx - gr, hy - gr, gr * 2, gr * 2);
    };

    const drawPad = (pad: Pad, alpha: number) => {
      const x = X(pad.x), y = Y(pad.y), r = Math.max(0.7, pad.r * tf.s);
      // soft backing halo
      const gr = r * 3.2;
      const halo = ctx.createRadialGradient(x, y, 0, x, y, gr);
      halo.addColorStop(0, rgba(pad.c, 0.5 * alpha));
      halo.addColorStop(1, rgba(pad.c, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(x - gr, y - gr, gr * 2, gr * 2);
      if (pad.ring) {
        ctx.strokeStyle = rgba(pad.c, alpha);
        ctx.lineWidth = Math.max(0.6, 0.7 * tf.s);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = rgba(C.white, 0.85 * alpha);
        ctx.beginPath();
        ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = rgba(pad.c, 0.5 * alpha);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgba(C.white, 0.85 * alpha);
        ctx.beginPath();
        ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const smooth = (a: number, b: number, x: number) => {
      const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };

    const render = (t: number, withComets = true, baseGlow = 1) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';

      for (const p of paths) {
        const local = t - p.def.t0;
        const etch = reduce ? 1 : smooth(0, p.def.dur, local);
        if (etch <= 0) continue;
        const glow = (reduce ? 0.8 : 0.5 + 0.5 * smooth(0, 0.4, local)) * baseGlow;
        drawBase(p, etch, glow);

        if (reduce || !withComets || !p.def.main) continue;

        // travelling photon — only on the main spine traces
        if (etch < 1) {
          drawComet(p, etch * p.len, 1);
        } else {
          const since = local - p.def.dur;
          const phase = (since % p.def.idle) / p.def.idle;
          const active = 0.3;
          if (phase < active) {
            const fade = Math.sin((phase / active) * Math.PI);
            drawComet(p, (phase / active) * p.len, 0.5 + fade * 0.5);
          }
        }
      }

      // vias / pads — ignite as their trace reaches them
      for (const pad of pads) {
        const a = reduce ? 0.8 : smooth(pad.at, pad.at + 0.3, t);
        if (a <= 0) continue;
        const tw = reduce ? 1 : 0.78 + 0.22 * Math.sin(t * 1.5 + pad.x * 0.3);
        drawPad(pad, a * tw * baseGlow);
      }

      // sigil heart — a faint warm core within the mark
      const heart =
        (reduce ? 0.4 : smooth(1.1, 1.7, t) * (0.7 + 0.3 * Math.sin(t * 1.1))) * baseGlow;
      if (heart > 0) {
        const hx = X(228), hy = Y(214), hr = 58 * tf.s;
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
        g.addColorStop(0, rgba(C.ember, 0.3 * heart));
        g.addColorStop(0.4, rgba(C.cinnabar, 0.13 * heart));
        g.addColorStop(1, rgba(C.cinnabar, 0));
        ctx.fillStyle = g;
        ctx.fillRect(hx - hr, hy - hr, hr * 2, hr * 2);
      }

      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
    };

    // ETCH then IDLE. During the ~2.5s etch the whole network is redrawn each
    // frame. Once etched, the static base is snapshotted to an offscreen canvas;
    // idle frames just blit that snapshot and redraw the cheap moving photons —
    // so energy keeps flowing forever at near-zero cost (60fps on every device).
    const ETCH_DONE = 2.7;
    let baseSnap: HTMLCanvasElement | null = null;

    const snapshotBase = () => {
      render(ETCH_DONE, false, 0.42); // FAINT settled base → just a whisper of etching
      const s = document.createElement('canvas');
      s.width = canvas.width;
      s.height = canvas.height;
      s.getContext('2d')?.drawImage(canvas, 0, 0);
      baseSnap = s;
    };

    const drawIdleComets = (t: number) => {
      for (const p of paths) {
        if (!p.def.main) continue; // only the spines carry idle pulses
        const since = t - p.def.t0 - p.def.dur;
        const phase = (((since % p.def.idle) + p.def.idle) % p.def.idle) / p.def.idle;
        const active = 0.28; // a single light travels, then the mark rests
        if (phase < active) {
          const fade = Math.sin((phase / active) * Math.PI);
          drawComet(p, (phase / active) * p.len, 0.4 + fade * 0.5);
        }
      }
    };

    const loop = (now: number) => {
      if (!startT) startT = now;
      const t = (now - startT) / 1000 - delay;
      if (t < ETCH_DONE) {
        render(Math.max(0, t), true); // full etch
      } else {
        if (!baseSnap) snapshotBase();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(baseSnap as HTMLCanvasElement, 0, 0);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = 'lighter';
        drawIdleComets(t);
        ctx.globalCompositeOperation = 'source-over';
      }
      raf = requestAnimationFrame(loop);
    };

    const onResize = () => {
      resize();
      baseSnap = null; // size changed → re-snapshot the base next idle frame
      if (reduce) render(3, false);
    };

    // ResizeObserver fires once layout is ready (fixes a 0-width first measure)
    // and on every size change thereafter.
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    resize();
    if (reduce) {
      render(3, false); // static etched sigil, no motion
    } else {
      render(ETCH_DONE, false, 0.42); // instant settled frame; rAF intro draws over it
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [delay, reduce, lite]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      // masked to the logo silhouette → every filament is etched ON the mark,
      // never in the void; screen-blended so it adds light to the red body.
      className="z2-mask pointer-events-none absolute inset-0 h-full w-full"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
