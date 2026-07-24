import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { getAssessmentById, saveDosage } from '../api/assessments';

const drugOptions = [
  { label: 'Propofol (Induction)',    stdDose: 2.0   },
  { label: 'Ketamine (Induction)',    stdDose: 1.5   },
  { label: 'Midazolam (Sedation)',    stdDose: 0.05  },
  { label: 'Fentanyl (Analgesia)',    stdDose: 0.002 },
  { label: 'Rocuronium (Paralysis)',  stdDose: 0.6   },
  { label: 'Neostigmine (Reversal)',  stdDose: 0.05  },
  { label: 'Atropine (Premedication)',stdDose: 0.02  },
];

const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: '1.5px solid #d1d5db', borderRadius: '8px',
  fontSize: '14px', color: '#374151', outline: 'none',
  backgroundColor: '#fff', boxSizing: 'border-box', fontFamily: 'inherit',
};

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' };

const DosageEstimationScreen = ({ onBack, onGenerateReport, onNavigate, assessmentId }) => {
  const [selectedDrug, setSelectedDrug] = useState(drugOptions[0]);
  const [stdDose, setStdDose]           = useState('2.0');
  const [weight, setWeight]             = useState('70');
  const [age, setAge]                   = useState('45');
  const [patientName, setPatientName]   = useState('');

  // New: loading the real assessment so weight/age reflect the actual patient,
  // and tracking the "save to backend" step when the user clicks Generate Report.
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!assessmentId) {
      setLoadError('No assessment selected. Please start from "New Assessment".');
      setLoading(false);
      return;
    }

    const loadAssessment = async () => {
      try {
        const data = await getAssessmentById(assessmentId);
        setPatientName(data.patientName || '');
        if (data.weight) setWeight(String(data.weight));
        if (data.age) setAge(String(data.age));
      } catch (err) {
        console.error('Failed to load assessment for dosage:', err);
        setLoadError('Could not load this patient\'s data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [assessmentId]);

  const calcDose = (() => {
    const d = parseFloat(stdDose), w = parseFloat(weight);
    return !isNaN(d) && !isNaN(w) && d > 0 && w > 0 ? +(d * w).toFixed(1) : null;
  })();
  const rangeLow  = calcDose !== null ? +(calcDose * 0.9).toFixed(1) : null;
  const rangeHigh = calcDose !== null ? +(calcDose * 1.1).toFixed(1) : null;

  const handleDrugChange = (e) => {
    const drug = drugOptions.find(d => d.label === e.target.value);
    if (drug) { setSelectedDrug(drug); setStdDose(String(drug.stdDose)); }
  };

  // Now actually saves the calculated dosage onto the assessment in MongoDB
  // before moving on to the report screen.
  const handleGenerateReport = async () => {
    if (calcDose === null) {
      setSaveError('Enter a valid dose and weight before continuing.');
      return;
    }

    setSaving(true);
    setSaveError('');

    try {
      await saveDosage(assessmentId, {
        drugSelected: selectedDrug.label,
        calculatedDose: `${calcDose} mg`,
        doseRange: `${rangeLow} mg - ${rangeHigh} mg`,
      });
      onGenerateReport && onGenerateReport();
    } catch (err) {
      console.error('Failed to save dosage:', err);
      setSaveError('Could not save the dosage. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
        <Sidebar activeLabel="Dosage Estimation" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#64748b' }}>Loading patient data...</p>
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
        <Sidebar activeLabel="Dosage Estimation" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
          <p style={{ color: '#dc2626', fontWeight: '600' }}>{loadError}</p>
          <button onClick={() => onNavigate && onNavigate('patientInput')}
            style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
            Start New Assessment
          </button>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f1f5f9' }}>

      <Sidebar activeLabel="Dosage Estimation" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />

      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
        <h1 style={{ margin: '0 0 2px', fontSize: '21px', fontWeight: '800', color: '#1e293b' }}>Dosage Estimation</h1>
        <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#64748b' }}>
          {patientName ? `Calculate dosage for ${patientName}` : 'Calculate educational drug dosage based on patient data'}
        </p>

        {saveError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', marginBottom: '16px', backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', maxWidth: '640px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>{saveError}</p>
          </div>
        )}

        {/* Form Card */}
        <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '26px 28px', maxWidth: '640px' }}>

          {/* Select Drug */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Select Drug</label>
            <select value={selectedDrug.label} onChange={handleDrugChange}
              style={{ ...inputStyle, appearance: 'auto', cursor: 'pointer' }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}>
              {drugOptions.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
            </select>
          </div>

          {/* Dose + Weight */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Standard Dose (mg/kg)</label>
              <input type="number" value={stdDose} onChange={e => setStdDose(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>
            <div>
              <label style={labelStyle}>Patient Weight (kg)</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>
          </div>

          {/* Age */}
          <div style={{ marginBottom: '26px' }}>
            <label style={labelStyle}>Age (Years)</label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)}
              style={{ ...inputStyle, maxWidth: '48%' }}
              onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
          </div>

          {/* Results */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '20px' }}>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Calculated Dose (mg)</p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#16a34a', lineHeight: 1 }}>
                {calcDose !== null ? `${calcDose} mg` : '-- mg'}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Dose Range (±10%)</p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>
                {rangeLow !== null ? `${rangeLow} mg – ${rangeHigh} mg` : '-- mg – -- mg'}
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: '18px' }} />

          {/* Info note */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 14px' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8" strokeWidth="3"/><line x1="12" y1="12" x2="12" y2="16"/>
            </svg>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#1d4ed8', lineHeight: '1.5' }}>
              <strong>Note:</strong> This is an educational estimation only. Actual dose depends on clinical judgment.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', maxWidth: '640px' }}>
          <button onClick={onBack} disabled={saving}
            style={{ padding: '10px 32px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, transition: 'all 0.15s' }}
            onMouseOver={e => { if (!saving) { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f8fafc'; } }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fff'; }}>Back</button>
          <button onClick={handleGenerateReport} disabled={saving}
            style={{ padding: '10px 28px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.75 : 1, boxShadow: '0 3px 10px rgba(37,99,235,0.35)', transition: 'all 0.15s' }}
            onMouseOver={e => { if (!saving) e.currentTarget.style.background = 'linear-gradient(135deg,#1d4ed8,#1e40af)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#2563eb,#1d4ed8)'; }}>
            {saving ? 'Saving...' : 'Generate Report'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default DosageEstimationScreen;