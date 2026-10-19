import React, { useState } from 'react';

export const SURGERIES = [
  { id: 'cataract', name: 'Cataract or other eye surgery', risk: 'Low' },
  { id: 'breast', name: 'Breast surgery', risk: 'Low' },
  { id: 'superficial', name: 'Superficial or skin surgery', risk: 'Low' },
  { id: 'dental', name: 'Dental or ambulatory procedure', risk: 'Low' },
  { id: 'thyroid', name: 'Thyroid surgery', risk: 'Low' },
  { id: 'endoscopy', name: 'Endoscopy', risk: 'Low' },
  { id: 'minor-ortho', name: 'Minor orthopedic surgery (arthroscopy, small hardware)', risk: 'Low' },
  { id: 'minor-gyn', name: 'Minor gynecologic surgery', risk: 'Low' },
  { id: 'inguinal-hernia', name: 'Open inguinal hernia repair', risk: 'Low' },
  { id: 'lap-chole', name: 'Laparoscopic cholecystectomy', risk: 'Intermediate' },
  { id: 'lap-abdominal', name: 'Other laparoscopic abdominal surgery', risk: 'Intermediate' },
  { id: 'open-abdominal', name: 'Open abdominal surgery (bowel, stomach, open gallbladder)', risk: 'Intermediate' },
  { id: 'major-gyn', name: 'Major gynecologic surgery (open hysterectomy)', risk: 'Intermediate' },
  { id: 'major-urology', name: 'Major urologic surgery', risk: 'Intermediate' },
  { id: 'joint-replacement', name: 'Hip or knee replacement', risk: 'Intermediate' },
  { id: 'head-neck', name: 'Major head and neck surgery', risk: 'Intermediate' },
  { id: 'carotid', name: 'Carotid endarterectomy', risk: 'Intermediate' },
  { id: 'thoracotomy', name: 'Thoracotomy or lung resection', risk: 'High' },
  { id: 'esophagectomy', name: 'Esophagectomy', risk: 'High' },
  { id: 'liver-pancreas', name: 'Liver resection or pancreatic surgery', risk: 'High' },
  { id: 'open-aortic', name: 'Open aortic or major vascular surgery', risk: 'High' },
  { id: 'limb-revasc', name: 'Lower-limb bypass or major amputation', risk: 'High' },
];

export const EMPTY_CASE = {
  patientName: '', age: '', gender: '', height: '', weight: '',
  bloodPressure: '', heartRate: '', spo2: '',
  surgeryType: '', urgency: 'Elective', expectedDuration: '<2',
  functionalCapacity: '', mallampati: '', neckCircumference: '', fastingStatus: '',
  allergies: '', otherDetails: '', medHistory: {},
};

export const REQUIRED_CASE_FIELDS = [
  { key: 'patientName', label: 'Patient name' },
  { key: 'age', label: 'Age' },
  { key: 'gender', label: 'Sex' },
  { key: 'height', label: 'Height' },
  { key: 'weight', label: 'Weight' },
  { key: 'bloodPressure', label: 'Blood pressure' },
  { key: 'heartRate', label: 'Heart rate' },
  { key: 'spo2', label: 'Oxygen saturation' },
  { key: 'surgeryType', label: 'Surgery type' },
  { key: 'urgency', label: 'Urgency' },
  { key: 'expectedDuration', label: 'Expected duration' },
  { key: 'functionalCapacity', label: 'Functional capacity' },
  { key: 'mallampati', label: 'Mallampati class' },
  { key: 'fastingStatus', label: 'Fasting status' },
];

const CHECKS = [
  ['Heart and circulation', [
    ['ischemicHeartDisease', 'Ischemic heart disease (prior MI, angina, or coronary disease)'],
    ['heartFailure', 'Heart failure'],
    ['cerebrovascularDisease', 'Prior stroke or TIA'],
    ['hypertension', 'Hypertension'],
    ['usesAnticoagulant', 'Takes an anticoagulant or antiplatelet'],
  ]],
  ['Metabolic, kidney, and liver', [
    ['insulinTreatedDiabetes', 'Diabetes treated with insulin'],
    ['creatinineOver2', 'Creatinine above 2.0 mg/dL'],
    ['endStageRenal', 'Dialysis or end-stage kidney disease'],
    ['anemia', 'Hemoglobin 10 g/dL or lower'],
    ['severeLiverDisease', 'Severe liver disease'],
  ]],
  ['Lungs and sleep', [
    ['copdOrAsthma', 'COPD or significant asthma'],
    ['recentRespiratoryInfection', 'Chest infection in the last month'],
    ['currentSmoker', 'Current smoker'],
    ['snoring', 'Loud snoring'],
    ['daytimeTiredness', 'Daytime tiredness or sleepiness'],
    ['observedApnea', 'Someone has seen the person stop breathing in sleep'],
    ['knownOSA', 'Known obstructive sleep apnea'],
  ]],
  ['Severity and airway', [
    ['priorDifficultAirway', 'Previous difficult airway or intubation'],
    ['constantThreatToLife', 'Severe disease that is a constant threat to life'],
    ['moribund', 'Not expected to survive without this operation'],
  ]],
];

