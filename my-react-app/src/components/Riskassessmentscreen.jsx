import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { API_URL, authHeaders } from '../api/config';

const marked = (history, key) => Boolean(history && (history[key] === true || history[key] === 'true'));

const asaDetail = (asaClass) => {
  const text = String(asaClass || '');
  const emergency = text.includes('-E');
  const grade = text.replace('ASA ', '').replace('-E', '');
  const meanings = {
    I: 'A healthy person. No important illness was marked.',
    II: 'A mild illness, such as treated high blood pressure, smoking, or extra weight.',
    III: 'A serious illness that limits daily activity, such as heart disease or insulin-treated diabetes.',
    IV: 'A severe illness that is a constant threat to life.',
    V: 'This person is not expected to survive without the operation.',
  };
  const base = meanings[grade] || 'This class describes how sick the person is before surgery.';
  return emergency ? `${base} The E means the operation is an emergency.` : base;
};

const describeScoreCards = (profile) => {
  const heartCount = Number(profile.rcriScore) || 0;
  const lungBand = profile.ariscatBand === 'high' ? 'High' : profile.ariscatBand === 'intermediate' ? 'Intermediate' : 'Low';
  const sleepBand = profile.stopBangBand || 'Low';
  const sleepScore = Number(profile.stopBangScore) || 0;
  return [
    {
      title: 'ASA class',
      meaning: 'How sick this person is before the operation.',
      value: profile.asaClass || 'Not recorded',
      detail: asaDetail(profile.asaClass),
    },
    {
      title: 'Heart risk',
      meaning: 'How many heart-risk items were marked for this person.',
      value: heartCount === 1 ? '1 item' : `${heartCount} items`,
      detail: heartCount === 0
        ? `No heart-risk item was marked. About ${profile.cardiacComplicationPercent}% of similar people had a serious heart problem after surgery.`
        : `${heartCount === 1 ? 'One heart-risk item was' : `${heartCount} heart-risk items were`} marked. About ${profile.cardiacComplicationPercent}% of similar people had a serious heart problem after surgery.`,
    },
    {
      title: 'Lung risk',
      meaning: 'Chance of a breathing problem after this operation.',
      value: `${profile.ariscatScore ?? 0} points · ${lungBand}`,
      detail: `${lungBand} lung score. About ${profile.pulmonaryComplicationPercent}% of similar people had a breathing problem after surgery.`,
    },
    {
      title: 'Sleep apnea screen',
      meaning: 'Chance of blocked breathing during sleep.',
      value: `${sleepScore} of 8 · ${sleepBand}`,
      detail: sleepBand === 'High'
        ? 'A high result. Plan oxygen checks after anesthesia and ask about a night breathing machine.'
        : sleepBand === 'Intermediate'
          ? 'A middle result. Ask about snoring and a night breathing machine, and watch oxygen after anesthesia.'
          : 'This screen does not suggest important sleep apnea for this person.',
    },
  ];
};

