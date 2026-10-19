import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './sidebar';
import { API_URL, authHeaders } from '../api/config';

const statCards = [
  { label: 'Total Cases', value: 0, sub: 'All Assessments', accent: '#2563eb' },
  { label: 'Low Risk Cases', value: 0, sub: '0% of total', accent: '#16a34a' },
  { label: 'Moderate Risk Cases', value: 0, sub: '0% of total', accent: '#d97706' },
  { label: 'High Risk Cases', value: 0, sub: '0% of total', accent: '#dc2626' },
];

const quickActions = [
  { label: 'Start New Assessment', sub: 'Add new patient case', bg: 'linear-gradient(135deg,#2563eb,#1d4ed8)', icon: '➕', screen: 'patientInput' },
  { label: 'Calculate Dosage', sub: 'Estimate drug dosage', bg: 'linear-gradient(135deg,#0d9488,#0f766e)', icon: '💊', screen: 'dosageEstimation' },
  { label: 'View Reports', sub: 'See analytics & graphs', bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', icon: '📊', screen: 'report' },
  { label: 'Continue Last Case', sub: 'Resume previous case', bg: 'linear-gradient(135deg,#ea580c,#c2410c)', icon: '▶', screen: 'patientInput' },
];

const riskColor = { Low: '#16a34a', Moderate: '#d97706', High: '#dc2626' };
const riskBg = { Low: '#f0fdf4', Moderate: '#fffbeb', High: '#fef2f2' };

const StudentDashboard = ({ onLogout, onNavigate }) => {
  const [stats, setStats] = useState({ total: 0, low: 0, moderate: 0, high: 0 });
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('there');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || localStorage.getItem('anesguard_user_data') || '{}');
      if (stored.fullName) setDisplayName(stored.fullName.split(' ')[0]);
    } catch {
      setDisplayName('there');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [statsResponse, assessmentsResponse] = await Promise.all([
          fetch(`${API_URL}/assessments/stats`, { headers: authHeaders() }),
          fetch(`${API_URL}/assessments?limit=5`, { headers: authHeaders() }),
        ]);
        const statsData = await statsResponse.json();
        const assessmentsData = await assessmentsResponse.json();
        if (statsData.success) setStats(statsData.stats);
        if (assessmentsData.success) setRecentAssessments(assessmentsData.assessments || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const close = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [notificationsOpen]);

  const notifications = recentAssessments.map((item) => {
    const completed = item.status === 'Completed';
    const risk = item.riskLevel ? ` (${item.riskLevel} risk)` : '';
    const name = item.patientName || 'A patient';
    return {
      id: item._id,
      title: completed ? 'Assessment completed' : 'Assessment saved',
      message: completed
        ? `${name} has a completed assessment${risk}.`
        : `${name} was saved and is still pending${risk}.`,
      time: item.updatedAt || item.createdAt,
    };
  });

  const percent = (count) => (stats.total ? `${Math.round((count / stats.total) * 100)}% of total` : '0% of total');
  const updatedStatCards = statCards.map(card => {
    if (card.label === 'Total Cases') return { ...card, value: stats.total || 0, sub: 'All Assessments' };
    if (card.label === 'Low Risk Cases') return { ...card, value: stats.low || 0, sub: percent(stats.low || 0) };
    if (card.label === 'Moderate Risk Cases') return { ...card, value: stats.moderate || 0, sub: percent(stats.moderate || 0) };
    if (card.label === 'High Risk Cases') return { ...card, value: stats.high || 0, sub: percent(stats.high || 0) };
    return card;
  });

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f1f5f9' }}>
      <Sidebar activeLabel="Dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ backgroundColor: '#fff', padding: '0 28px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', flexShrink: 0 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>Welcome, {displayName}</h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Learn, Assess, Understand.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div ref={notificationRef} style={{ position: 'relative' }}>
              <button onClick={() => setNotificationsOpen((open) => !open)} title="Notifications" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '6px', position: 'relative' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                {notifications.length > 0 && (
                  <span style={{ position: 'absolute', top: '0', right: '0', minWidth: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notifications.length}</span>
                )}
              </button>
              {notificationsOpen && (
                <div style={{ position: 'absolute', top: '42px', right: 0, width: '320px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 12px 32px rgba(15,23,42,0.16)', zIndex: 30, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Notifications</p>
                  </div>
                  {notifications.length === 0 ? (
                    <p style={{ margin: 0, padding: '18px 14px', fontSize: '13px', color: '#64748b' }}>No notifications.</p>
                  ) : (
                    notifications.map((note) => (
                      <div key={note.id} style={{ padding: '12px 14px', borderBottom: '1px solid #f8fafc' }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{note.title}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#475569', lineHeight: 1.45 }}>{note.message}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94a3b8' }}>{note.time ? new Date(note.time).toLocaleString() : ''}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <button onClick={() => onNavigate && onNavigate('profile')} title="Open profile" style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </button>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
            {updatedStatCards.map(card => (
              <button key={card.label} onClick={() => onNavigate && onNavigate('history', { risk: card.label === 'Low Risk Cases' ? 'Low' : card.label === 'Moderate Risk Cases' ? 'Moderate' : card.label === 'High Risk Cases' ? 'High' : 'all' })}
                style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderTop: `3px solid ${card.accent}`, borderLeft: 'none', borderRight: 'none', borderBottom: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '600', color: card.accent, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</p>
                <p style={{ margin: '0 0 4px', fontSize: '36px', fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>{card.value}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{card.sub}</p>
              </button>
            ))}
          </div>

          <h2 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
            {quickActions.map(action => (
              <button key={action.label} onClick={() => {
                const latest = recentAssessments[0];
                if (action.label === 'Continue Last Case') {
                  onNavigate && onNavigate(latest ? 'riskAssessment' : 'patientInput', latest ? { id: latest._id } : {});
                  return;
                }
                if (action.label === 'Calculate Dosage') {
                  onNavigate && onNavigate(latest ? 'dosageEstimation' : 'patientInput', latest ? { id: latest._id } : {});
                  return;
                }
                if (action.label === 'View Reports') {
                  onNavigate && onNavigate('report', latest ? { id: latest._id } : {});
                  return;
                }
                onNavigate && onNavigate(action.screen);
              }}
                style={{ background: action.bg, border: 'none', borderRadius: '12px', padding: '18px 16px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}>
                <div style={{ fontSize: '22px', marginBottom: '10px' }}>{action.icon}</div>
                <p style={{ margin: '0 0 3px', fontSize: '13.5px', fontWeight: '700', color: '#fff' }}>{action.label}</p>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>{action.sub}</p>
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Recent Assessments</h3>
              <button onClick={() => onNavigate && onNavigate('history')}
                style={{ background: 'none', border: '1.5px solid #d1d5db', borderRadius: '8px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151'; }}>View All</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 2fr 1fr', padding: '10px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              {['Patient Name', 'Age', 'Risk Level', 'Assessment Date', 'Action'].map(h => (
                <span key={h} style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</span>
              ))}
            </div>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading assessments...</div>
            ) : recentAssessments.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No assessments yet. Start a new assessment!</div>
            ) : (
              recentAssessments.map((row, i) => (
                <div key={row._id || i}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 2fr 1fr', padding: '14px 20px', alignItems: 'center', borderBottom: i < recentAssessments.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.1s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{row.patientName || 'Unknown'}</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>{row.age || '-'}</span>
                  <span><span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', backgroundColor: riskBg[row.riskLevel] || '#f8fafc', color: riskColor[row.riskLevel] || '#64748b', fontSize: '12px', fontWeight: '700' }}>{row.riskLevel || 'Unknown'}</span></span>
                  <span style={{ fontSize: '13px', color: '#475569' }}>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}</span>
                  <span>
                    <button onClick={() => onNavigate && onNavigate('patientDetails', { id: row._id })}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '700', fontSize: '13px', cursor: 'pointer', padding: 0 }}
                      onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}>View</button>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;