const inputStyle = (hasError) => ({
  width: '100%', padding: '8px 10px',
  border: `1.5px solid ${hasError ? '#ef4444' : '#d1d5db'}`,
  borderRadius: '7px', fontSize: '13px', color: '#374151',
  outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box', fontFamily: 'inherit',
});
const labelStyle = { display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '5px' };
const sectionStyle = { backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '18px 20px', marginBottom: '14px' };

const FieldError = ({ msg }) => msg ? <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#ef4444' }}>{msg}</p> : null;
const NormalValue = ({ text }) => <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#64748b' }}>Normal: {text}</p>;

const COMMON_ALLERGIES = [
  'Penicillin',
  'Amoxicillin',
  'Sulfa drugs',
  'Aspirin',
  'Ibuprofen',
  'Morphine',
  'Codeine',
  'Local anesthetic',
  'Iodine contrast',
  'Latex',
  'Peanuts',
  'Tree nuts',
  'Shellfish',
  'Fish',
  'Eggs',
  'Milk',
  'Soy',
  'Wheat',
  'Sesame',
  'Pollen',
  'Dust',
  'Bee sting',
];

export const splitBloodPressure = (value) => {
  const [high = '', low = ''] = String(value || '').split('/');
  return { high, low };
};

export const joinBloodPressure = (high, low) => {
  const systolic = String(high || '').replace(/\D/g, '');
  const diastolic = String(low || '').replace(/\D/g, '');
  if (!systolic && !diastolic) return '';
  return `${systolic}/${diastolic}`;
};

export const isCompleteBloodPressure = (value) => /^\d{2,3}\/\d{2,3}$/.test(String(value || ''));

const parseAllergies = (value) => {
  if (!value || value === 'None') return [];
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
};

