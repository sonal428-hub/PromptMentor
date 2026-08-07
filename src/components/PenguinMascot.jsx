import React from 'react';

const penguinStyles = `
  /* ─── Penguin Mascot – scoped animation styles ─── */
  .penguin-mascot-stage {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .penguin-mascot-stage svg {
    width: 100%;
    height: 100%;
    overflow: visible;
    display: block;
  }

  /* ---------- shadow ---------- */
  .penguin-mascot-stage #pm-shadow {
    transform-origin: 50% 50%;
    animation: pm-shadow-pulse 1.6s ease-in-out infinite;
  }

  /* ---------- whole-body idle bounce & white glowing border ---------- */
  .penguin-mascot-stage #pm-penguin {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    animation: pm-bounce 2.2s cubic-bezier(.45,0,.55,1) infinite;
    filter: drop-shadow(0 0 1.5px #ffffff) drop-shadow(0 0 3.5px #ffffff) drop-shadow(0 0 7px rgba(255, 255, 255, 0.75));
  }

  @keyframes pm-bounce {
    0%   { transform: matrix(1,0,0,1,0,0); }
    25%  { transform: matrix(1.012,0,0,0.985,0,1.5); }
    50%  { transform: matrix(0.99,0,0,1.02,0,-4); }
    75%  { transform: matrix(1.006,0,0,0.995,0,1); }
    100% { transform: matrix(1,0,0,1,0,0); }
  }

  @keyframes pm-shadow-pulse {
    0%   { transform: matrix(1,0,0,1,0,0); opacity:.32; }
    50%  { transform: matrix(0.94,0,0,0.94,0,0); opacity:.24; }
    100% { transform: matrix(1,0,0,1,0,0); opacity:.32; }
  }

  /* ---------- wings ---------- */
  .penguin-mascot-stage #pm-wing-left {
    transform-origin: 78px 184px;
    animation: pm-flap-left 2.2s ease-in-out infinite;
  }
  .penguin-mascot-stage #pm-wing-right {
    transform-origin: 162px 184px;
    animation: pm-flap-right 2.2s ease-in-out infinite;
  }

  @keyframes pm-flap-left {
    0%,100% { transform: matrix(1,0,0,1,0,0); }
    50%     { transform: matrix(1,-0.05,0.05,1,0,0); }
  }
  @keyframes pm-flap-right {
    0%,100% { transform: matrix(1,0,0,1,0,0); }
    50%     { transform: matrix(1,0.05,-0.05,1,0,0); }
  }

  /* ---------- eyes blink ---------- */
  .penguin-mascot-stage #pm-eye-left,
  .penguin-mascot-stage #pm-eye-right {
    transform-box: fill-box;
    transform-origin: 50% 50%;
    animation: pm-blink 4.4s ease-in-out infinite;
  }
  .penguin-mascot-stage #pm-eye-right { animation-delay: .03s; }

  @keyframes pm-blink {
    0%, 89%, 100% { transform: matrix(1,0,0,1,0,0); }
    92%           { transform: matrix(1,0,0,0.08,0,0); }
    95%           { transform: matrix(1,0,0,1,0,0); }
    96.5%         { transform: matrix(1,0,0,0.08,0,0); }
    98.5%         { transform: matrix(1,0,0,1,0,0); }
  }

  /* ---------- head (needed for sad droop) ---------- */
  .penguin-mascot-stage #pm-head {
    transform-box: fill-box;
    transform-origin: 50% 100%;
  }

  /* ═══════════ HAPPY MODE ═══════════ */
  .penguin-mascot-stage.mode-happy #pm-penguin {
    animation: pm-bounce-happy 1.1s cubic-bezier(.34,1.56,.64,1) infinite;
  }
  .penguin-mascot-stage.mode-happy #pm-shadow {
    animation: pm-shadow-pulse-happy 1.1s ease-in-out infinite;
  }
  .penguin-mascot-stage.mode-happy #pm-wing-left {
    animation: pm-flap-left-happy .9s ease-in-out infinite;
  }
  .penguin-mascot-stage.mode-happy #pm-wing-right {
    animation: pm-flap-right-happy .9s ease-in-out infinite;
  }

  @keyframes pm-bounce-happy {
    0%   { transform: matrix(1,0,0,1,0,0); }
    25%  { transform: matrix(1.05,0,0,0.92,0,4); }
    55%  { transform: matrix(0.94,0,0,1.08,0,-16); }
    80%  { transform: matrix(1.03,0,0,0.96,0,2); }
    100% { transform: matrix(1,0,0,1,0,0); }
  }

  @keyframes pm-shadow-pulse-happy {
    0%   { transform: matrix(1,0,0,1,0,0); opacity:.32; }
    55%  { transform: matrix(0.82,0,0,0.82,0,0); opacity:.18; }
    100% { transform: matrix(1,0,0,1,0,0); opacity:.32; }
  }

  @keyframes pm-flap-left-happy {
    0%, 100% { transform: rotate(0deg); }
    25%      { transform: rotate(-30deg); }
    50%      { transform: rotate(12deg); }
    75%      { transform: rotate(-22deg); }
  }
  @keyframes pm-flap-right-happy {
    0%, 100% { transform: rotate(0deg); }
    25%      { transform: rotate(30deg); }
    50%      { transform: rotate(22deg); }
    75%      { transform: rotate(-22deg); }
  }

  /* ═══════════ WAVE MODE ═══════════ */
  .penguin-mascot-stage.mode-wave #pm-wing-right {
    animation: pm-wave-right 2.4s ease-in-out infinite;
  }

  @keyframes pm-wave-right {
    0%   { transform: rotate(0deg); }
    18%  { transform: rotate(-95deg); }
    30%  { transform: rotate(-85deg); }
    42%  { transform: rotate(-95deg); }
    54%  { transform: rotate(-85deg); }
    66%  { transform: rotate(-95deg); }
    82%  { transform: rotate(-90deg); }
    100% { transform: rotate(0deg); }
  }

  /* ═══════════ SAD MODE ═══════════ */
  .penguin-mascot-stage.mode-sad #pm-head {
    animation: pm-droop 3.2s ease-in-out infinite;
  }
  @keyframes pm-droop {
    0%, 100% { transform: translate(0,0) rotate(0deg); }
    50%      { transform: translate(0,6px) rotate(8deg); }
  }
  .penguin-mascot-stage.mode-sad #pm-eye-left,
  .penguin-mascot-stage.mode-sad #pm-eye-right {
    animation-duration: 8s;
  }
  .penguin-mascot-stage.mode-sad #pm-wing-left {
    animation: pm-flap-left-happy 3.4s ease-in-out infinite;
  }
  .penguin-mascot-stage.mode-sad #pm-wing-right {
    animation: pm-flap-right-happy 3.4s ease-in-out infinite;
  }

  /* ═══════════ reduced motion ═══════════ */
  @media (prefers-reduced-motion: reduce) {
    .penguin-mascot-stage #pm-penguin,
    .penguin-mascot-stage #pm-shadow,
    .penguin-mascot-stage #pm-wing-left,
    .penguin-mascot-stage #pm-wing-right,
    .penguin-mascot-stage #pm-eye-left,
    .penguin-mascot-stage #pm-eye-right,
    .penguin-mascot-stage #pm-head {
      animation: none !important;
    }
  }
`;

