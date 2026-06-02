import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'Z2 — We build worlds.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const ASPECT = 457.81 / 434.72;

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), 'public', 'z2-logo.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;
  const logoH = 240;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0a0a0b',
          color: '#eceae6',
          padding: 80,
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* red forge glow */}
        <div
          style={{
            position: 'absolute',
            top: -180,
            right: -120,
            width: 760,
            height: 760,
            background:
              'radial-gradient(circle, rgba(255,90,31,0.30), rgba(255,34,64,0.16) 38%, rgba(255,34,64,0) 68%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -260,
            left: -160,
            width: 720,
            height: 720,
            background:
              'radial-gradient(circle, rgba(255,34,64,0.20), rgba(255,34,64,0) 66%)',
            display: 'flex',
          }}
        />

        {/* top label */}
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#8f8c87',
          }}
        >
          Z2 // Independent creative guild
        </div>

        {/* logo + headline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <img src={logoSrc} width={logoH * ASPECT} height={logoH} alt="Z2" style={{ marginBottom: 36 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: 104, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>
            <span>We build&nbsp;</span>
            <span style={{ color: '#ff5a1f' }}>worlds.</span>
          </div>
        </div>

        {/* baseline */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              height: 4,
              width: 280,
              background: 'linear-gradient(90deg, #ff2240, #ff5a1f)',
            }}
          />
          <div style={{ display: 'flex', fontSize: 22, letterSpacing: 4, color: '#8f8c87' }}>
            Games · Sound · Film · Tools
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
