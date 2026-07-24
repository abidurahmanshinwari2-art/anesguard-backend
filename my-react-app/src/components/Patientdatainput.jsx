import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { createAssessment } from '../api/assessments';

const medicalHistoryOptions = [
  ['Hypertension',        'Kidney Disease'],
  ['Diabetes Mellitus',   'Liver Disease'],
  ['Respiratory Disease', 'Smoking'],
  ['Cardiac Disease',     'Other'],
];

const REQUIRED_FIELDS = [
  { key: 'patientName',   label: 'Patient Name' },
  { key: 'age',           label: 'Age' },
  { key: 'gender',        label: 'Gender' },
  { key: 'height',        label: 'Height' },
  { key: 'weight',        label: 'Weight' },
  { key: 'bloodPressure', label: 'Blood Pressure' },
  { key: 'heartRate',     label: 'Heart Rate' },
];

const getInputStyle = (hasError) => ({
  width: '100%', padding: '8px 10px',
  border: `1.5px solid ${hasError ? '#ef4444' : '#d1d5db'}`,
  borderRadius: '7px', fontSize: '13px', color: '#374151',
  outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box',
  fontFamily: 'inherit', transition: 'border-color 0.15s',
});

const labelStyle  = { display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '5px' };
const sectionStyle = { backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '18px 20px', marginBottom: '14px' };
const secTitle    = { fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '14px' };

const FieldError = ({ msg }) => msg ? (
  <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px' }}>
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    {msg}
  </p>
) : null;

