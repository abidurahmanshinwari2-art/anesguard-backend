import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';

const ReportSummaryScreen = ({ onBackToDashboard, onNavigate }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('https://anesguard-backend.onrender.com/api/assessments/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setSummaryData(data.stats);
        }
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
      <Sidebar activeLabel="Reports" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Assessment Report</h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>Summary of patient assessments</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p>Loading report data...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginTop: '20px' }}>
            {[
              { label: 'Total Cases', value: summaryData?.total || 0, color: '#2563eb' },
              { label: 'Low Risk', value: summaryData?.low || 0, color: '#16a34a' },
              { label: 'Moderate Risk', value: summaryData?.moderate || 0, color: '#d97706' },
              { label: 'High Risk', value: summaryData?.high || 0, color: '#dc2626' },
              { label: 'Pending', value: summaryData?.pending || 0, color: '#7c3aed' },
              { label: 'Completed', value: summaryData?.completed || 0, color: '#0d9488' },
            ].map(stat => (
              <div key={stat.label} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', borderTop: `3px solid ${stat.color}` }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{stat.label}</p>
                <p style={{ margin: '8px 0 0', fontSize: '36px', fontWeight: '800', color: '#1e293b' }}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        <button onClick={onBackToDashboard}
          style={{ marginTop: '24px', padding: '10px 28px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </main>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ReportSummaryScreen;