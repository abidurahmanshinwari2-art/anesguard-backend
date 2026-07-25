import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { ArrowLeft, Download, Printer, Edit, User, Calendar, Heart, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

const PatientDetailsView = ({ onNavigate, patientId }) => {
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://anesguard-backend.onrender.com/api/assessments/${patientId || ''}`, {
          headers: { 'Authorization': `Bearer ${token}` },
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
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f1f5f9' }}>
      <Sidebar activeLabel="History" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => onNavigate && onNavigate('history')}
              style={{ padding: '8px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Patient Details</h1>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Complete assessment report for {patient.patientName}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
              <Download size={16} /> Download
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
              <Printer size={16} /> Print
            </button>
            <button onClick={() => onNavigate && onNavigate('editAssessment', { id: patient._id })}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer' }}>
              <Edit size={16} /> Edit
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' }}>
          {[
            { label: 'Risk Level', value: patient.riskLevel || 'Unknown', color: patient.riskLevel === 'High' ? '#dc2626' : patient.riskLevel === 'Moderate' ? '#d97706' : '#16a34a', icon: <AlertTriangle size={20} /> },
            { label: 'Risk Score', value: `${patient.riskScore || 0}/12`, color: '#2563eb', icon: <Activity size={20} /> },
            { label: 'Assessment Date', value: patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : '-', color: '#7c3aed', icon: <Calendar size={20} /> },
            { label: 'Status', value: patient.status || 'Pending', color: patient.status === 'Completed' ? '#16a34a' : '#d97706', icon: <CheckCircle size={20} /> },
          ].map(card => (
            <div key={card.label} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px 18px', border: '1px solid #e5e7eb', borderTop: `3px solid ${card.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ color: card.color }}>{card.icon}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{card.label}</span>
              </div>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{card.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Patient Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Full Name', value: patient.patientName, icon: <User size={16} /> },
                  { label: 'Age', value: `${patient.age} years`, icon: <Calendar size={16} /> },
                  { label: 'Gender', value: patient.gender, icon: <User size={16} /> },
                  { label: 'Height', value: `${patient.height} cm`, icon: <Activity size={16} /> },
                  { label: 'Weight', value: `${patient.weight} kg`, icon: <Activity size={16} /> },
                  { label: 'BMI', value: patient.bmi || '--', icon: <Activity size={16} /> },
                ].map(field => (
                  <div key={field.label} style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>{field.label}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {field.icon} {field.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Vital Signs</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Blood Pressure', value: patient.bloodPressure, icon: <Heart size={16} /> },
                  { label: 'Heart Rate', value: `${patient.heartRate} bpm`, icon: <Activity size={16} /> },
                  { label: 'SpO₂', value: `${patient.spo2 || '--'}%`, icon: <Activity size={16} /> },
                ].map(vital => (
                  <div key={vital.label} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{vital.label}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      {vital.icon} {vital.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Risk Factors</h3>
              {(patient.riskFactors && patient.riskFactors.length > 0) ? (
                patient.riskFactors.map((factor, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#374151' }}>{factor}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>No risk factors identified</p>
              )}
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>
                  ⚠️ This patient has {(patient.riskFactors && patient.riskFactors.length) || 0} risk factors that may increase peri-operative complications.
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Dosage Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Selected Drug', value: 'Propofol (Induction)', color: '#2563eb' },
                  { label: 'Calculated Dose', value: '140 mg', color: '#16a34a' },
                  { label: 'Dose Range', value: '126 mg - 154 mg', color: '#d97706' },
                ].map(dosage => (
                  <div key={dosage.label} style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{dosage.label}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: '700', color: dosage.color }}>{dosage.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Medical History & Recommendations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Medical History</p>
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {patient.medHistory && Object.keys(patient.medHistory).filter(key => patient.medHistory[key]).length > 0 ? (
                  Object.keys(patient.medHistory).filter(key => patient.medHistory[key]).map((condition, index) => (
                    <span key={index} style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: '600' }}>
                      {condition}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>No medical history recorded</span>
                )}
                {patient.allergies && patient.allergies !== 'None' && (
                  <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: '600' }}>
                    ⚠️ Allergy: {patient.allergies}
                  </span>
                )}
              </div>
              {patient.otherDetails && (
                <p style={{ marginTop: '8px', fontSize: '13px', color: '#475569' }}>{patient.otherDetails}</p>
              )}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Recommendations</p>
              <ul style={{ margin: '8px 0 0', paddingLeft: '18px' }}>
                {[
                  'Thorough pre-anesthesia evaluation recommended.',
                  'Optimize comorbid conditions before surgery.',
                  'Consider additional monitoring.'
                ].map((rec, index) => (
                  <li key={index} style={{ fontSize: '13px', color: '#475569', marginBottom: '4px' }}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <button onClick={() => onNavigate && onNavigate('history')} style={{ padding: '10px 28px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
          Back to History
        </button>
      </main>
    </div>
  );
};

export default PatientDetailsView;