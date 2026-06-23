const BASE = "w-full max-w-[240px] mx-auto block";
const BG = "#EEF2FF";
const STROKE = "#4F46E5";
const STROKE2 = "#A5B4FC";
const SW = 3;

export function IlustracaoAgachamento() {
  return (
    <svg className={BASE} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="160" rx="16" fill={BG} />
      {/* floor */}
      <line x1="20" y1="140" x2="180" y2="140" stroke={STROKE2} strokeWidth={2} strokeDasharray="4 3" />
      {/* body squatting deep */}
      <circle cx="100" cy="38" r="12" stroke={STROKE} strokeWidth={SW} />
      {/* torso */}
      <line x1="100" y1="50" x2="100" y2="88" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* arms */}
      <line x1="100" y1="62" x2="72" y2="80" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <line x1="100" y1="62" x2="128" y2="80" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* thighs – angled down-out */}
      <line x1="100" y1="88" x2="64" y2="118" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <line x1="100" y1="88" x2="136" y2="118" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* shins – angled back to floor */}
      <line x1="64" y1="118" x2="72" y2="140" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <line x1="136" y1="118" x2="128" y2="140" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* feet */}
      <line x1="64" y1="140" x2="54" y2="140" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <line x1="136" y1="140" x2="146" y2="140" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* depth arrow */}
      <path d="M155 55 L155 130" stroke={STROKE2} strokeWidth={1.5} markerEnd="url(#arr)" />
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={STROKE2} />
        </marker>
      </defs>
      <text x="100" y="155" textAnchor="middle" fontSize="10" fill={STROKE} fontFamily="sans-serif">Agachamento profundo</text>
    </svg>
  );
}

export function IlustracaoDorsiflexao() {
  return (
    <svg className={BASE} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="160" rx="16" fill={BG} />
      {/* wall */}
      <rect x="148" y="20" width="12" height="130" rx="4" fill={STROKE2} />
      {/* floor */}
      <line x1="20" y1="140" x2="180" y2="140" stroke={STROKE2} strokeWidth={2} />
      {/* person standing */}
      <circle cx="88" cy="34" r="11" stroke={STROKE} strokeWidth={SW} />
      <line x1="88" y1="45" x2="88" y2="90" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* arms forward */}
      <line x1="88" y1="60" x2="148" y2="72" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <line x1="88" y1="60" x2="60" y2="70" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* leg with knee toward wall */}
      <line x1="88" y1="90" x2="116" y2="116" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <line x1="116" y1="116" x2="120" y2="140" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* back leg */}
      <line x1="88" y1="90" x2="70" y2="120" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <line x1="70" y1="120" x2="68" y2="140" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* distance indicator */}
      <line x1="120" y1="130" x2="148" y2="130" stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 2" />
      <text x="134" y="126" textAnchor="middle" fontSize="8" fill="#B45309" fontFamily="sans-serif">~10cm</text>
      {/* knee touch point */}
      <circle cx="148" cy="108" r="4" fill="#F59E0B" />
      <text x="100" y="155" textAnchor="middle" fontSize="10" fill={STROKE} fontFamily="sans-serif">Teste do tornozelo</text>
    </svg>
  );
}

export function IlustracaoPosterior() {
  return (
    <svg className={BASE} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="160" rx="16" fill={BG} />
      {/* floor */}
      <line x1="20" y1="140" x2="180" y2="140" stroke={STROKE2} strokeWidth={2} />
      {/* bent person */}
      <circle cx="100" cy="34" r="11" stroke={STROKE} strokeWidth={SW} />
      {/* torso bending down */}
      <path d="M100 45 Q98 70 90 100" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" fill="none" />
      {/* arms hanging */}
      <line x1="90" y1="100" x2="86" y2="128" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* legs straight */}
      <line x1="100" y1="45" x2="88" y2="110" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <line x1="88" y1="110" x2="84" y2="140" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <line x1="100" y1="45" x2="112" y2="110" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <line x1="112" y1="110" x2="116" y2="140" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* target: toes */}
      <circle cx="100" cy="130" r="5" fill="#F59E0B" opacity="0.8" />
      <text x="100" y="155" textAnchor="middle" fontSize="10" fill={STROKE} fontFamily="sans-serif">Flexibilidade posterior</text>
    </svg>
  );
}

export function IlustracaoToracica() {
  return (
    <svg className={BASE} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="160" rx="16" fill={BG} />
      {/* chair */}
      <rect x="74" y="100" width="52" height="8" rx="3" fill={STROKE2} />
      <line x1="80" y1="108" x2="80" y2="132" stroke={STROKE2} strokeWidth={3} strokeLinecap="round" />
      <line x1="120" y1="108" x2="120" y2="132" stroke={STROKE2} strokeWidth={3} strokeLinecap="round" />
      {/* person seated */}
      <circle cx="100" cy="36" r="11" stroke={STROKE} strokeWidth={SW} />
      {/* torso rotated */}
      <line x1="100" y1="47" x2="100" y2="100" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* crossed arms */}
      <line x1="84" y1="68" x2="116" y2="76" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <line x1="116" y1="68" x2="84" y2="76" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* legs seated */}
      <line x1="94" y1="100" x2="80" y2="130" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <line x1="106" y1="100" x2="120" y2="130" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* rotation arc */}
      <path d="M 126 55 A 30 30 0 0 1 156 75" stroke="#F59E0B" strokeWidth={2} fill="none" strokeDasharray="4 2" />
      <path d="M 74 55 A 30 30 0 0 0 44 75" stroke="#F59E0B" strokeWidth={2} fill="none" strokeDasharray="4 2" />
      <text x="100" y="155" textAnchor="middle" fontSize="10" fill={STROKE} fontFamily="sans-serif">Rotação torácica</text>
    </svg>
  );
}

export function IlustracaoOmbro() {
  return (
    <svg className={BASE} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="160" rx="16" fill={BG} />
      {/* floor */}
      <line x1="20" y1="148" x2="180" y2="148" stroke={STROKE2} strokeWidth={2} />
      {/* person standing */}
      <circle cx="100" cy="30" r="11" stroke={STROKE} strokeWidth={SW} />
      {/* torso */}
      <line x1="100" y1="41" x2="100" y2="100" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* left arm: up over shoulder */}
      <path d="M100 56 L80 44 L76 72" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" fill="none" />
      {/* right arm: down behind back */}
      <path d="M100 56 L120 68 L116 96" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" fill="none" />
      {/* hands approaching */}
      <circle cx="78" cy="80" r="4" fill={STROKE} />
      <circle cx="116" cy="88" r="4" fill={STROKE} />
      {/* gap line */}
      <line x1="78" y1="80" x2="116" y2="88" stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 2" />
      {/* legs */}
      <line x1="100" y1="100" x2="88" y2="132" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <line x1="88" y1="132" x2="84" y2="148" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <line x1="100" y1="100" x2="112" y2="132" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <line x1="112" y1="132" x2="116" y2="148" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <text x="100" y="158" textAnchor="middle" fontSize="10" fill={STROKE} fontFamily="sans-serif">Mobilidade de ombros</text>
    </svg>
  );
}

export function IlustracaoQuadril() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/mobilidade/quadril.png"
      alt="Teste de mobilidade do quadril"
      className="w-full max-w-[320px] mx-auto block rounded-xl object-cover"
    />
  );
}
