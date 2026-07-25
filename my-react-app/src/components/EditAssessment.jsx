import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';

const EditAssessment = ({ onNavigate, assessmentId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetchAssessment = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`https://anesguard-backend.onrender.com/api/assessments/${assessmentId || ''}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setFormData(data.assessment || {});
        }
      } catch (error) {
        console.error('Error fetching assessment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
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
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Patient Name</label>
              <input style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #d1d5db', borderRadius: '7px' }} value={formData.patientName || ''} onChange={e => handleChange('patientName', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Age</label>
              <input type="number" style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #d1d5db', borderRadius: '7px' }} value={formData.age || ''} onChange={e => handleChange('age', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Gender</label>
              <select style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #d1d5db', borderRadius: '7px' }} value={formData.gender || ''} onChange={e => handleChange('gender', e.target.value)}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Height (cm)</label>
              <input type="number" style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #d1d5db', borderRadius: '7px' }} value={formData.height || ''} onChange={e => handleChange('height', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Weight (kg)</label>
              <input type="number" style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #d1d5db', borderRadius: '7px' }} value={formData.weight || ''} onChange={e => handleChange('weight', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>BMI</label>
              <input style={{ width: '100%', padding: '8px 10px', backgroundColor: '#f8fafc', border: '1.5px solid #d1d5db', borderRadius: '7px' }} value="Calculated" readOnly />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button onClick={() => onNavigate && onNavigate('history')} style={{ padding: '9px 28px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '9px 28px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditAssessment;