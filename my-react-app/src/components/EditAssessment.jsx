import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';

const medicalHistoryOptions = [
  ['Hypertension', 'Kidney Disease'],
  ['Diabetes Mellitus', 'Liver Disease'],
  ['Respiratory Disease', 'Smoking'],
  ['Cardiac Disease', 'Other'],
];

const EditAssessment = ({ onNavigate, assessmentId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '', age: '', gender: '', height: '', weight: '',
    bloodPressure: '', heartRate: '', spo2: '',
    allergies: '', otherDetails: '', medHistory: {},
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetchAssessment = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://anesguard-backend.onrender.com/api/assessments/${assessmentId || ''}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success && data.assessment) {
          setFormData(data.assessment);
        }
      } catch (error) {
        console.error('Error fetching assessment:', error);
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchAssessment();
    } else {
      setLoading(false);
    }
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
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login again');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`https://anesguard-backend.onrender.com/api/assessments/${assessmentId || ''}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setToast('Assessment updated successfully!');
        setTimeout(() => onNavigate && onNavigate('history'), 1500);
      } else {
        alert('Failed to update assessment: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating assessment:', error);
      alert('Could not connect to server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getInputStyle = (hasError) => ({
    width: '100%', padding: '8px 10px',
    border: `1.5px solid ${hasError ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '7px', fontSize: '13px', color: '#374151',
    outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box',
    fontFamily: 'inherit',
  });

  const labelStyle = { display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '5px' };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
        <Sidebar activeLabel="History" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#64748b' }}>Loading assessment...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
      <Sidebar activeLabel="History" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Edit Assessment</h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>Update patient assessment information</p>

        {toast && (
          <div style={{ padding: '12px 20px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '16px' }}>
            ✅ {toast}
          </div>
        )}

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', marginTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Patient Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle(errors.patientName)} value={formData.patientName || ''}
                onChange={e => handleChange('patientName', e.target.value)} />
              {errors.patientName && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.patientName}</p>}
            </div>
            <div>
              <label style={labelStyle}>Age <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle(errors.age)} type="number" value={formData.age || ''}
                onChange={e => handleChange('age', e.target.value)} />
              {errors.age && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.age}</p>}
            </div>
            <div>
              <label style={labelStyle}>Gender <span style={{ color: '#ef4444' }}>*</span></label>
              <select style={getInputStyle(errors.gender)} value={formData.gender || ''}
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
              <input style={getInputStyle(errors.height)} type="number" value={formData.height || ''}
                onChange={e => handleChange('height', e.target.value)} />
              {errors.height && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.height}</p>}
            </div>
            <div>
              <label style={labelStyle}>Weight (kg) <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle(errors.weight)} type="number" value={formData.weight || ''}
                onChange={e => handleChange('weight', e.target.value)} />
              {errors.weight && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.weight}</p>}
            </div>
            <div>
              <label style={labelStyle}>BMI</label>
              <input style={{ ...getInputStyle(false), backgroundColor: '#f8fafc' }} value="Calculated" readOnly />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Blood Pressure <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle(errors.bloodPressure)} value={formData.bloodPressure || ''}
                onChange={e => handleChange('bloodPressure', e.target.value)} />
              {errors.bloodPressure && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.bloodPressure}</p>}
            </div>
            <div>
              <label style={labelStyle}>Heart Rate <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={getInputStyle(errors.heartRate)} type="number" value={formData.heartRate || ''}
                onChange={e => handleChange('heartRate', e.target.value)} />
              {errors.heartRate && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.heartRate}</p>}
            </div>
            <div>
              <label style={labelStyle}>SpO₂ (%)</label>
              <input style={getInputStyle(false)} type="number" value={formData.spo2 || ''}
                onChange={e => handleChange('spo2', e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>Medical History</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {medicalHistoryOptions.map(([left, right]) => (
                <React.Fragment key={left}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!formData.medHistory?.[left]}
                      onChange={() => handleCheckbox(left)} style={{ accentColor: '#2563eb', width: '14px', height: '14px' }} />
                    {left}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!formData.medHistory?.[right]}
                      onChange={() => handleCheckbox(right)} style={{ accentColor: '#2563eb', width: '14px', height: '14px' }} />
                    {right}
                  </label>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Allergies</label>
            <input style={getInputStyle(false)} value={formData.allergies || ''}
              onChange={e => handleChange('allergies', e.target.value)} placeholder="Enter any allergies" />
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Other Details</label>
            <textarea rows="3" style={{ ...getInputStyle(false), resize: 'vertical' }} value={formData.otherDetails || ''}
              onChange={e => handleChange('otherDetails', e.target.value)} placeholder="Additional notes..." />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
            <button onClick={() => onNavigate && onNavigate('history')}
              style={{ padding: '9px 28px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ padding: '9px 28px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditAssessment;