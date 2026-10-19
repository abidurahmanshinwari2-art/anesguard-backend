import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { API_URL, authHeaders } from '../api/config';
import CaseForm, { EMPTY_CASE, REQUIRED_CASE_FIELDS, isCompleteBloodPressure } from './CaseForm';

const PatientDataInput = ({ onSaveAndContinue, onNavigate }) => {
  const [form, setForm] = useState(EMPTY_CASE);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleCheckbox = (key) =>
    setForm(prev => ({ ...prev, medHistory: { ...prev.medHistory, [key]: !prev.medHistory[key] } }));

  const handleReset = () => {
    setForm(EMPTY_CASE);
    setFieldErrors({});
    setSubmitAttempted(false);
  };

  const validate = () => {
    const errors = {};
    REQUIRED_CASE_FIELDS.forEach(({ key, label }) => {
      if (!form[key] || !String(form[key]).trim()) errors[key] = `${label} is required`;
    });
    if (form.bloodPressure && !isCompleteBloodPressure(form.bloodPressure)) {
      errors.bloodPressure = 'Enter both numbers, high / low';
    }
    return errors;
  };

  const handleSaveAndContinue = async () => {
    setSubmitAttempted(true);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login again');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/assessments`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok && data.success && data.assessment?._id) {
        onSaveAndContinue && onSaveAndContinue(data.assessment._id);
      } else {
        console.error('Save error:', data);
        alert('Could not save assessment: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Could not connect to server. Please check your internet connection.');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f1f5f9' }}>
      <Sidebar activeLabel="New Assessment" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
        <h1 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>Pre-anesthesia assessment</h1>

        {submitAttempted && Object.keys(fieldErrors).length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', marginBottom: '16px', backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>Please fill in all required fields before continuing.</p>
          </div>
        )}


        <CaseForm form={form} errors={fieldErrors} onChange={handleChange} onToggle={handleCheckbox} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
          <button onClick={handleReset}
            style={{ padding: '9px 28px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f8fafc'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fff'; }}>Reset</button>
          <button onClick={handleSaveAndContinue}
            style={{ padding: '9px 28px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer', boxShadow: '0 3px 10px rgba(37,99,235,0.35)' }}
            onMouseOver={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#1d4ed8,#1e40af)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#2563eb,#1d4ed8)'; }}>Save &amp; Continue</button>
        </div>
      </main>
    </div>
  );
};

export default PatientDataInput;