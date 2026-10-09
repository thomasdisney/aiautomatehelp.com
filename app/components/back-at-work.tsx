// The homepage signature: three retired computers sitting on a desk, back at
// work, and the phone that runs them. The machines are inline SVG; the phone is
// real HTML text so it stays sharp and readable. One orchestrated motion: each
// machine's power light comes on in turn and the matching row on the phone
// goes online at the same moment (globals.css, .work-*). Reduced motion shows
// the finished state.

const MACHINES = ["Old laptop", "Windows 10 PC", "Chromebook"] as const;

function Tape({ x, y, w, text }: { x: number; y: number; w: number; text: string }) {
  return (
    <g transform={`translate(${x} ${y})`} className="work-tape">
      <rect width={w} height="32" rx="2" fill="#1E44A0" />
      <rect width={w} height="3" fill="#2B57C2" />
      <text x={w / 2} y="23" textAnchor="middle" fill="#0F2A6B">
        {text}
      </text>
      <text x={w / 2} y="22" textAnchor="middle" fill="#FFFFFF">
        {text}
      </text>
    </g>
  );
}

function Led({ cx, cy, n }: { cx: number; cy: number; n: 1 | 2 | 3 }) {
  return (
    <g className={`work-led work-led-${n}`}>
      <circle cx={cx} cy={cy} r="14" fill="url(#led-glow)" />
      <circle cx={cx} cy={cy} r="4" fill="#F2C230" />
    </g>
  );
}

export function BackAtWork() {
  return (
    <figure
      className="work"
      role="img"
      aria-label="An old laptop, a Windows 10 PC and a Chromebook on a desk with their power lights on. Beside them, a phone lists all three as online, and the old laptop is waiting for your OK."
    >
      <div className="work-inner">
      <svg className="work-desk" viewBox="0 96 440 316" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="led-glow">
            <stop offset="0" stopColor="#F2C230" stopOpacity="0.85" />
            <stop offset="1" stopColor="#F2C230" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* power cords down to one power strip under the desk */}
        <g fill="none" stroke="#1D2A30" strokeWidth="4" strokeLinecap="round">
          <path d="M64 330c0 30 10 50 46 54" />
          <path d="M40 140c-30 10-34 150-10 196s60 48 96 48" />
          <path d="M300 330c4 30-20 52-90 54" />
        </g>
        <rect x="96" y="372" width="140" height="26" rx="5" fill="#2E3A40" />
        <g fill="#46545B">
          <rect x="112" y="380" width="14" height="10" rx="2" />
          <rect x="140" y="380" width="14" height="10" rx="2" />
          <rect x="168" y="380" width="14" height="10" rx="2" />
        </g>
        <circle cx="216" cy="385" r="4" fill="#C0392B" />

        {/* desk */}
        <rect x="0" y="330" width="440" height="8" fill="#1D2A30" />

        {/* Windows 10 PC: a small tower */}
        <rect x="24" y="152" width="124" height="178" rx="6" fill="#2A353B" />
        <g stroke="#3E4C53" strokeWidth="3" strokeLinecap="round">
          <path d="M42 176h88M42 188h88M42 200h88" />
        </g>
        <Led cx={128} cy={312} n={2} />
        <Tape x={30} y={240} w={112} text="Windows 10" />

        {/* Chromebook: closed and stacked on the tower, still working */}
        <rect x="10" y="108" width="158" height="42" rx="8" fill="#B7C0C4" />
        <rect x="10" y="140" width="158" height="10" rx="4" fill="#97A2A7" />
        <Led cx={156} cy={130} n={3} />
        <Tape x={16} y={114} w={124} text="Chromebook" />

        {/* Old laptop: open, screen off, running headless */}
        <rect x="190" y="148" width="210" height="150" rx="10" fill="#45525A" />
        <rect x="202" y="160" width="186" height="126" rx="4" fill="#26323A" />
        <path d="M176 298h238l14 32H162z" fill="#36424A" />
        <rect x="270" y="304" width="50" height="6" rx="3" fill="#2A353B" />
        <Led cx={196} cy={316} n={1} />
        <Tape x={226} y={206} w={138} text="Old laptop" />
      </svg>

      <div className="work-phone" aria-hidden="true">
        <div className="work-screen">
          <p className="work-phone-title">Your computers</p>
          <ul className="work-rows">
            {MACHINES.map((name, i) => (
              <li key={name} className={`work-row work-row-${i + 1}`}>
                <span className="work-dot" />
                <span className="work-name">{name}</span>
                <span className="work-state">Online</span>
              </li>
            ))}
          </ul>
          <div className="work-card">
            <p>Old laptop is waiting for your OK.</p>
            <span className="work-btn">Review</span>
          </div>
        </div>
      </div>
      </div>
    </figure>
  );
}
