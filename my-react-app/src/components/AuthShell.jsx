import { HeartPulse, Syringe, ClipboardPlus } from 'lucide-react';

const FEATURES = [
  { icon: HeartPulse, title: 'Risk assessment', text: 'Heart, lung, and sleep-apnea findings from the patient record' },
  { icon: Syringe, title: 'Dosage estimation', text: 'Anesthesia sleep doses from the saved weight and case' },
  { icon: ClipboardPlus, title: 'Assessment reports', text: 'Saved cases, reports, and history in one place' },
];

const AuthShell = ({ children }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    overflow: 'auto',
    padding: '28px 16px',
    boxSizing: 'border-box',
    fontFamily: "'Segoe UI', sans-serif",
    background: 'radial-gradient(circle at 12% 18%, rgba(255,255,255,0.16), transparent 28%), linear-gradient(145deg, #1e3a8a 0%, #1e40af 46%, #2563eb 100%)',
  }}>
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      @media (max-width: 900px) { .auth-brand { display: none !important; } }
    `}</style>
    <div style={{
      width: '100%',
      maxWidth: '980px',
      margin: 'auto',
      backgroundColor: '#fff',
      borderRadius: '22px',
      boxShadow: '0 24px 60px rgba(15, 23, 42, 0.28)',
      overflow: 'hidden',
      display: 'flex',
      minHeight: '560px',
    }}>
      <aside className="auth-brand" style={{
        flex: '0 0 42%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #1e3a8a 0%, #1e2d6b 100%)',
        color: '#fff',
        padding: '42px 32px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{ position: 'absolute', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: '-30px', left: '-24px' }} />
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '148px',
            height: '148px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid rgba(255,255,255,0.55)',
            boxShadow: '0 10px 24px rgba(0,0,0,0.28)',
          }}>
            <img
              src="/anesthesia-care.jpg"
              alt="Doctor giving anesthesia to a patient"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{ paddingRight: '156px' }}>
          <svg width="96" height="108" viewBox="0 0 72 80" fill="none" style={{ display: 'block', marginBottom: '8px' }}>
            <path d="M36 2L6 14V38C6 56 20 71 36 76C52 71 66 56 66 38V14L36 2Z" fill="#fff" opacity="0.16" />
            <path d="M36 4L8 15.5V38C8 55 21.5 69.5 36 74.5C50.5 69.5 64 55 64 38V15.5L36 4Z" fill="none" stroke="#fff" strokeWidth="2.5" />
            <rect x="31" y="22" width="10" height="28" rx="2" fill="#fff" />
            <rect x="22" y="31" width="28" height="10" rx="2" fill="#fff" />
          </svg>
          <h1 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: '800', letterSpacing: '0.3px' }}>AnesGuard</h1>
          <p style={{ margin: '0 0 8px', fontSize: '14px', lineHeight: 1.45, color: 'rgba(255,255,255,0.88)', fontWeight: '600' }}>
            Pre-Anesthesia Assessment Learning System
          </p>
          <p style={{
            margin: '0 0 28px',
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.12)',
            fontSize: '12px',
            color: '#dbeafe',
          }}>
            Educational use only
          </p>
          </div>
          <svg width="210" height="132" viewBox="0 0 160 110" fill="none" aria-label="ECG monitor" style={{ display: 'block', margin: '8px 0 22px' }}>
            <rect x="48" y="30" width="76" height="52" rx="5" fill="rgba(255,255,255,0.16)" stroke="#bfdbfe" strokeWidth="1.8" />
            <rect x="54" y="36" width="64" height="38" rx="3" fill="#eff6ff" />
            <polyline points="57,55 67,55 72,42 77,68 82,48 87,55 97,55 102,45 107,55 112,55" stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="80" y="82" width="12" height="8" rx="1" fill="#93c5fd" />
            <rect x="70" y="89" width="32" height="4" rx="2" fill="#93c5fd" />
            <line x1="20" y1="18" x2="24" y2="28" stroke="#bfdbfe" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="38" y1="18" x2="34" y2="28" stroke="#bfdbfe" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M20 18 Q29 10 38 18" stroke="#bfdbfe" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M24 28 Q25 50 29 60 Q32 70 29 80" stroke="#bfdbfe" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M34 28 Q33 50 29 60" stroke="#bfdbfe" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="29" cy="83" r="7" fill="#bfdbfe" opacity="0.25" stroke="#bfdbfe" strokeWidth="2" />
            <circle cx="29" cy="83" r="3" fill="#bfdbfe" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={18} color="#bfdbfe" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '700' }}>{feature.title}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', lineHeight: 1.4, color: 'rgba(255,255,255,0.72)' }}>{feature.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
      <section style={{ flex: 1, padding: '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#fff' }}>
        {children}
      </section>
    </div>
  </div>
);

export default AuthShell;