const adviceForPatient = (data) => {
  if (!data) return ['Thorough pre-anesthesia evaluation recommended.'];
  const profile = data.riskProfile;
  if (!profile) {
    return data.recommendations?.length ? data.recommendations : ['Thorough pre-anesthesia evaluation recommended.'];
  }

  const history = data.medHistory || {};
  const lines = [];
  const surgery = profile.surgeryName || 'This operation';
  const risk = profile.surgeryRisk || '';

  if (risk === 'Low') {
    lines.push(`${surgery} is a low-risk operation for this person when there is no active illness.`);
  } else if (risk === 'Intermediate') {
    lines.push(`${surgery} is an intermediate-risk operation for this person. The heart and activity answers matter before an elective case.`);
  } else if (risk === 'High') {
    lines.push(`${surgery} is a high-risk operation for this person. A senior anesthesia and surgical review should see an elective case before it goes ahead.`);
  }

  if (profile.urgency === 'Emergency' || data.urgency === 'Emergency') {
    lines.push('This case is marked as an emergency. The stomach may not be empty, so the airway plan should include the chance of vomiting.');
  } else if (profile.urgency === 'Urgent' || data.urgency === 'Urgent') {
    lines.push('This case is marked urgent. There is less time to improve long-term illness before the operation.');
  }

  const capacity = profile.functionalCapacity || data.functionalCapacity;
  if (capacity === '<4') {
    lines.push('This person cannot manage ordinary effort, such as one flight of stairs. Check for active heart disease before an elective operation.');
  } else if (capacity === 'Unknown' && risk !== 'Low') {
    lines.push('Activity level was not known. Ask whether this person can climb one flight of stairs before this elective operation.');
  }

  if (profile.rcriItems?.length) {
    lines.push(`Heart items marked for this person: ${profile.rcriItems.join('; ')}.`);
    if (risk !== 'Low') lines.push('A heart-risk item is present and the operation is not low risk. A recent heart tracing is appropriate.');
  }

  if (profile.lungItems?.length) {
    lines.push(`Lung points for this person come from: ${profile.lungItems.join('; ')}.`);
    if (marked(history, 'recentRespiratoryInfection') && profile.urgency !== 'Emergency' && data.urgency !== 'Emergency') {
      lines.push('A chest infection in the last month was marked. Elective surgery should wait until that infection is treated.');
    } else if ((profile.ariscatScore || 0) >= 26) {
      lines.push('The lung score is not low. Plan breathing exercises and early walking after this operation.');
    }
  }

  if ((profile.stopBangScore || 0) >= 3 && profile.stopItems?.length) {
    lines.push(`Sleep-apnea answers marked for this person: ${profile.stopItems.join(', ')}. Ask if a night breathing machine is used, and watch oxygen after anesthesia.`);
  }
  if (marked(history, 'knownOSA')) {
    lines.push('Known sleep apnea was marked. Confirm the breathing machine will be available after the operation.');
  }

  const mallampati = profile.mallampati || data.mallampati;
  if (mallampati === 'III' || mallampati === 'IV') {
    lines.push(`The mouth opening class is ${mallampati}. Have a difficult-airway plan and experienced help ready before the anesthetic starts.`);
  } else if (marked(history, 'priorDifficultAirway')) {
    lines.push('A previous difficult airway was marked. Have the difficult-airway equipment ready before the anesthetic starts.');
  }

  const fasting = profile.fastingStatus || data.fastingStatus;
  const emergency = profile.urgency === 'Emergency' || data.urgency === 'Emergency';
  if (!emergency && fasting === 'inadequate') {
    lines.push('The recorded fasting time is shorter than the usual wait. Elective anesthesia should wait.');
  }

  if (marked(history, 'insulinTreatedDiabetes')) {
    lines.push('Insulin-treated diabetes was marked. This person needs a blood-sugar plan from the clinical team. This screen does not set an insulin dose.');
  }
  if (marked(history, 'usesAnticoagulant')) {
    lines.push('A blood thinner was marked. Do not stop it from this screen. The prescribing clinician and the surgeon decide the timing.');
  }
  if (marked(history, 'currentSmoker')) {
    lines.push('Current smoking was marked. Stopping before an elective operation lowers airway and lung risk.');
  }
  if (marked(history, 'hypertension')) {
    lines.push('High blood pressure was marked. Confirm it is controlled on the day of an elective operation.');
  }
  if (marked(history, 'copdOrAsthma')) {
    lines.push('COPD or asthma was marked. Ask about recent wheeze and whether inhalers are being used.');
  }
  if (marked(history, 'severeLiverDisease')) {
    lines.push('Severe liver disease was marked. Drug choice and fluids need a review of recent liver tests.');
  }
  if (marked(history, 'endStageRenal') || marked(history, 'creatinineOver2')) {
    lines.push('Kidney disease was marked. Drug choice and fluids need a review of recent kidney tests.');
  }
  if (marked(history, 'constantThreatToLife') || marked(history, 'moribund')) {
    lines.push('A life-threatening illness was marked. Elective surgery should wait for a clinical review.');
  }

  const bmi = Number(data.bmi);
  if (bmi >= 40) {
    lines.push(`Body mass index is ${data.bmi}. That is severe extra weight, so airway and breathing after anesthesia need extra attention.`);
  } else if (bmi >= 30) {
    lines.push(`Body mass index is ${data.bmi}. Extra weight is part of the sleep and airway check for this person.`);
  }

  const [high, low] = String(data.bloodPressure || '').split('/').map((part) => Number(part));
  if (high >= 180 || low >= 110) {
    lines.push(`Blood pressure is ${data.bloodPressure} mmHg. That is very high for an elective operation and should be reviewed before anesthesia.`);
  } else if ((high > 0 && high < 90) || (low > 0 && low < 60)) {
    lines.push(`Blood pressure is ${data.bloodPressure} mmHg. That is low and should be reviewed before anesthesia.`);
  }

  const allergies = String(data.allergies || '').trim();
  if (allergies && allergies.toLowerCase() !== 'none') {
    lines.push(`Allergies recorded for this person: ${allergies}. Avoid those drugs and materials.`);
  }

  if (!lines.length) {
    lines.push('The answers entered for this person do not add a special warning beyond the usual pre-anesthesia check.');
  }
  return lines;
};

