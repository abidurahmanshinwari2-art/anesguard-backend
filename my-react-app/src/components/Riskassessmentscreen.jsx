import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { getAssessmentById } from '../api/assessments';

const dotColor = { red: '#ef4444', yellow: '#f59e0b', green: '#22c55e' };

// A risk factor's server-calculated "score" (2, 1, etc.) is turned into a
// dot color for display — 2 = red, 1 = yellow, otherwise green.
const scoreToColor = (score) => {
  if (score >= 2) return 'red';
  if (score === 1) return 'yellow';
  return 'green';
};

const levelStyles = {
  Low:      { bg: '#16a34a', shadow: 'rgba(22,163,74,0.35)' },
  Moderate: { bg: '#d97706', shadow: 'rgba(217,119,6,0.35)' },
  High:     { bg: '#ef4444', shadow: 'rgba(239,68,68,0.35)' },
};

const RiskAssessmentScreen = ({ onBack, onContinue, onNavigate, assessmentId }) => {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState('');

  useEffect(() => {
    if (!assessmentId) {
      setLoadError('No assessment selected. Please start from "New Assessment".');
      setLoading(false);
      return;
    }

    const loadAssessment = async () => {
      try {
        const data = await getAssessmentById(assessmentId);
        setAssessment(data);
      } catch (err) {
        console.error('Failed to load assessment:', err);
        setLoadError('Could not load this assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [assessmentId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
        <Sidebar activeLabel="Risk Assessment" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#64748b' }}>Loading risk assessment...</p>
        </main>
      </div>
    );
  }

  if (loadError || !assessment) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
        <Sidebar activeLabel="Risk Assessment" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
          <p style={{ color: '#dc2626', fontWeight: '600' }}>{loadError || 'Assessment not found.'}</p>
          <button onClick={() => onNavigate && onNavigate('patientInput')}
            style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
            Start New Assessment
          </button>
        </main>
      </div>
    );
  }

  const levelStyle = levelStyles[assessment.riskLevel] || levelStyles.Low;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f1f5f9' }}>

      <Sidebar activeLabel="Risk Assessment" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />

      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
        <h1 style={{ margin: '0 0 2px', fontSize: '21px', fontWeight: '800', color: '#1e293b' }}>Risk Assessment Result</h1>
        <p style={{ margin: '0 0 22px', fontSize: '13px', color: '#64748b' }}>
          Based on the entered patient information for {assessment.patientName}
        </p>

        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '16px', marginBottom: '16px' }}>

          {/* Overall Risk Level */}
          <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>Overall Risk Level</p>
            <div style={{ backgroundColor: levelStyle.bg, borderRadius: '10px', padding: '14px 36px', textAlign: 'center', boxShadow: `0 4px 14px ${levelStyle.shadow}` }}>
              <span style={{ color: '#fff', fontWeight: '800', fontSize: '22px' }}>{assessment.riskLevel} Risk</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', fontSize: '12.5px', fontWeight: '600', color: '#64748b' }}>Risk Score</p>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>
                {assessment.riskScore} <span style={{ fontSize: '18px', color: '#94a3b8', fontWeight: '600' }}>/ 12</span>
              </p>
            </div>
          </div>

          {/* Risk Factors */}
          <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '22px 24px' }}>
            <p style={{ margin: '0 0 14px', fontSize: '13.5px', fontWeight: '700', color: '#374151' }}>Risk Factors</p>
            {assessment.riskFactors && assessment.riskFactors.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                {assessment.riskFactors.map((factor, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: dotColor[scoreToColor(factor.score)], flexShrink: 0, display: 'inline-block' }} />
                      <span style={{ fontSize: '13.5px', color: '#374151' }}>{factor.label}</span>
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: dotColor[scoreToColor(factor.score)] }}>{factor.score}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>No risk factors identified — this patient is low risk.</p>
            )}
          </div>
        </div>

        {/* Interpretation */}
        <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '20px 24px', marginBottom: '14px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>Interpretation</p>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }}>
            {assessment.riskLevel === 'Low'
              ? 'This patient currently shows a low number of risk factors for peri-operative complications.'
              : 'This patient has multiple risk factors that may increase the possibility of peri-operative complications.'}
          </p>
        </div>

        {/* Recommendations */}
        <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '20px 24px', marginBottom: '28px' }}>
          <p style={{ margin: '0 0 12px', fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>Recommendations</p>
          <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(assessment.recommendations || []).map((rec, i) => (
              <li key={i} style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.5' }}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Buttons */}
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