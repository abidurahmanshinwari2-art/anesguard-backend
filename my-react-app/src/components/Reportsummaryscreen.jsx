import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { getAssessmentById } from '../api/assessments';

// ── Charts (pure SVG) — kept as illustrative visuals for now; wiring these to
// real historical trends across all your assessments is a bigger feature for
// a later round, so they stay as sample visualizations. ─────────────────────
const PieChart = () => {
  const slices = [
    { pct: 0.42, color: '#22c55e', label: 'Low (42%)' },
    { pct: 0.38, color: '#f59e0b', label: 'Moderate (38%)' },
    { pct: 0.20, color: '#ef4444', label: 'High (20%)' },
  ];
  const cx = 55, cy = 55, r = 48;
  let cum = -Math.PI / 2;
  const paths = slices.map(s => {
    const a1 = cum, a2 = cum + s.pct * 2 * Math.PI; cum = a2;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    return { ...s, d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${s.pct > 0.5 ? 1 : 0},1 ${x2},${y2} Z` };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        {paths.map((s, i) => <path key={i} d={s.d} fill={s.color} stroke="#fff" strokeWidth="1.5" />)}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#374151' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: s.color, flexShrink: 0, display: 'inline-block' }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const LineChart = () => {
  const pts = [{ x:0,y:4 },{ x:1,y:5 },{ x:2,y:6 },{ x:3,y:7 },{ x:4,y:11 }];
  const labels = ['21 May','22 May','23 May','24 May','25 May'];
  const W=170,H=110,pl=28,pr=10,pt=10,pb=28;
  const cW=W-pl-pr, cH=H-pt-pb, maxY=12;
  const tx = i => pl + (i/(pts.length-1))*cW;
  const ty = v => pt + cH - (v/maxY)*cH;
  const d  = pts.map((p,i) => `${i===0?'M':'L'}${tx(i)},${ty(p.y)}`).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {[0,3,6,9,12].map(v => (
        <g key={v}>
          <line x1={pl} y1={ty(v)} x2={W-pr} y2={ty(v)} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />
          <text x={pl-4} y={ty(v)+4} textAnchor="end" fontSize="9" fill="#94a3b8">{v}</text>
        </g>
      ))}
      <path d={d} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p,i) => <circle key={i} cx={tx(i)} cy={ty(p.y)} r="3.5" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />)}
      {labels.map((l,i) => <text key={i} x={tx(i)} y={H-6} textAnchor="middle" fontSize="8.5" fill="#94a3b8">{l}</text>)}
    </svg>
  );
};

const BarChart = () => {
  const data = [{ l:'Jan',v:5 },{ l:'Feb',v:7 },{ l:'Mar',v:9 },{ l:'Apr',v:12 },{ l:'May',v:11 }];
  const W=170,H=110,pl=24,pr=10,pt=10,pb=28;
  const cW=W-pl-pr, cH=H-pt-pb, maxV=15, gap=cW/data.length, bW=gap*0.5;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {[0,5,10,15].map(v => (
        <g key={v}>
          <line x1={pl} y1={pt+cH-(v/maxV)*cH} x2={W-pr} y2={pt+cH-(v/maxV)*cH} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />
          <text x={pl-4} y={pt+cH-(v/maxV)*cH+4} textAnchor="end" fontSize="9" fill="#94a3b8">{v}</text>
        </g>
      ))}
      {data.map((d,i) => {
        const bH=( d.v/maxV)*cH, bx=pl+i*gap+gap/2-bW/2, by=pt+cH-bH;
        return <g key={i}><rect x={bx} y={by} width={bW} height={bH} fill="#2563eb" rx="3"/><text x={bx+bW/2} y={H-6} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.l}</text></g>;
      })}
    </svg>
  );
};

const SummaryRow = ({ label, value, valueStyle }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
    <span style={{ fontSize: '12.5px', color: '#64748b' }}>{label}</span>
    <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#1e293b', textAlign: 'right', ...valueStyle }}>{value}</span>
  </div>
);

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const genderLabel = (g) => (g ? g.charAt(0).toUpperCase() + g.slice(1) : '—');

const formatDate = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

const ReportSummaryScreen = ({ onBackToDashboard, onNavigate, assessmentId }) => {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

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
        console.error('Failed to load assessment for report:', err);
        setLoadError('Could not load this report. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [assessmentId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
        <Sidebar activeLabel="Reports" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#64748b' }}>Loading report...</p>
        </main>
      </div>
    );
  }

  if (loadError || !assessment) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
        <Sidebar activeLabel="Reports" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
          <p style={{ color: '#dc2626', fontWeight: '600' }}>{loadError || 'Report not found.'}</p>
          <button onClick={onBackToDashboard}
            style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
            Back to Dashboard
          </button>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f1f5f9' }}>

      <Sidebar activeLabel="Reports" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />

      <main style={{ flex: 1, overflowY: 'auto', padding: '26px 28px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>Assessment Report</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Summary for {assessment.patientName}</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 3px 10px rgba(37,99,235,0.3)', whiteSpace: 'nowrap' }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg,#1d4ed8,#1e40af)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(135deg,#2563eb,#1d4ed8)'}>
            <DownloadIcon /> Download PDF
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>

          {/* Patient Summary */}
          <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '16px 18px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Patient Summary</p>
            <SummaryRow label="Name"            value={assessment.patientName} />
            <SummaryRow label="Age / Gender"    value={`${assessment.age} / ${genderLabel(assessment.gender)}`} />
            <SummaryRow label="Weight / Height" value={`${assessment.weight} kg / ${assessment.height} cm`} />
            <SummaryRow label="BMI"             value={assessment.bmi ?? '—'} />
            <SummaryRow label="Assessment Date" value={formatDate(assessment.createdAt)} />
          </div>

          {/* Risk Summary */}
          <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '16px 18px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Risk Summary</p>
            <SummaryRow label="Risk Level" value={`${assessment.riskLevel} Risk`} valueStyle={{ color: assessment.riskLevel === 'High' ? '#ef4444' : assessment.riskLevel === 'Moderate' ? '#d97706' : '#16a34a' }} />
            <SummaryRow label="Risk Score" value={`${assessment.riskScore} / 12`}   valueStyle={{ fontWeight: '800' }} />
            <p style={{ margin: '10px 0 6px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Key Risk Factors</p>
            {assessment.riskFactors && assessment.riskFactors.length > 0 ? (
              assessment.riskFactors.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#374151', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: '#374151' }}>{f.label}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>No risk factors identified.</p>
            )}
          </div>

          {/* Dosage Summary */}
          <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '16px 18px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Dosage Summary</p>
            {assessment.drugSelected ? (
              <>
                <SummaryRow label="Selected Drug"   value={assessment.drugSelected} />
                <SummaryRow label="Calculated Dose" value={assessment.calculatedDose} valueStyle={{ color: '#16a34a', fontWeight: '800' }} />
                <SummaryRow label="Dose Range"      value={assessment.doseRange} valueStyle={{ color: '#2563eb', fontWeight: '700' }} />
              </>
            ) : (
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>No dosage has been calculated yet.</p>
            )}
            <div style={{ marginTop: '14px', padding: '10px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px' }}>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#dc2626', fontWeight: '600', lineHeight: '1.5' }}>
                Disclaimer: Educational use only.<br />Not for clinical decision making.
              </p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '18px 20px', marginBottom: '18px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>Assessment Charts</p>
          <p style={{ margin: '0 0 16px', fontSize: '11px', color: '#94a3b8' }}>Sample visualizations — reflects overall trends, not this specific patient</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>Risk Level Distribution</p>
              <PieChart />
            </div>
            <div>
              <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>Risk Score Trend</p>
              <LineChart />
            </div>
            <div>
              <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>Cases by Month</p>
              <BarChart />
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <button onClick={onBackToDashboard}
          style={{ padding: '10px 28px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseOver={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f8fafc'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fff'; }}>
          Back to Dashboard
        </button>

      </main>
    </div>
  );
};

export default ReportSummaryScreen;