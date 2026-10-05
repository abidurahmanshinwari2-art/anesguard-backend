import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { API_URL, authHeaders } from '../api/config';

const PieChart = ({ low = 0, moderate = 0, high = 0 }) => {
  const total = low + moderate + high;
  const slices = total === 0
    ? [{ pct: 1, color: '#e5e7eb', label: 'No cases yet' }]
    : [
        { pct: low / total, color: '#22c55e', label: `Low (${Math.round((low / total) * 100)}%)` },
        { pct: moderate / total, color: '#f59e0b', label: `Moderate (${Math.round((moderate / total) * 100)}%)` },
        { pct: high / total, color: '#ef4444', label: `High (${Math.round((high / total) * 100)}%)` },
      ].filter((slice) => slice.pct > 0);
  const cx = 55, cy = 55, r = 48;
  let cum = -Math.PI / 2;
  const paths = slices.map(s => {
    const a1 = cum, a2 = cum + s.pct * 2 * Math.PI; cum = a2;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const d = s.pct >= 0.999
      ? `M${cx},${cy - r} A${r},${r} 0 1,1 ${cx - 0.01},${cy - r} Z`
      : `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${s.pct > 0.5 ? 1 : 0},1 ${x2},${y2} Z`;
    return { ...s, d };
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

const LineChart = ({ points = [] }) => {
  const pts = points.length ? points : [{ label: '—', value: 0 }];
  const W = 170, H = 110, pl = 28, pr = 10, pt = 10, pb = 28;
  const cW = W - pl - pr, cH = H - pt - pb, maxY = 12;
  const tx = i => pts.length === 1 ? pl + cW / 2 : pl + (i / (pts.length - 1)) * cW;
  const ty = v => pt + cH - (v / maxY) * cH;
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${tx(i)},${ty(p.value)}`).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {[0, 3, 6, 9, 12].map(v => (
        <g key={v}>
          <line x1={pl} y1={ty(v)} x2={W - pr} y2={ty(v)} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />
          <text x={pl - 4} y={ty(v) + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{v}</text>
        </g>
      ))}
      <path d={d} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={tx(i)} cy={ty(p.value)} r="3.5" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />)}
      {pts.map((p, i) => <text key={p.label + i} x={tx(i)} y={H - 6} textAnchor="middle" fontSize="8.5" fill="#94a3b8">{p.label}</text>)}
    </svg>
  );
};

const BarChart = ({ months = [] }) => {
  const data = months.length ? months : [{ label: '—', value: 0 }];
  const W = 170, H = 110, pl = 24, pr = 10, pt = 10, pb = 28;
  const cW = W - pl - pr, cH = H - pt - pb;
  const maxV = Math.max(1, ...data.map(d => d.value));
  const gap = cW / data.length, bW = gap * 0.5;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {[0, Math.ceil(maxV / 2), maxV].map(v => (
        <g key={v}>
          <line x1={pl} y1={pt + cH - (v / maxV) * cH} x2={W - pr} y2={pt + cH - (v / maxV) * cH} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />
          <text x={pl - 4} y={pt + cH - (v / maxV) * cH + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{v}</text>
        </g>
      ))}
      {data.map((item, i) => {
        const bH = (item.value / maxV) * cH, bx = pl + i * gap + gap / 2 - bW / 2, by = pt + cH - bH;
        return <g key={item.label}><rect x={bx} y={by} width={bW} height={Math.max(bH, 0)} fill="#2563eb" rx="3" /><text x={bx + bW / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#94a3b8">{item.label}</text></g>;
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

const ReportSummaryScreen = ({ assessmentId, onBackToDashboard, onNavigate }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, low: 0, moderate: 0, high: 0 });

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
          fetch(`${API_URL}/assessments?limit=100`, { headers: authHeaders() }),
        ]);
        const statsData = await statsResponse.json();
        const assessmentsData = await assessmentsResponse.json();
        if (statsData.success) setStats(statsData.stats);
        if (assessmentsData.success) setAssessments(assessmentsData.assessments || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const latestAssessment = assessments.find((item) => item._id === assessmentId) || assessments[0] || null;
  const trend = [...assessments].reverse().slice(-5).map((item) => ({
    label: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value: item.riskScore || 0,
  }));
  const monthCounts = assessments.reduce((acc, item) => {
    const label = new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short' });
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  const months = Object.entries(monthCounts).slice(-5).map(([label, value]) => ({ label, value }));

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f1f5f9' }}>
      <Sidebar activeLabel="Reports" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '26px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>Assessment Report</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Summary of patient assessment</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 3px 10px rgba(37,99,235,0.3)', whiteSpace: 'nowrap' }}>
            <DownloadIcon /> Download PDF
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p>Loading report data...</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '16px 18px' }}>
                <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Patient Summary</p>
                <SummaryRow label="Name" value={latestAssessment?.patientName || 'No data'} />
                <SummaryRow label="Age / Gender" value={latestAssessment ? `${latestAssessment.age || '--'} / ${latestAssessment.gender || '--'}` : 'No data'} />
                <SummaryRow label="Weight / Height" value={latestAssessment ? `${latestAssessment.weight || '--'} kg / ${latestAssessment.height || '--'} cm` : 'No data'} />
                <SummaryRow label="BMI" value={latestAssessment?.bmi || '--'} />
                <SummaryRow label="Assessment Date" value={latestAssessment ? new Date(latestAssessment.createdAt).toLocaleDateString() : 'No data'} />
              </div>

              <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '16px 18px' }}>
                <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Risk Summary</p>
                <SummaryRow label="Risk Level" value={latestAssessment?.riskLevel || 'No data'} valueStyle={{ color: latestAssessment?.riskLevel === 'High' ? '#ef4444' : latestAssessment?.riskLevel === 'Moderate' ? '#d97706' : '#16a34a' }} />
                <SummaryRow label="Risk Score" value={latestAssessment ? `${latestAssessment.riskScore || 0} / 12` : 'No data'} valueStyle={{ fontWeight: '800' }} />
                <p style={{ margin: '10px 0 6px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Key Risk Factors</p>
                {(latestAssessment?.riskFactors || ['No risk factors']).map((factor, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#374151', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: '#374151' }}>{factor}</span>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '16px 18px' }}>
                <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Dosage Summary</p>
                <SummaryRow label="Selected Drug" value={latestAssessment?.drugSelected || 'Not saved yet'} />
                <SummaryRow label="Calculated Dose" value={latestAssessment?.calculatedDose != null ? `${latestAssessment.calculatedDose} mg` : '—'} valueStyle={{ color: '#16a34a', fontWeight: '800' }} />
                <SummaryRow label="Dose Range" value={latestAssessment?.doseRange || '—'} valueStyle={{ color: '#2563eb', fontWeight: '700' }} />
                <div style={{ marginTop: '14px', padding: '10px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px' }}>
                  <p style={{ margin: 0, fontSize: '11.5px', color: '#dc2626', fontWeight: '600', lineHeight: '1.5' }}>
                    Disclaimer: Educational use only.<br />Not for clinical decision making.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '18px 20px', marginBottom: '18px' }}>
              <p style={{ margin: '0 0 16px', fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>Assessment Charts</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>Risk Level Distribution</p>
                  <PieChart low={stats.low} moderate={stats.moderate} high={stats.high} />
                </div>
                <div>
                  <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>Risk Score Trend</p>
                  <LineChart points={trend} />
                </div>
                <div>
                  <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>Cases by Month</p>
                  <BarChart months={months} />
                </div>
              </div>
            </div>
          </>
        )}

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