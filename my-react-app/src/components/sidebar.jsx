import React, { useState } from 'react';
import { auth, signOut } from '../firebase/config';

// NAV CONFIG – Added Admin Panel and History
export const NAV_ITEMS = [
  { label: 'Dashboard',         screen: 'dashboard',        icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { label: 'New Assessment',    screen: 'patientInput',     icon: 'M12 5v14M5 12h14' },
  { label: 'Risk Assessment',   screen: 'riskAssessment',   icon: ['M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z','M12 9v4M12 17h.01'] },
  { label: 'Dosage Estimation', screen: 'dosageEstimation', icon: ['M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18'] },
  { label: 'Assesment History',           screen: 'history',          icon: ['M12 8v4l3 3M12 2a10 10 0 100 20 10 10 0 000-20z'] },
  { label: 'Reports',           screen: 'report',           icon: ['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z','M14 2v6h6','M16 13H8M16 17H8M10 9H8'] },
  { label: 'Admin Panel',       screen: 'admin',            icon: ['M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z'] },
  { label: 'Profile',           screen: 'profile',          icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8z' },
  { label: 'Logout',            screen: null,               icon: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'], isLogout: true },
];

// SHARED ICONS
export const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" />
    <line x1="12" y1="8" x2="12" y2="16" stroke="#fff" strokeWidth="2" />
    <line x1="8"  y1="12" x2="16" y2="12" stroke="#fff" strokeWidth="2" />
  </svg>
);

export const NavIcon = ({ d }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

// SIDEBAR COMPONENT
export const Sidebar = ({ activeLabel, onNavigate, onLogout }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleClick = async (item) => {
    if (item.isLogout) { 
      setShowLogoutConfirm(true); 
      return; 
    }
    if (item.screen && onNavigate) onNavigate(item.screen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('anesguard_user');
      localStorage.removeItem('anesguard_user_data');
      if (onLogout) onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* LOGOUT CONFIRM MODAL */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '14px', padding: '32px 28px',
            width: '340px', boxShadow: '0 16px 48px rgba(0,0,0,0.18)', textAlign: 'center'
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#fef2f2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: '700', color: '#1e293b' }}>
              Confirm Logout
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: '13.5px', color: '#64748b', lineHeight: '1.5' }}>
              Are you sure you want to logout from AnesGuard?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px',
                  border: '1.5px solid #d1d5db', background: '#fff',
                  fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseOut={e => e.currentTarget.style.background = '#fff'}
              >Cancel</button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg,#dc2626,#b91c1c)',
                  fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg,#b91c1c,#991b1b)'}
                onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(135deg,#dc2626,#b91c1c)'}
              >Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside style={{
        width: '210px', flexShrink: 0,
        background: 'linear-gradient(180deg,#1e3a8a 0%,#1e2d6b 100%)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '2px 0 12px rgba(0,0,0,0.18)'
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 18px 16px', display: 'flex', alignItems: 'center', gap: '9px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldIcon />
          </div>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>AnesGuard</span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const isActive = activeLabel === item.label;
            return (
              <button
                key={item.label}
                onClick={() => handleClick(item)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 18px', border: 'none', cursor: 'pointer',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #60a5fa' : '3px solid transparent',
                  color: item.isLogout
                    ? 'rgba(255,150,150,0.85)'
                    : isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontSize: '13px', fontWeight: isActive ? '600' : '400',
                  textAlign: 'left', transition: 'all 0.15s',
                }}
                onMouseOver={e => { 
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; 
                }}
                onMouseOut={e => { 
                  if (!isActive) e.currentTarget.style.background = 'transparent'; 
                }}
              >
                <span style={{
                  color: item.isLogout
                    ? 'rgba(255,120,120,0.9)'
                    : isActive ? '#93c5fd' : 'rgba(255,255,255,0.7)'
                }}>
                  <NavIcon d={item.icon} />
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};