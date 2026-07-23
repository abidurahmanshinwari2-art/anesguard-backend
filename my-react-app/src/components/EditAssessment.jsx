// src/components/EditAssessment.jsx
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ArrowLeft, Save, X, AlertCircle } from 'lucide-react';
import { getAssessmentById, updateAssessment } from '../api/assessments';

const EditAssessment = ({ onNavigate, assessmentId }) => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState('');

  const medicalHistoryOptions = [
    ['Hypertension', 'Kidney Disease'],
    ['Diabetes Mellitus', 'Liver Disease'],
    ['Respiratory Disease', 'Smoking'],
    ['Cardiac Disease', 'Other'],
  ];

  useEffect(() => {
    if (!assessmentId) {
      setLoadError('No assessment selected.');
      setLoading(false);
      return;
    }

    const loadAssessment = async () => {
      try {
        const data = await getAssessmentById(assessmentId);
        setFormData({
          patientName: data.patientName,
          age: data.age,
          gender: data.gender,
          height: data.height,
          weight: data.weight,
          bloodPressure: data.bloodPressure,
          heartRate: data.heartRate,
          spo2: data.spo2,
          allergies: data.allergies,
          otherDetails: data.otherDetails,
          medHistory: data.medHistory || {},
        });
      } catch (err) {
        console.error('Failed to load assessment for editing:', err);
        setLoadError('Could not load this assessment.');
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [assessmentId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleCheckbox = (key) => {
    setFormData(prev => ({
      ...prev,
      medHistory: { ...prev.medHistory, [key]: !prev.medHistory[key] }
    }));
  };

  const validate = () => {
    const newErrors = {};
    const required = ['patientName', 'age', 'gender', 'height', 'weight', 'bloodPressure', 'heartRate'];
    required.forEach(field => {
      if (!formData[field] || !String(formData[field]).trim()) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1')} is required`;
      }
    });
    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      // Sends the edited fields to the backend, which recalculates the risk
      // score/level in case age, BMI, or medical history changed.
      await updateAssessment(assessmentId, formData);
      setSaving(false);
      setToast('Assessment updated successfully!');
      setTimeout(() => {
        onNavigate && onNavigate('history');
      }, 1500);
    } catch (err) {
      console.error('Failed to save assessment:', err);
      setSaving(false);
      setErrors({ _general: 'Could not save changes. Please try again.' });
    }
  };

  const getInputStyle = (field) => ({
    width: '100%', padding: '8px 10px',
    border: `1.5px solid ${errors[field] ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '7px', fontSize: '13px', color: '#374151',
    outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box',
    fontFamily: 'inherit', transition: 'border-color 0.15s',
  });

  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' };

  const computedBmi = (() => {
    const h = parseFloat(formData.height), w = parseFloat(formData.weight);
    return h > 0 && w > 0 ? (w / ((h / 100) ** 2)).toFixed(1) : '--';
  })();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
        <Sidebar activeLabel="History" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#64748b' }}>Loading assessment data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
        <Sidebar activeLabel="History" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
        <main style={{ flex: 1, padding: '40px', textAlign: 'center' }}>
          <h2>{loadError}</h2>
          <button onClick={() => onNavigate && onNavigate('history')} style={{ marginTop: '16px', padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
            Back to History
          </button>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f1f5f9' }}>
      <Sidebar activeLabel="History" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px', zIndex: 9999,
          padding: '12px 24px', borderRadius: '10px',
          backgroundColor: '#16a34a', color: '#fff',
          fontSize: '14px', fontWeight: '600',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
        }}>
          ✅ {toast}
        </div>
      )}

      <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => onNavigate && onNavigate('history')}
              style={{ padding: '8px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Edit Assessment</h1>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Update patient assessment information</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => onNavigate && onNavigate('history')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
              <X size={16} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {(Object.keys(errors).length > 0) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', marginBottom: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px' }}>
            <AlertCircle size={18} color="#dc2626" />
            <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>
              {errors._general || 'Please fix all errors before saving.'}
            </p>
          </div>
        )}

        {/* Form */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Patient Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Patient Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle('patientName')} value={formData.patientName || ''}
                onChange={e => handleChange('patientName', e.target.value)} />
              {errors.patientName && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.patientName}</p>}
            </div>
            <div>
              <label style={labelStyle}>Age <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle('age')} type="number" value={formData.age || ''}
                onChange={e => handleChange('age', e.target.value)} />
              {errors.age && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.age}</p>}
            </div>
            <div>
              <label style={labelStyle}>Gender <span style={{ color: '#ef4444' }}>*</span></label>
              <select style={getInputStyle('gender')} value={formData.gender || ''}
                onChange={e => handleChange('gender', e.target.value)}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.gender}</p>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Height (cm) <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle('height')} type="number" value={formData.height || ''}
                onChange={e => handleChange('height', e.target.value)} />
              {errors.height && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.height}</p>}
            </div>
            <div>
              <label style={labelStyle}>Weight (kg) <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle('weight')} type="number" value={formData.weight || ''}
                onChange={e => handleChange('weight', e.target.value)} />
              {errors.weight && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.weight}</p>}
            </div>
            <div>
              <label style={labelStyle}>BMI</label>
              <input style={{ ...getInputStyle('bmi'), backgroundColor: '#f8fafc' }} value={computedBmi} readOnly />
            </div>
          </div>

          <h3 style={{ margin: '24px 0 16px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Vital Signs</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Blood Pressure (mmHg) <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle('bloodPressure')} value={formData.bloodPressure || ''}
                onChange={e => handleChange('bloodPressure', e.target.value)} />
              {errors.bloodPressure && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.bloodPressure}</p>}
            </div>
            <div>
              <label style={labelStyle}>Heart Rate (bpm) <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle('heartRate')} type="number" value={formData.heartRate || ''}
                onChange={e => handleChange('heartRate', e.target.value)} />
              {errors.heartRate && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.heartRate}</p>}
            </div>
            <div>
              <label style={labelStyle}>SpO₂ (%)</label>
              <input style={getInputStyle('spo2')} type="number" value={formData.spo2 || ''}
                onChange={e => handleChange('spo2', e.target.value)} />
            </div>
          </div>

          <h3 style={{ margin: '24px 0 16px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Medical History</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div>
              {medicalHistoryOptions.map(([left]) => (
                <label key={left} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer', padding: '4px 0' }}>
                  <input type="checkbox" checked={!!formData.medHistory?.[left]}
                    onChange={() => handleCheckbox(left)} style={{ accentColor: '#2563eb', width: '14px', height: '14px' }} />
                  {left}
                </label>
              ))}
            </div>
            <div>
              {medicalHistoryOptions.map(([, right]) => (
                <label key={right} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer', padding: '4px 0' }}>
                  <input type="checkbox" checked={!!formData.medHistory?.[right]}
                    onChange={() => handleCheckbox(right)} style={{ accentColor: '#2563eb', width: '14px', height: '14px' }} />
                  {right}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '14px' }}>
            <label style={labelStyle}>Allergies</label>
            <input style={getInputStyle('allergies')} value={formData.allergies || ''}
              onChange={e => handleChange('allergies', e.target.value)} placeholder="Enter any allergies" />
          </div>

          <div style={{ marginTop: '14px' }}>
            <label style={labelStyle}>Other Details</label>
            <textarea rows="3" style={{ ...getInputStyle('otherDetails'), resize: 'vertical' }} value={formData.otherDetails || ''}
              onChange={e => handleChange('otherDetails', e.target.value)} placeholder="Additional notes..." />
          </div>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </main>
    </div>
  );
};

export default EditAssessment;