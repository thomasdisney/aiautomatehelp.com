// The homepage illustration: an open junk drawer seen from above, with the
// computers this product is for. Inline SVG, no image files. The one motion
// on the page (drawer slides open, the laptop light turns on) lives in
// globals.css under .drawer-* and is off for prefers-reduced-motion.

function Tape({ x, y, w, text, rotate = 0 }: { x: number; y: number; w: number; text: string; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} className="drawer-tape">
      <rect x="0" y="0" width={w} height="32" rx="2" fill="#1E44A0" />
      <rect x="0" y="0" width={w} height="3" fill="#2B57C2" />
      <text x={w / 2} y="23" textAnchor="middle" fill="#0F2A6B" className="drawer-tape-shadow">
        {text}
      </text>
      <text x={w / 2} y="22" textAnchor="middle" fill="#FFFFFF">
        {text}
      </text>
    </g>
  );
}

export function JunkDrawer() {
  return (
    <svg
      className="drawer"
      viewBox="0 0 560 500"
      role="img"
      aria-labelledby="drawer-title"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="drawer-title">
        An open junk drawer holding an old laptop, a Chromebook and a small Windows 10 PC, each with a
        label-maker tag, next to rubber bands and a battery. The laptop is plugged in and its power light is on.
      </title>
      <defs>
        <pattern id="liner" width="18" height="18" patternUnits="userSpaceOnUse">
          <rect width="18" height="18" fill="#F7F9F5" />
          <path d="M0 9h18M9 0v18" stroke="#DCE3DC" strokeWidth="1" />
        </pattern>
        <radialGradient id="led-glow">
          <stop offset="0" stopColor="#F2C230" stopOpacity="0.9" />
          <stop offset="1" stopColor="#F2C230" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="drawer-slide">
        {/* drawer box */}
        <rect x="24" y="0" width="512" height="452" rx="6" fill="#9A6136" />
        <rect x="40" y="0" width="480" height="420" fill="url(#liner)" />
        <path d="M40 0v420h480V0" fill="none" stroke="#7C4C29" strokeWidth="3" />

        {/* charger: brick in the corner, cable looped over to the laptop's side port */}
        <g>
          <path
            d="M350 272c40 2 66 36 38 50s-46-24-14-34 66 18 54 52"
            fill="none"
            stroke="#1D2A30"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <g transform="translate(410 340) rotate(10)">
            <rect x="0" y="0" width="76" height="46" rx="7" fill="#2E3A40" />
            <rect x="8" y="8" width="60" height="4" rx="2" fill="#46545B" />
          </g>
        </g>

        {/* rubber bands */}
        <ellipse cx="96" cy="372" rx="26" ry="14" fill="none" stroke="#C0392B" strokeWidth="3.5" transform="rotate(-18 96 372)" />
        <ellipse cx="112" cy="380" rx="22" ry="12" fill="none" stroke="#C9A227" strokeWidth="3.5" transform="rotate(22 112 380)" />

        {/* AA battery */}
        <g transform="translate(250 372) rotate(-8)">
          <rect x="0" y="0" width="64" height="20" rx="4" fill="#3A4A52" />
          <rect x="44" y="0" width="20" height="20" rx="3" fill="#B87333" />
          <rect x="64" y="6" width="5" height="8" rx="1.5" fill="#8F959A" />
        </g>

        {/* Chromebook (back left, lighter shell) */}
        <g transform="translate(64 40) rotate(-7)">
          <rect x="0" y="0" width="200" height="132" rx="10" fill="#B7C0C4" />
          <rect x="0" y="0" width="200" height="132" rx="10" fill="none" stroke="#97A2A7" strokeWidth="2" />
          <circle cx="100" cy="64" r="11" fill="none" stroke="#97A2A7" strokeWidth="3" />
          <Tape x={26} y={88} w={148} text="Chromebook" />
        </g>

        {/* Windows 10 mini PC (back right) */}
        <g transform="translate(316 36) rotate(6)">
          <rect x="0" y="0" width="156" height="128" rx="6" fill="#2A353B" />
          <g stroke="#3E4C53" strokeWidth="3" strokeLinecap="round">
            <path d="M22 22h112M22 34h112M22 46h112M22 58h112" />
          </g>
          <circle cx="144" cy="106" r="5" fill="#3E4C53" />
          <Tape x={8} y={80} w={124} text="Windows 10" />
        </g>

        {/* old laptop (front, the one that is on) */}
        <g transform="translate(118 168) rotate(3)">
          <rect x="0" y="0" width="250" height="168" rx="12" fill="#45525A" />
          <rect x="8" y="8" width="234" height="152" rx="8" fill="#4E5C64" />
          <rect x="0" y="160" width="250" height="10" rx="4" fill="#36424A" />
          <circle cx="34" cy="164" r="22" fill="url(#led-glow)" className="drawer-led-glow" />
          <circle cx="34" cy="164" r="3.5" fill="#F2C230" className="drawer-led" />
          <Tape x={50} y={64} w={150} text="Old laptop" rotate={-2} />
        </g>
      </g>

      {/* counter edge the drawer slides out from */}
      <rect x="0" y="0" width="560" height="14" fill="#1D2A30" />
      {/* drawer front and pull */}
      <g className="drawer-slide">
        <rect x="8" y="440" width="544" height="56" rx="6" fill="#875230" />
        <rect x="8" y="440" width="544" height="6" fill="#A8703F" />
        <rect x="214" y="458" width="132" height="16" rx="8" fill="#1D2A30" />
        <rect x="222" y="461" width="116" height="4" rx="2" fill="#46545B" />
      </g>
    </svg>
  );
}