/**
 * Penguin mascot with idle / happy / wave / sad animation modes.
 * @param {{ mode: 'idle'|'happy'|'wave'|'sad' }} props
 */
export default function PenguinMascot({ mode = 'idle' }) {
  const modeClass = mode !== 'idle' ? `mode-${mode}` : '';

  return (
    <>
      <style>{penguinStyles}</style>
      <div className={`penguin-mascot-stage ${modeClass}`}>
        <svg viewBox="15 30 210 260" xmlns="http://www.w3.org/2000/svg">
          {/* ground shadow */}
          <ellipse id="pm-shadow" cx="120" cy="272" rx="54" ry="10" fill="#000000" />

          <g id="pm-penguin">
            {/* feet */}
            <ellipse cx="97"  cy="258" rx="18" ry="10" fill="#e07d0e" />
            <ellipse cx="143" cy="258" rx="18" ry="10" fill="#e07d0e" />
            <ellipse cx="97"  cy="255" rx="18" ry="10" fill="#ff9e2c" />
            <ellipse cx="143" cy="255" rx="18" ry="10" fill="#ff9e2c" />

            {/* wing left */}
            <g id="pm-wing-left">
              <path
                d="M78,178 C60,175 40,182 32,196 C28,203 30,211 37,211 C48,211 62,200 75,189 C79,186 80,181 78,178 Z"
                fill="#1c2530"
              />
            </g>

            {/* wing right */}
            <g id="pm-wing-right">
              <path
                d="M162,178 C180,175 200,182 208,196 C212,203 210,211 203,211 C192,211 178,200 165,189 C161,186 160,181 162,178 Z"
                fill="#1c2530"
              />
            </g>

            {/* lower body */}
            <ellipse cx="120" cy="196" rx="74" ry="66" fill="#1c2530" />

            {/* belly */}
            <ellipse cx="120" cy="208" rx="50" ry="50" fill="#ffffff" />
            <ellipse cx="120" cy="220" rx="50" ry="32" fill="#e9eef3" opacity=".55" />

            {/* head group */}
            <g id="pm-head">
              <ellipse cx="120" cy="104" rx="66" ry="52" fill="#1c2530" />
              <ellipse cx="120" cy="108" rx="46" ry="36" fill="#ffffff" />

              {/* blush */}
              <ellipse cx="76"  cy="122" rx="10" ry="6" fill="#ff9d9d" opacity=".55" />
              <ellipse cx="164" cy="122" rx="10" ry="6" fill="#ff9d9d" opacity=".55" />

              {/* beak */}
              <path d="M120 116 L140 131 L120 144 L100 131 Z" fill="#ff9e2c" />
              <path d="M120 131 L140 131 L120 144 L100 131 Z" fill="#e07d0e" />

              {/* eye left */}
              <g id="pm-eye-left">
                <ellipse cx="95" cy="100" rx="14" ry="19" fill="#ffffff" />
                <circle  cx="95" cy="102" r="8"   fill="#12161c" />
                <circle  cx="92" cy="96"  r="3.2" fill="#ffffff" />
                <circle  cx="98" cy="106" r="1.6" fill="#ffffff" opacity=".85" />
              </g>

              {/* eye right */}
              <g id="pm-eye-right">
                <ellipse cx="145" cy="100" rx="14" ry="19" fill="#ffffff" />
                <circle  cx="145" cy="102" r="8"   fill="#12161c" />
                <circle  cx="142" cy="96"  r="3.2" fill="#ffffff" />
                <circle  cx="148" cy="106" r="1.6" fill="#ffffff" opacity=".85" />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </>
  );
}