const RiskAssessmentScreen = ({ assessmentId, onBack, onContinue, onNavigate }) => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiskData = async () => {
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

        if (assessmentId && data.success && data.assessment) {
          setRiskData(data.assessment);
        } else if (data.success && data.assessments?.length) {
          setRiskData(data.assessments[0]);
        }
      } catch (error) {
        console.error('Error fetching risk data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskData();
  }, [assessmentId]);

  const displayRiskFactors = Array.isArray(riskData?.riskFactors) ? riskData.riskFactors : [];
  const recommendations = adviceForPatient(riskData);
  const scoreCards = riskData?.riskProfile ? describeScoreCards(riskData.riskProfile) : [];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f1f5f9' }}>
      <Sidebar activeLabel="Risk Assessment" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
        <h1 style={{ margin: '0 0 2px', fontSize: '21px', fontWeight: '800', color: '#1e293b' }}>Risk Assessment Result</h1>
        <p style={{ margin: '0 0 22px', fontSize: '13px', color: '#64748b' }}>Based on the entered patient information</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#64748b' }}>Loading risk assessment...</p>
          </div>
        ) : riskData ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>Overall Risk Level</p>
                <div style={{ backgroundColor: riskData.riskLevel === 'High' ? '#ef4444' : riskData.riskLevel === 'Moderate' ? '#d97706' : '#16a34a', borderRadius: '10px', padding: '14px 36px', textAlign: 'center', boxShadow: `0 4px 14px ${riskData.riskLevel === 'High' ? 'rgba(239,68,68,0.35)' : riskData.riskLevel === 'Moderate' ? 'rgba(217,119,6,0.35)' : 'rgba(22,163,74,0.35)'}` }}>
                  <span style={{ color: '#fff', fontWeight: '800', fontSize: '22px' }}>{riskData.riskLevel || 'Unknown'}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '12.5px', fontWeight: '600', color: '#64748b' }}>Risk Score</p>
                  <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>
                    {riskData.riskScore || 0} <span style={{ fontSize: '18px', color: '#94a3b8', fontWeight: '600' }}>{riskData.scoreBasis === 'guideline-index-100' ? '/ 100' : ''}</span>
                  </p>
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '22px 24px' }}>
                <p style={{ margin: '0 0 14px', fontSize: '13.5px', fontWeight: '700', color: '#374151' }}>Risk Factors</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                  {displayRiskFactors.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>No scored risk factors for this case.</p>
                  ) : displayRiskFactors.map((factor, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#2563eb', flexShrink: 0, display: 'inline-block' }} />
                      <span style={{ fontSize: '13.5px', color: '#374151' }}>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {scoreCards.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '16px' }}>
                {scoreCards.map((card) => (
                  <div key={card.title} style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '14px', padding: '22px 20px' }}>
                    <p style={{ margin: 0, fontSize: '15px', color: '#334155', fontWeight: '800' }}>{card.title}</p>
                    <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#64748b', lineHeight: '1.45' }}>{card.meaning}</p>
                    <p style={{ margin: '14px 0 0', fontSize: '22px', fontWeight: '800', color: '#1e293b', lineHeight: '1.25' }}>{card.value}</p>
                    <p style={{ margin: '10px 0 0', fontSize: '15px', color: '#334155', lineHeight: '1.5' }}>{card.detail}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '20px 24px', marginBottom: '14px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>How the 0–100 score is built</p>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }}>
                {riskData.riskProfile
                  ? `This is a teaching index, not a predicted chance of death. Cardiac findings contribute up to 30, lung findings up to 30, airway and STOP-Bang up to 15, functional capacity up to 10, and ASA class up to 15. The percentages above are the published complication rates for the Revised Cardiac Risk Index and ARISCAT, not this combined score. ${riskData.riskProfile.surgeryName} is ${riskData.riskProfile.surgeryRisk} surgical risk.`
                  : 'This older case used a short checklist. Edit and save it to recalculate with the guideline index.'}
              </p>
            </div>

            <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '20px 24px', marginBottom: '28px' }}>
              <p style={{ margin: '0 0 12px', fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>Recommendations</p>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recommendations.map((rec, i) => (
                  <li key={i} style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.5' }}>{rec}</li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '16px', color: '#64748b' }}>No assessment data available.</p>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>Please create an assessment first.</p>
            <button 
              onClick={() => onNavigate && onNavigate('patientInput')}
              style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
            >
              Start New Assessment
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button onClick={onBack}
            style={{ padding: '10px 32px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f8fafc'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fff'; }}>Back</button>
          <button onClick={() => onContinue && onContinue(riskData?._id)}
            style={{ padding: '10px 28px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer', boxShadow: '0 3px 10px rgba(37,99,235,0.35)', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
            onMouseOver={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#1d4ed8,#1e40af)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#2563eb,#1d4ed8)'; }}>Continue to Dosage Estimation</button>
        </div>
      </main>
    </div>
  );
};

export default RiskAssessmentScreen;