const Bus = () => (
  <svg width="160" height="50" viewBox="0 0 160 50">
    <rect x="4" y="8" width="148" height="34" rx="6" fill="#1a56db"/>
    <rect x="4" y="8" width="148" height="14" rx="6" fill="#2563eb"/>
    <rect x="10" y="12" width="18" height="10" rx="2" fill="#bfdbfe"/>
    <rect x="32" y="12" width="18" height="10" rx="2" fill="#bfdbfe"/>
    <rect x="54" y="12" width="18" height="10" rx="2" fill="#bfdbfe"/>
    <rect x="76" y="12" width="18" height="10" rx="2" fill="#bfdbfe"/>
    <rect x="98" y="12" width="18" height="10" rx="2" fill="#bfdbfe"/>
    <rect x="120" y="12" width="22" height="18" rx="2" fill="#93c5fd"/>
    <circle cx="28" cy="44" r="8" fill="#1e293b"/>
    <circle cx="28" cy="44" r="4" fill="#64748b"/>
    <circle cx="110" cy="44" r="8" fill="#1e293b"/>
    <circle cx="110" cy="44" r="4" fill="#64748b"/>
    <rect x="2" y="28" width="8" height="6" rx="2" fill="#fbbf24"/>
    <rect x="150" y="28" width="8" height="6" rx="2" fill="#f87171"/>
  </svg>
);

const Car = () => (
  <svg width="110" height="44" viewBox="0 0 110 44">
    <rect x="10" y="18" width="90" height="20" rx="4" fill="#059669"/>
    <path d="M22 18 Q28 6 45 6 L70 6 Q88 6 92 18Z" fill="#047857"/>
    <rect x="26" y="8" width="18" height="10" rx="2" fill="#a7f3d0"/>
    <rect x="52" y="8" width="18" height="10" rx="2" fill="#a7f3d0"/>
    <circle cx="28" cy="39" r="7" fill="#1e293b"/>
    <circle cx="28" cy="39" r="3" fill="#64748b"/>
    <circle cx="85" cy="39" r="7" fill="#1e293b"/>
    <circle cx="85" cy="39" r="3" fill="#64748b"/>
    <rect x="2" y="24" width="10" height="5" rx="2" fill="#fde68a"/>
    <rect x="98" y="24" width="10" height="5" rx="2" fill="#f87171"/>
  </svg>
);

const Van = () => (
  <svg width="130" height="48" viewBox="0 0 130 48">
    <rect x="6" y="10" width="114" height="30" rx="5" fill="#7c3aed"/>
    <rect x="6" y="10" width="114" height="14" rx="5" fill="#8b5cf6"/>
    <rect x="12" y="14" width="20" height="10" rx="2" fill="#ddd6fe"/>
    <rect x="38" y="14" width="20" height="10" rx="2" fill="#ddd6fe"/>
    <rect x="70" y="10" width="44" height="24" rx="3" fill="#a78bfa"/>
    <circle cx="30" cy="42" r="7" fill="#1e293b"/>
    <circle cx="30" cy="42" r="3" fill="#64748b"/>
    <circle cx="98" cy="42" r="7" fill="#1e293b"/>
    <circle cx="98" cy="42" r="3" fill="#64748b"/>
    <rect x="2" y="24" width="8" height="5" rx="2" fill="#fde68a"/>
    <rect x="120" y="24" width="8" height="5" rx="2" fill="#f87171"/>
  </svg>
);

const keyframes = `
  @keyframes dashMove {
    from { background-position: 0 0; }
    to   { background-position: -60px 0; }
  }
  @keyframes driveBus {
    from { transform: translateX(0); }
    to   { transform: translateX(calc(100vw + 220px)); }
  }
  @keyframes driveCar {
    from { transform: translateX(0); }
    to   { transform: translateX(calc(100vw + 220px)); }
  }
  @keyframes driveVan {
    from { transform: translateX(0); }
    to   { transform: translateX(calc(100vw + 220px)); }
  }
`;

export default function VehicleRoad() {
  return (
    <>
      <style>{keyframes}</style>

      {/* Dark road bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: '72px', background: '#1e1e2e', zIndex: 9000,
        pointerEvents: 'none', overflow: 'hidden',
      }}>
        {/* Dashed centre line */}
        <div style={{
          position: 'absolute', top: '50%', left: 0,
          height: '3px', width: '100%',
          background: 'repeating-linear-gradient(90deg,#f0c040 0,#f0c040 30px,transparent 30px,transparent 60px)',
          animation: 'dashMove 0.6s linear infinite',
        }}/>
      </div>

      {/* Bus */}
      <div style={{
        position: 'fixed', bottom: '18px', left: '-180px',
        zIndex: 9001, pointerEvents: 'none',
        animation: 'driveBus 18s linear infinite',
      }}>
        <Bus />
      </div>

      {/* Car */}
      <div style={{
        position: 'fixed', bottom: '16px', left: '-120px',
        zIndex: 9001, pointerEvents: 'none',
        animation: 'driveCar 12s linear infinite',
        animationDelay: '-5s',
      }}>
        <Car />
      </div>

      {/* Van */}
      <div style={{
        position: 'fixed', bottom: '17px', left: '-140px',
        zIndex: 9001, pointerEvents: 'none',
        animation: 'driveVan 15s linear infinite',
        animationDelay: '-10s',
      }}>
        <Van />
      </div>
    </>
  );
}