const CaseForm = ({ form, errors = {}, onChange, onToggle }) => {
  const [customAllergy, setCustomAllergy] = useState('');
  const height = parseFloat(form.height);
  const weight = parseFloat(form.weight);
  const bmi = height > 0 && weight > 0 ? (weight / ((height / 100) ** 2)).toFixed(1) : '--';
  const pressure = splitBloodPressure(form.bloodPressure);
  const selectedAllergies = parseAllergies(form.allergies);

  const setPressure = (high, low) => onChange('bloodPressure', joinBloodPressure(high, low));

  const setAllergies = (list) => onChange('allergies', list.join(', '));

  const toggleAllergy = (name) => {
    const exists = selectedAllergies.some((item) => item.toLowerCase() === name.toLowerCase());
    setAllergies(exists
      ? selectedAllergies.filter((item) => item.toLowerCase() !== name.toLowerCase())
      : [...selectedAllergies, name]);
  };

  const addCustomAllergy = () => {
    const name = customAllergy.trim();
    if (!name) return;
    if (!selectedAllergies.some((item) => item.toLowerCase() === name.toLowerCase())) {
      setAllergies([...selectedAllergies, name]);
    }
    setCustomAllergy('');
  };

  const select = (key, label, options, required) => (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: '#ef4444' }}> *</span>}</label>
      <select style={{ ...inputStyle(errors[key]), appearance: 'auto' }} value={form[key] || ''} onChange={(e) => onChange(key, e.target.value)}>
        <option value="">Select</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <FieldError msg={errors[key]} />
    </div>
  );

  return (
    <>
      <div style={sectionStyle}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 14px' }}>Person</p>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>Patient name <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputStyle(errors.patientName)} value={form.patientName || ''} onChange={(e) => onChange('patientName', e.target.value)} />
            <FieldError msg={errors.patientName} />
          </div>
          <div>
            <label style={labelStyle}>Age (years) <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="number" style={inputStyle(errors.age)} value={form.age || ''} onChange={(e) => onChange('age', e.target.value)} />
            <FieldError msg={errors.age} />
          </div>
          <div>
            {select('gender', 'Sex', [
              { value: 'female', label: 'Female' },
              { value: 'male', label: 'Male' },
              { value: 'other', label: 'Other' },
            ], true)}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Height (cm) <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="number" style={inputStyle(errors.height)} value={form.height || ''} onChange={(e) => onChange('height', e.target.value)} />
            <FieldError msg={errors.height} />
          </div>
          <div>
            <label style={labelStyle}>Weight (kg) <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="number" style={inputStyle(errors.weight)} value={form.weight || ''} onChange={(e) => onChange('weight', e.target.value)} />
            <FieldError msg={errors.weight} />
          </div>
          <div>
            <label style={labelStyle}>BMI</label>
            <input style={{ ...inputStyle(false), backgroundColor: '#f8fafc' }} value={bmi} readOnly />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 14px' }}>Vitals</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Blood pressure (mmHg) <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input type="text" inputMode="numeric" style={inputStyle(errors.bloodPressure)} placeholder="High" aria-label="High blood pressure" value={pressure.high} onChange={(e) => setPressure(e.target.value, pressure.low)} />
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#334155', lineHeight: 1 }}>/</span>
              <input type="text" inputMode="numeric" style={inputStyle(errors.bloodPressure)} placeholder="Low" aria-label="Low blood pressure" value={pressure.low} onChange={(e) => setPressure(pressure.high, e.target.value)} />
            </div>
            <NormalValue text="90–120 / 60–80 mmHg" />
            <FieldError msg={errors.bloodPressure} />
          </div>
          <div>
            <label style={labelStyle}>Heart rate (bpm) <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="number" style={inputStyle(errors.heartRate)} value={form.heartRate || ''} onChange={(e) => onChange('heartRate', e.target.value)} />
            <NormalValue text="60–100 bpm" />
            <FieldError msg={errors.heartRate} />
          </div>
          <div>
            <label style={labelStyle}>SpO₂ (%) <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="number" style={inputStyle(errors.spo2)} value={form.spo2 || ''} onChange={(e) => onChange('spo2', e.target.value)} />
            <NormalValue text="95–100%" />
            <FieldError msg={errors.spo2} />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 14px' }}>Planned surgery</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '14px' }}>
          {select('surgeryType', 'Surgery type', SURGERIES.map((item) => ({ value: item.id, label: `${item.name} — ${item.risk} risk` })), true)}
          {select('urgency', 'Urgency', [
            { value: 'Elective', label: 'Elective' },
            { value: 'Urgent', label: 'Urgent' },
            { value: 'Emergency', label: 'Emergency' },
          ], true)}
          {select('expectedDuration', 'Expected duration', [
            { value: '<2', label: 'Under 2 hours' },
            { value: '2-3', label: '2 to 3 hours' },
            { value: '>3', label: 'Over 3 hours' },
          ], true)}
        </div>
      </div>

      <div style={sectionStyle}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 14px' }}>Capacity, airway, and fasting</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          {select('functionalCapacity', 'Functional capacity', [
            { value: '>=4', label: '4 METs or more (can climb a flight of stairs)' },
            { value: '<4', label: 'Under 4 METs' },
            { value: 'Unknown', label: 'Unknown' },
          ], true)}
          {select('mallampati', 'Mallampati class', [
            { value: 'I', label: 'I — soft palate, fauces, uvula, pillars' },
            { value: 'II', label: 'II — soft palate, fauces, uvula' },
            { value: 'III', label: 'III — soft palate and base of uvula' },
            { value: 'IV', label: 'IV — hard palate only' },
          ], true)}
          <div>
            <label style={labelStyle}>Neck circumference (cm)</label>
            <input type="number" style={inputStyle(false)} value={form.neckCircumference || ''} onChange={(e) => onChange('neckCircumference', e.target.value)} placeholder="cm" />
          </div>
          {select('fastingStatus', 'Fasting', [
            { value: 'clears-ok', label: 'Clear liquids stopped for at least 2 hours' },
            { value: 'light-ok', label: 'Light meal stopped for at least 6 hours' },
            { value: 'fatty-ok', label: 'Fried or fatty meal stopped for at least 8 hours' },
            { value: 'inadequate', label: 'Shorter than those intervals' },
          ], true)}
        </div>
      </div>

      {CHECKS.map(([title, items]) => (
        <div key={title} style={sectionStyle}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px' }}>{title}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {items.map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!form.medHistory?.[key]} onChange={() => onToggle(key)} style={{ accentColor: '#2563eb', marginTop: '2px' }} />
                {label}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div style={sectionStyle}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px' }}>Allergies and notes</p>
        <label style={labelStyle}>Allergies</label>
        <select
          style={{ ...inputStyle(false), marginBottom: '12px' }}
          value=""
          onChange={(e) => { if (e.target.value) toggleAllergy(e.target.value); }}
        >
          <option value="">Select an allergy</option>
          {COMMON_ALLERGIES.map((name) => {
            const selected = selectedAllergies.some((item) => item.toLowerCase() === name.toLowerCase());
            return <option key={name} value={name} disabled={selected}>{selected ? `${name} (added)` : name}</option>;
          })}
        </select>
        {selectedAllergies.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {selectedAllergies.map((name) => (
              <button key={name} type="button" onClick={() => toggleAllergy(name)}
                style={{ padding: '6px 10px', borderRadius: '999px', border: '1.5px solid #2563eb', background: '#eff6ff', color: '#1d4ed8', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}>
                {name} ×
              </button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input style={inputStyle(false)} value={customAllergy} placeholder="Add another allergy" onChange={(e) => setCustomAllergy(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomAllergy(); } }} />
          <button type="button" onClick={addCustomAllergy}
            style={{ padding: '8px 14px', borderRadius: '7px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Add
          </button>
        </div>
        <label style={labelStyle}>Other details</label>
        <textarea rows={3} style={{ ...inputStyle(false), resize: 'vertical' }} value={form.otherDetails || ''} onChange={(e) => onChange('otherDetails', e.target.value)} />
      </div>
    </>
  );
};

export default CaseForm;
