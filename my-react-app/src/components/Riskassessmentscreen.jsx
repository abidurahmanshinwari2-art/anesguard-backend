import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';

const dotColor = { red: '#ef4444', yellow: '#f59e0b', green: '#22c55e' };

const RiskAssessmentScreen = ({ onBack, onContinue, onNavigate }) => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiskData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('https://anesguard-backend.onrender.com/api/assessments', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success && data.assessments.length > 0) {
          const latest = data.assessments[0];
          setRiskData(latest);
        }
      } catch (error) {
        console.error('Error fetching risk data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskData();
  }, []);

  const defaultRiskFactors = [
    { label: 'Age > 60 years', score: 2, color: 'red' },
    { label: 'BMI > 30', score: 2, color: 'red' },
    { label: 'Hypertension', score: 2, color: 'red' },
    { label: 'Diabetes Mellitus', score: 1, color: 'yellow' },
    { label: 'Respiratory Disease', score: 1, color: 'green' },
  ];

  const recommendations = [
    'Thorough pre-anesthesia evaluation recommended.',
    'Optimize comorbid conditions before surgery.',
    'Consider additional monitoring.',
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f1f5f9' }}>
      <Sidebar activeLabel="Risk Assessment" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
        <h1 style={{ margin: '0 0 2px', fontSize: '21px', fontWeight: '800', color: '#1e293b' }}>Risk Assessment Result</h1>
        <p style={{ margin: '0 0 22px', fontSize: '13px', color: '#64748b' }}>Based on the entered patient information</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#64748b' }}>Loading risk assessment...</p>
          </div>
        ) : riskData ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>Overall Risk Level</p>
                <div style={{ backgroundColor: riskData.riskLevel === 'High' ? '#ef4444' : riskData.riskLevel === 'Moderate' ? '#d97706' : '#16a34a', borderRadius: '10px', padding: '14px 36px', textAlign: 'center', boxShadow: `0 4px 14px ${riskData.riskLevel === 'High' ? 'rgba(239,68,68,0.35)' : riskData.riskLevel === 'Moderate' ? 'rgba(217,119,6,0.35)' : 'rgba(22,163,74,0.35)'}` }}>
                  <span style={{ color: '#fff', fontWeight: '800', fontSize: '22px' }}>{riskData.riskLevel || 'Unknown'}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '12.5px', fontWeight: '600', color: '#64748b' }}>Risk Score</p>
                  <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>
                    {riskData.riskScore || 0} <span style={{ fontSize: '18px', color: '#94a3b8', fontWeight: '600' }}>/ 12</span>
                  </p>
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '22px 24px' }}>
                <p style={{ margin: '0 0 14px', fontSize: '13.5px', fontWeight: '700', color: '#374151' }}>Risk Factors</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                  {(riskData.riskFactors && riskData.riskFactors.length > 0 ? riskData.riskFactors : defaultRiskFactors.map(f => f.label)).map((factor, i) => {
                    const color = defaultRiskFactors.find(f => f.label === factor)?.color || 'yellow';
                    const score = defaultRiskFactors.find(f => f.label === factor)?.score || 1;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: dotColor[color] || '#f59e0b', flexShrink: 0, display: 'inline-block' }} />
                          <span style={{ fontSize: '13.5px', color: '#374151' }}>{factor}</span>
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: dotColor[color] || '#f59e0b' }}>{score}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '20px 24px', marginBottom: '14px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>Interpretation</p>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }}>
                {riskData.riskLevel === 'High' 
                  ? 'This patient has multiple risk factors that may increase the possibility of peri-operative complications.' 
                  : riskData.riskLevel === 'Moderate' 
                    ? 'This patient has some risk factors that require careful monitoring.' 
                    : 'This patient has minimal risk factors. Proceed with standard protocol.'}
              </p>
            </div>

            <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '20px 24px', marginBottom: '28px' }}>
              <p style={{ margin: '0 0 12px', fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>Recommendations</p>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recommendations.map((rec, i) => (
                  <li key={i} style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.5' }}>{rec}</li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '16px', color: '#64748b' }}>No assessment data available.</p>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>Please create an assessment first.</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onBack}
            style={{ padding: '10px 32px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f8fafc'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fff'; }}>Back</button>
          <button onClick={onContinue}
            style={{ padding: '10px 28px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer', boxShadow: '0 3px 10px rgba(37,99,235,0.35)', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
            onMouseOver={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#1d4ed8,#1e40af)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#2563eb,#1d4ed8)'; }}>Continue to Dosage Estimation</button>
        </div>
      </main>
    </div>
  );
};

export default RiskAssessmentScreen;