const PatientDataInput = ({ onSaveAndContinue, onNavigate }) => {
  const [form, setForm] = useState({
    patientName: '', age: '', gender: '', height: '', weight: '',
    bloodPressure: '', heartRate: '', spo2: '',
    allergies: '', otherDetails: '', medHistory: {},
  });
  const [fieldErrors, setFieldErrors]       = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // New: tracks the "Save & Continue" request to the backend.
  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState('');

  const bmi = (() => {
    const h = parseFloat(form.height), w = parseFloat(form.weight);
    return h > 0 && w > 0 ? (w / ((h / 100) ** 2)).toFixed(1) : '--';
  })();

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
    if (saveError) setSaveError('');
  };

  const handleCheckbox = (key) =>
    setForm(prev => ({ ...prev, medHistory: { ...prev.medHistory, [key]: !prev.medHistory[key] } }));

  const handleReset = () => {
    setForm({ patientName:'',age:'',gender:'',height:'',weight:'',bloodPressure:'',heartRate:'',spo2:'',allergies:'',otherDetails:'',medHistory:{} });
    setFieldErrors({});
    setSubmitAttempted(false);
    setSaveError('');
  };

  const validate = () => {
    const errors = {};
    REQUIRED_FIELDS.forEach(({ key, label }) => {
      if (!form[key] || !String(form[key]).trim()) errors[key] = `${label} is required`;
    });
    return errors;
  };

  // Now async: validates locally first (same as before), then actually
  // saves the assessment to the backend/MongoDB before moving to the next screen.
  const handleSaveAndContinue = async () => {
    setSubmitAttempted(true);
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setSaving(true);
    setSaveError('');

    try {
      const savedAssessment = await createAssessment(form);
      // Pass the real saved assessment (with its MongoDB _id and calculated
      // risk data) up to App.jsx, instead of just calling the callback blindly.
      onSaveAndContinue && onSaveAndContinue(savedAssessment);
    } catch (err) {
      console.error('Failed to save assessment:', err);
      setSaveError('Could not save this assessment. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const ef = fieldErrors;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f1f5f9' }}>

      <Sidebar activeLabel="New Assessment" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />

      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
        <h1 style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>New Patient Assessment</h1>
        <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>Enter patient information</p>

        {/* Error banner — validation */}
        {submitAttempted && Object.keys(fieldErrors).length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', marginBottom: '16px', backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>Please fill in all required fields before continuing.</p>
          </div>
        )}

        {/* Error banner — backend save failed */}
        {saveError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', marginBottom: '16px', backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>{saveError}</p>
          </div>
        )}

        {/* Patient Information */}
        <div style={sectionStyle}>
          <p style={secTitle}>Patient Information</p>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Patient Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle(ef.patientName)} placeholder="Enter full name" value={form.patientName}
                onChange={e => handleChange('patientName', e.target.value)}
                onFocus={e => e.target.style.borderColor = ef.patientName ? '#ef4444' : '#2563eb'}
                onBlur={e => e.target.style.borderColor = ef.patientName ? '#ef4444' : '#d1d5db'} />
              <FieldError msg={ef.patientName} />
            </div>
            <div>
              <label style={labelStyle}>Age (Years) <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle(ef.age)} placeholder="Enter age" type="number" value={form.age}
                onChange={e => handleChange('age', e.target.value)}
                onFocus={e => e.target.style.borderColor = ef.age ? '#ef4444' : '#2563eb'}
                onBlur={e => e.target.style.borderColor = ef.age ? '#ef4444' : '#d1d5db'} />
              <FieldError msg={ef.age} />
            </div>
            <div>
              <label style={labelStyle}>Gender <span style={{ color: '#ef4444' }}>*</span></label>
              <select style={{ ...getInputStyle(ef.gender), color: form.gender ? '#374151' : '#9ca3af', appearance: 'auto' }}
                value={form.gender} onChange={e => handleChange('gender', e.target.value)}
                onFocus={e => e.target.style.borderColor = ef.gender ? '#ef4444' : '#2563eb'}
                onBlur={e => e.target.style.borderColor = ef.gender ? '#ef4444' : '#d1d5db'}>
                <option value="" disabled>Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <FieldError msg={ef.gender} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Height (cm) <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle(ef.height)} placeholder="Enter height" type="number" value={form.height}
                onChange={e => handleChange('height', e.target.value)}
                onFocus={e => e.target.style.borderColor = ef.height ? '#ef4444' : '#2563eb'}
                onBlur={e => e.target.style.borderColor = ef.height ? '#ef4444' : '#d1d5db'} />
              <FieldError msg={ef.height} />
            </div>
            <div>
              <label style={labelStyle}>Weight (kg) <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle(ef.weight)} placeholder="Enter weight" type="number" value={form.weight}
                onChange={e => handleChange('weight', e.target.value)}
                onFocus={e => e.target.style.borderColor = ef.weight ? '#ef4444' : '#2563eb'}
                onBlur={e => e.target.style.borderColor = ef.weight ? '#ef4444' : '#d1d5db'} />
              <FieldError msg={ef.weight} />
            </div>
            <div>
              <label style={labelStyle}>BMI (Calculated)</label>
              <input style={{ ...getInputStyle(false), backgroundColor: '#f8fafc', color: '#64748b' }} value={bmi} readOnly />
            </div>
          </div>
        </div>

        {/* Vital Signs */}
        <div style={sectionStyle}>
          <p style={secTitle}>Vital Signs</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Blood Pressure (mmHg) <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle(ef.bloodPressure)} placeholder="e.g. 120/80" value={form.bloodPressure}
                onChange={e => handleChange('bloodPressure', e.target.value)}
                onFocus={e => e.target.style.borderColor = ef.bloodPressure ? '#ef4444' : '#2563eb'}
                onBlur={e => e.target.style.borderColor = ef.bloodPressure ? '#ef4444' : '#d1d5db'} />
              <FieldError msg={ef.bloodPressure} />
            </div>
            <div>
              <label style={labelStyle}>Heart Rate (bpm) <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle(ef.heartRate)} placeholder="e.g. 78" type="number" value={form.heartRate}
                onChange={e => handleChange('heartRate', e.target.value)}
                onFocus={e => e.target.style.borderColor = ef.heartRate ? '#ef4444' : '#2563eb'}
                onBlur={e => e.target.style.borderColor = ef.heartRate ? '#ef4444' : '#d1d5db'} />
              <FieldError msg={ef.heartRate} />
            </div>
            <div>
              <label style={labelStyle}>SpO₂ (%)</label>
              <input style={getInputStyle(false)} placeholder="e.g. 98" type="number" value={form.spo2}
                onChange={e => handleChange('spo2', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div style={sectionStyle}>
          <p style={secTitle}>Medical History</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {medicalHistoryOptions.map(([left]) => (
                <label key={left} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!form.medHistory[left]} onChange={() => handleCheckbox(left)} style={{ accentColor: '#2563eb', width: '14px', height: '14px' }} />{left}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {medicalHistoryOptions.map(([,right]) => (
                <label key={right} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!form.medHistory[right]} onChange={() => handleCheckbox(right)} style={{ accentColor: '#2563eb', width: '14px', height: '14px' }} />{right}
                </label>
              ))}
            </div>
            <div>
              <label style={labelStyle}>Other Details</label>
              <textarea value={form.otherDetails} onChange={e => handleChange('otherDetails', e.target.value)} rows={5}
                style={{ ...getInputStyle(false), resize: 'vertical', lineHeight: '1.5' }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>
          </div>
        </div>

        {/* Allergies */}
        <div style={sectionStyle}>
          <p style={secTitle}>Allergies</p>
          <input style={getInputStyle(false)} placeholder="Enter any drug or food allergies" value={form.allergies}
            onChange={e => handleChange('allergies', e.target.value)}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#d1d5db'} />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
          <button onClick={handleReset} disabled={saving}
            style={{ padding: '9px 28px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, transition: 'all 0.15s' }}
            onMouseOver={e => { if (!saving) { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f8fafc'; } }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fff'; }}>Reset</button>
          <button onClick={handleSaveAndContinue} disabled={saving}
            style={{ padding: '9px 28px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.75 : 1, boxShadow: '0 3px 10px rgba(37,99,235,0.35)', transition: 'all 0.15s' }}
            onMouseOver={e => { if (!saving) e.currentTarget.style.background = 'linear-gradient(135deg,#1d4ed8,#1e40af)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#2563eb,#1d4ed8)'; }}>
            {saving ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default PatientDataInput;