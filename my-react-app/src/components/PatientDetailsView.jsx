// src/components/PatientDetailsView.jsx
import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { ArrowLeft, Download, Printer, Edit, User, Calendar, Heart, Activity, Pill, AlertTriangle, CheckCircle } from 'lucide-react';
import { getAssessmentById } from '../api/assessments';

const PatientDetailsView = ({ onNavigate, patientId }) => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    if (!patientId) {
      setLoadError('No assessment selected.');
      setLoading(false);
      return;
    }

    const loadPatient = async () => {
      try {
        const data = await getAssessmentById(patientId);
        setPatient(data);
      } catch (err) {
        console.error('Failed to load patient details:', err);
        setLoadError('Could not load this patient\'s details.');
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
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

  if (loadError || !patient) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
        <Sidebar activeLabel="History" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
        <main style={{ flex: 1, padding: '40px', textAlign: 'center' }}>
          <h2>{loadError || 'Patient not found'}</h2>
          <button onClick={() => onNavigate && onNavigate('history')} style={{ marginTop: '16px', padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
            Back to History
          </button>
        </main>
      </div>
    );
  }

  // --- Derive display-friendly values from the real saved document ---
  const createdDate = patient.createdAt ? new Date(patient.createdAt) : null;
  const dateStr = createdDate ? createdDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const timeStr = createdDate ? createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';

  // medHistory comes back as an object like { Hypertension: true, Smoking: false }
  // — we only want to display the ones that are actually true.
  const medicalHistoryList = Object.entries(patient.medHistory || {})
    .filter(([, checked]) => checked)
    .map(([condition]) => condition);

  const genderLabel = patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : '—';

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f1f5f9' }}>
      <Sidebar activeLabel="History" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />

      <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {/* Header */}
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

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' }}>
          {[
            { label: 'Risk Level', value: patient.riskLevel, color: patient.riskLevel === 'High' ? '#dc2626' : patient.riskLevel === 'Moderate' ? '#d97706' : '#16a34a', icon: <AlertTriangle size={20} /> },
            { label: 'Risk Score', value: `${patient.riskScore}/12`, color: '#2563eb', icon: <Activity size={20} /> },
            { label: 'Assessment Date', value: dateStr, color: '#7c3aed', icon: <Calendar size={20} /> },
            { label: 'Status', value: patient.status, color: patient.status === 'Completed' ? '#16a34a' : '#d97706', icon: <CheckCircle size={20} /> },
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

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Left Column */}
          <div>
            {/* Patient Info */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Patient Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Full Name', value: patient.patientName, icon: <User size={16} /> },
                  { label: 'Age', value: `${patient.age} years`, icon: <Calendar size={16} /> },
                  { label: 'Gender', value: genderLabel, icon: <User size={16} /> },
                  { label: 'Height', value: `${patient.height} cm`, icon: <Activity size={16} /> },
                  { label: 'Weight', value: `${patient.weight} kg`, icon: <Activity size={16} /> },
                  { label: 'BMI', value: patient.bmi ?? '—', icon: <Activity size={16} /> },
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

            {/* Vital Signs */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Vital Signs</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Blood Pressure', value: patient.bloodPressure, icon: <Heart size={16} /> },
                  { label: 'Heart Rate', value: `${patient.heartRate} bpm`, icon: <Activity size={16} /> },
                  { label: 'SpO₂', value: patient.spo2 ? `${patient.spo2}%` : '—', icon: <Activity size={16} /> },
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

          {/* Right Column */}
          <div>
            {/* Risk Factors */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Risk Factors</h3>
              {patient.riskFactors && patient.riskFactors.length > 0 ? (
                <>
                  {patient.riskFactors.map((factor, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: '#374151' }}>{factor.label}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>
                      ⚠️ This patient has {patient.riskFactors.length} risk factor(s) that may increase peri-operative complications.
                    </p>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>No risk factors identified — this patient is low risk.</p>
              )}
            </div>

            {/* Dosage Summary */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Dosage Summary</h3>
              {patient.drugSelected ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'Selected Drug', value: patient.drugSelected, color: '#2563eb' },
                    { label: 'Calculated Dose', value: patient.calculatedDose, color: '#16a34a' },
                    { label: 'Dose Range', value: patient.doseRange, color: '#d97706' },
                  ].map(dosage => (
                    <div key={dosage.label} style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{dosage.label}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: '700', color: dosage.color }}>{dosage.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>No dosage has been calculated for this patient yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Medical History & Recommendations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Medical History</p>
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {medicalHistoryList.length > 0 ? (
                  medicalHistoryList.map((condition, index) => (
                    <span key={index} style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: '600' }}>
                      {condition}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>None reported</span>
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
                {(patient.recommendations || []).map((rec, index) => (
                  <li key={index} style={{ fontSize: '13px', color: '#475569', marginBottom: '4px' }}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </main>
    </div>
  );
};

export default PatientDetailsView;