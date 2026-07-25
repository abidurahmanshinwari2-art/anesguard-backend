import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';

const RiskAssessmentScreen = ({ onBack, onContinue, onNavigate }) => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiskData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('https://anesguard-backend.onrender.com/api/assessments', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success && data.assessments.length > 0) {
          const latest = data.assessments[data.assessments.length - 1];
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

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
      <Sidebar activeLabel="Risk Assessment" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
        <h1 style={{ fontSize: '21px', fontWeight: '800', color: '#1e293b' }}>Risk Assessment Result</h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>Based on the entered patient information</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p>Loading risk assessment...</p>
          </div>
        ) : riskData ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px 20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '700', color: '#374151' }}>Overall Risk Level</p>
                <div style={{ backgroundColor: riskData.riskLevel === 'High' ? '#ef4444' : riskData.riskLevel === 'Moderate' ? '#d97706' : '#16a34a', borderRadius: '10px', padding: '14px 36px', margin: '12px auto', display: 'inline-block' }}>
                  <span style={{ color: '#fff', fontWeight: '800', fontSize: '22px' }}>{riskData.riskLevel || 'Unknown'}</span>
                </div>
                <p style={{ margin: 0, fontSize: '12.5px', fontWeight: '600', color: '#64748b' }}>Risk Score</p>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>{riskData.riskScore || 0} <span style={{ fontSize: '18px', color: '#94a3b8' }}>/ 12</span></p>
              </div>

              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '22px 24px', border: '1px solid #e5e7eb' }}>
                <p style={{ margin: '0 0 14px', fontSize: '13.5px', fontWeight: '700', color: '#374151' }}>Risk Factors</p>
                {(riskData.riskFactors || []).map((factor, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ fontSize: '13.5px', color: '#374151' }}>{factor}</span>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#dc2626' }}>✓</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px 24px', border: '1px solid #e5e7eb', marginBottom: '14px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>Interpretation</p>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#475569' }}>
                {riskData.riskLevel === 'High' ? 'This patient has multiple risk factors that may increase the possibility of peri-operative complications.' :
                 riskData.riskLevel === 'Moderate' ? 'This patient has some risk factors that require careful monitoring.' :
                 'This patient has minimal risk factors. Proceed with standard protocol.'}
              </p>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px 24px', border: '1px solid #e5e7eb', marginBottom: '28px' }}>
              <p style={{ margin: '0 0 12px', fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>Recommendations</p>
              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                <li style={{ fontSize: '13.5px', color: '#475569', marginBottom: '4px' }}>Thorough pre-anesthesia evaluation recommended.</li>
                <li style={{ fontSize: '13.5px', color: '#475569', marginBottom: '4px' }}>Optimize comorbid conditions before surgery.</li>
                <li style={{ fontSize: '13.5px', color: '#475569' }}>Consider additional monitoring.</li>
              </ul>
            </div>
          </>
        ) : (
          <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No assessment data available. Please create an assessment first.</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onBack} style={{ padding: '10px 32px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>Back</button>
          <button onClick={onContinue} style={{ padding: '10px 28px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer' }}>Continue to Dosage Estimation</button>
        </div>
      </main>
    </div>
  );
};

export default RiskAssessmentScreen;