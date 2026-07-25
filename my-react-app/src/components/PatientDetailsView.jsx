import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';

const PatientDetailsView = ({ onNavigate, patientId }) => {
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`https://anesguard-backend.onrender.com/api/assessments/${patientId || ''}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setPatient(data.assessment);
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    } else {
      setLoading(false);
    }
  }, [patientId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
        <Sidebar activeLabel="History" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#64748b' }}>Loading patient details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
        <Sidebar activeLabel="History" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
        <main style={{ flex: 1, padding: '40px', textAlign: 'center' }}>
          <h2>Patient not found</h2>
          <button onClick={() => onNavigate && onNavigate('history')} style={{ marginTop: '16px', padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>Back to History</button>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
      <Sidebar activeLabel="History" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Patient Details</h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>Complete assessment report</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginTop: '20px' }}>
          {[
            { label: 'Risk Level', value: patient.riskLevel || 'Unknown', color: patient.riskLevel === 'High' ? '#dc2626' : patient.riskLevel === 'Moderate' ? '#d97706' : '#16a34a' },
            { label: 'Risk Score', value: `${patient.riskScore || 0}/12`, color: '#2563eb' },
            { label: 'Age', value: `${patient.age || '-'} years`, color: '#7c3aed' },
            { label: 'Status', value: patient.status || 'Pending', color: patient.status === 'Completed' ? '#16a34a' : '#d97706' },
          ].map(card => (
            <div key={card.label} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px 18px', border: '1px solid #e5e7eb', borderTop: `3px solid ${card.color}` }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{card.label}</p>
              <p style={{ margin: '8px 0 0', fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{card.value}</p>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginTop: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Patient Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Patient Name</p>
              <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{patient.patientName || 'Unknown'}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Gender</p>
              <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{patient.gender || 'Not specified'}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Date</p>
              <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </div>

        <button onClick={() => onNavigate && onNavigate('history')} style={{ marginTop: '20px', padding: '10px 28px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
          Back to History
        </button>
      </main>
    </div>
  );
};

export default PatientDetailsView;