const C = '#1a3a28'

function Spoon({ x, y, r = 0, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`} stroke={C} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="10" cy="10" rx="9" ry="11" strokeWidth="2.2" />
      <path strokeWidth="2" d="M10 21L10 72" />
    </g>
  )
}

function Fork({ x, y, r = 0, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`} stroke={C} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path strokeWidth="1.8" d="M4 0L4 22" />
      <path strokeWidth="1.8" d="M10 0L10 22" />
      <path strokeWidth="1.8" d="M16 0L16 22" />
      <path strokeWidth="2" d="M4 22C4 28 16 28 16 22" />
      <path strokeWidth="2" d="M10 28L10 72" />
    </g>
  )
}

function Chili({ x, y, r = 0, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`} stroke={C} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path strokeWidth="2.2" d="M9 0C4 0 0 8 0 18C0 29 4 40 9 45C14 40 18 29 18 18C18 8 14 0 9 0Z" />
      <path strokeWidth="2" d="M9 0L9-11C10-17 18-16 18-9" />
    </g>
  )
}

function Leaf({ x, y, r = 0, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`} stroke={C} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path strokeWidth="2.2" d="M6 0C-2 5-4 18 0 29C3 36 6 40 6 40C6 40 9 36 12 29C16 18 14 5 6 0Z" />
      <path strokeWidth="1.5" d="M6 0L6 40" />
      <path strokeWidth="1.3" d="M6 11C2 14-1 17" />
      <path strokeWidth="1.3" d="M6 11C10 14 13 17" />
      <path strokeWidth="1.3" d="M6 24C2 27-1 30" />
      <path strokeWidth="1.3" d="M6 24C10 27 13 30" />
    </g>
  )
}

function Onion({ x, y, r = 0, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`} stroke={C} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path strokeWidth="2.2" d="M0 22C0 11 6 1 14 1C22 1 28 11 28 22C28 31 22 38 14 38C6 38 0 31 0 22Z" />
      <path strokeWidth="1.5" d="M6 2C5 11 6 22 7 38" />
      <path strokeWidth="1.5" d="M22 2C23 11 22 22 21 38" />
      <path strokeWidth="2" d="M14 1L14-7" />
    </g>
  )
}

function Herb({ x, y, r = 0, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`} stroke={C} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path strokeWidth="2" d="M9 36L9 18" />
      <path strokeWidth="1.8" d="M9 18C5 12 0 11 0 5C4 4 9 7 9 13" />
      <path strokeWidth="1.8" d="M9 18C13 12 18 11 18 5C14 4 9 7 9 13" />
      <path strokeWidth="1.8" d="M9 27C6 21 2 19 1 13C5 12 9 16 9 21" />
      <path strokeWidth="1.8" d="M9 27C12 21 16 19 17 13C13 12 9 16 9 21" />
    </g>
  )
}

function Dot({ x, y, r = 5 }) {
  return <circle cx={x} cy={y} r={r} stroke={C} strokeWidth="1.8" fill="none" />
}

export default function DecoBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 430 1600"
        preserveAspectRatio="xMidYMin meet"
        opacity="0.07"
      >
        {/* ── TOP AREA ─────────────────────────────── */}
        <Spoon  x={8}   y={18}  r={-15} s={1.3} />
        <Leaf   x={380} y={10}  r={22}  s={2.2} />
        <Dot    x={390} y={110} r={6} />
        <Dot    x={400} y={128} r={4} />
        <Chili  x={10}  y={105} r={8}   s={2.0} />

        {/* ── BANNER / GREETING ZONE ───────────────── */}
        <Fork   x={392} y={220} r={-8}  s={1.2} />
        <Onion  x={6}   y={255} r={-18} s={1.6} />
        <Dot    x={18}  y={340} r={5} />

        {/* ── FIRST CARD ROW ───────────────────────── */}
        <Chili  x={395} y={380} r={145} s={2.2} />
        <Herb   x={4}   y={420} r={-6}  s={1.8} />
        <Dot    x={390} y={490} r={7} />
        <Dot    x={405} y={510} r={4} />

        {/* ── SECOND CARD ROW ──────────────────────── */}
        <Spoon  x={394} y={530} r={170} s={1.2} />
        <Leaf   x={6}   y={555} r={-25} s={2.5} />
        <Dot    x={20}  y={660} r={5} />

        {/* ── THIRD CARD ROW ───────────────────────── */}
        <Fork   x={4}   y={700} r={12}  s={1.3} />
        <Chili  x={395} y={685} r={-25} s={2.0} />
        <Dot    x={402} y={800} r={6} />

        {/* ── FOURTH CARD ROW ──────────────────────── */}
        <Onion  x={390} y={830} r={-8}  s={1.8} />
        <Herb   x={8}   y={845} r={5}   s={1.6} />
        <Dot    x={14}  y={950} r={4} />
        <Dot    x={28}  y={965} r={6} />

        {/* ── LOWER SCROLL AREA ────────────────────── */}
        <Spoon  x={390} y={970} r={15}  s={1.4} />
        <Leaf   x={8}   y={1000} r={18}  s={2.3} />
        <Dot    x={400} y={1110} r={5} />
        <Fork   x={388} y={1120} r={-10} s={1.2} />
        <Chili  x={8}   y={1140} r={18}  s={1.9} />
        <Dot    x={16}  y={1255} r={6} />
        <Onion  x={390} y={1260} r={-12} s={1.7} />
        <Herb   x={6}   y={1310} r={10}  s={1.9} />
        <Spoon  x={396} y={1410} r={-20} s={1.3} />
        <Leaf   x={10}  y={1440} r={-18} s={2.2} />
        <Dot    x={395} y={1530} r={7} />
        <Dot    x={408} y={1548} r={4} />
        <Fork   x={8}   y={1510} r={5}   s={1.1} />
      </svg>
    </div>
  )
}
