import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './sidebar';
import { API_URL, authHeaders } from '../api/config';
import { SLEEP_DRUGS, estimateDose, recommendSleepDrugs } from './anesthesiaDrugs';

const DosageEstimationScreen = ({ assessmentId, onBack, onGenerateReport, onNavigate }) => {
  const [selectedDrug, setSelectedDrug] = useState(SLEEP_DRUGS[0]);
  const [query, setQuery] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const searchRef = useRef(null);
  const [weight, setWeight] = useState('70');
  const [age, setAge] = useState('45');
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const url = assessmentId
          ? `${API_URL}/assessments/${assessmentId}`
          : `${API_URL}/assessments?limit=1`;
        const response = await fetch(url, { headers: authHeaders() });
        const data = await response.json();
        const latest = assessmentId ? data.assessment : data.assessments?.[0];
        if (data.success && latest) {
          setPatientData(latest);
          if (latest.weight) setWeight(String(latest.weight));
          if (latest.age) setAge(String(latest.age));
          const suggested = recommendSleepDrugs(latest);
          if (suggested[0]) setSelectedDrug(suggested[0]);
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [assessmentId]);

  useEffect(() => {
    const closeList = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setListOpen(false);
    };
    document.addEventListener('mousedown', closeList);
    return () => document.removeEventListener('mousedown', closeList);
  }, []);

  const dose = estimateDose(selectedDrug, weight);
  const calcDose = dose.amount;
  const rangeLow = dose.low;
  const rangeHigh = dose.high;
  const doseUnit = dose.unit;

  const handleGenerateReport = async () => {
    const caseId = patientData?._id || assessmentId;
    if (!caseId) {
      onGenerateReport && onGenerateReport();
      return;
    }

    setSaving(true);
    try {
      await fetch(`${API_URL}/assessments/${caseId}/dosage`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          drugSelected: selectedDrug.label,
          calculatedDose: calcDose,
          doseRange: rangeLow !== null ? `${rangeLow} ${doseUnit} – ${rangeHigh} ${doseUnit}` : '',
        }),
      });
    } catch (error) {
      console.error('Error saving dosage:', error);
    } finally {
      setSaving(false);
      onGenerateReport && onGenerateReport(caseId);
    }
  };

  const suggestions = recommendSleepDrugs(patientData);
  const suggestedLabels = new Set(suggestions.map((drug) => drug.label));
  const searchText = query.trim().toLowerCase();
  const visibleDrugs = SLEEP_DRUGS.filter((drug) => (
    !searchText || drug.label.toLowerCase().includes(searchText)
  ));
  const suggestedVisible = suggestions.filter((drug) => visibleDrugs.some((item) => item.label === drug.label));
  const otherVisible = visibleDrugs.filter((drug) => !suggestedLabels.has(drug.label));

  const chooseDrug = (drug) => {
    setSelectedDrug(drug);
    setQuery('');
    setListOpen(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
      <Sidebar activeLabel="Dosage Estimation" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
        <h1 style={{ fontSize: '21px', fontWeight: '800', color: '#1e293b', margin: '0 0 22px' }}>Dosage Estimation</h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ width: '30px', height: '30px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <p style={{ color: '#94a3b8', marginTop: '12px' }}>Loading patient data...</p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '26px 28px', maxWidth: '720px' }}>
            {/* Patient Info Banner */}
            {patientData && (
              <div style={{ marginBottom: '16px', padding: '10px 14px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#1d4ed8' }}>
                  📋 <strong>{patientData.patientName}</strong> | Age: {patientData.age} | Weight: {patientData.weight}kg | BMI: {patientData.bmi || '--'}
                </p>
              </div>
            )}

            {suggestions.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Suggested for this person</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {suggestions.map((drug) => (
                    <button key={drug.label} type="button" onClick={() => chooseDrug(drug)}
                      style={{ textAlign: 'left', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', border: selectedDrug.label === drug.label ? '1.5px solid #2563eb' : '1.5px solid #dbeafe', background: selectedDrug.label === drug.label ? '#eff6ff' : '#f8fafc' }}>
                      <span style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>{drug.label}</span>
                      <span style={{ display: 'block', marginTop: '3px', fontSize: '12.5px', color: '#475569', lineHeight: '1.45' }}>{drug.reason}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '20px', position: 'relative' }} ref={searchRef}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Select drug</label>
              <input
                value={listOpen ? query : selectedDrug.label}
                placeholder="Search a medicine that puts the person to sleep"
                onFocus={() => { setListOpen(true); setQuery(''); }}
                onChange={(e) => { setQuery(e.target.value); setListOpen(true); }}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}
              />
              {listOpen && (
                <div style={{ position: 'absolute', zIndex: 20, left: 0, right: 0, top: '68px', maxHeight: '240px', overflowY: 'auto', background: '#fff', border: '1.5px solid #d1d5db', borderRadius: '8px', boxShadow: '0 8px 20px rgba(15,23,42,0.12)' }}>
                  {visibleDrugs.length === 0 ? (
                    <p style={{ margin: 0, padding: '12px', fontSize: '13px', color: '#64748b' }}>No matching sleep medicine.</p>
                  ) : (
                    <>
                      {suggestedVisible.map((drug) => (
                        <button key={drug.label} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => chooseDrug(drug)}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', borderBottom: '1px solid #f1f5f9', background: '#f0fdf4', cursor: 'pointer' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#166534' }}>{drug.label}</span>
                          <span style={{ display: 'block', fontSize: '11.5px', color: '#15803d' }}>Suggested for this person</span>
                        </button>
                      ))}
                      {otherVisible.map((drug) => (
                        <button key={drug.label} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => chooseDrug(drug)}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', borderBottom: '1px solid #f1f5f9', background: '#fff', cursor: 'pointer', fontSize: '13.5px', color: '#1e293b' }}>
                          {drug.label}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Standard dose</label>
                <input readOnly value={selectedDrug.standard}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: '700', color: '#1e293b', outline: 'none', backgroundColor: '#f8fafc' }} />
                {selectedDrug.note && (
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>{selectedDrug.note}</p>
                )}
                {dose.capped && (
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#b45309', lineHeight: '1.4' }}>Adult maximum applied: {dose.amount} {doseUnit}.</p>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Patient Weight (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fff' }} />
              </div>
            </div>

            <div style={{ marginBottom: '26px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Age (Years)</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fff', maxWidth: '48%' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '20px' }}>
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Calculated dose</p>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#16a34a', lineHeight: 1 }}>
                  {calcDose !== null ? `${calcDose} ${doseUnit}` : `-- ${doseUnit}`}
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Dose Range (±10%)</p>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>
                  {rangeLow !== null ? `${rangeLow} ${doseUnit} – ${rangeHigh} ${doseUnit}` : `-- ${doseUnit} – -- ${doseUnit}`}
                </p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: '18px' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 14px' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8" strokeWidth="3"/><line x1="12" y1="12" x2="12" y2="16"/>
              </svg>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#1d4ed8', lineHeight: '1.5' }}>
                <strong>Note:</strong> This is an educational estimation only. Actual dose depends on clinical judgment.
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', maxWidth: '720px' }}>
          <button onClick={onBack}
            style={{ padding: '10px 32px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>Back</button>
          <button onClick={handleGenerateReport} disabled={saving}
            style={{ padding: '10px 28px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer', boxShadow: '0 3px 10px rgba(37,99,235,0.35)' }}>{saving ? 'Saving...' : 'Generate Report'}</button>
        </div>
      </main>
    </div>
  );
};

export default DosageEstimationScreen;