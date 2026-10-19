import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { API_URL, authHeaders } from '../api/config';
import CaseForm, { EMPTY_CASE, REQUIRED_CASE_FIELDS, isCompleteBloodPressure } from './CaseForm';

const EditAssessment = ({ onNavigate, assessmentId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_CASE);
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
        const response = await fetch(`${API_URL}/assessments/${assessmentId}`, {
          headers: authHeaders(),
        });
        const data = await response.json();
        if (data.success && data.assessment) {
          setFormData({
            ...EMPTY_CASE,
            ...data.assessment,
            medHistory: data.assessment.medHistory || {},
            neckCircumference: data.assessment.neckCircumference ?? '',
          });
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
    REQUIRED_CASE_FIELDS.forEach(({ key, label }) => {
      if (!formData[key] || !String(formData[key]).trim()) newErrors[key] = `${label} is required`;
    });
    if (formData.bloodPressure && !isCompleteBloodPressure(formData.bloodPressure)) {
      newErrors.bloodPressure = 'Enter both numbers, high / low';
    }
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
      const response = await fetch(`${API_URL}/assessments/${assessmentId}`, {
        method: 'PUT',
        headers: authHeaders(),
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
        <Sidebar activeLabel="Assessment History" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
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
      <Sidebar activeLabel="Assessment History" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Edit Assessment</h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>Update patient assessment information</p>

        {toast && (
          <div style={{ padding: '12px 20px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '16px' }}>
            ✅ {toast}
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <CaseForm form={formData} errors={errors} onChange={handleChange} onToggle={handleCheckbox} />

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