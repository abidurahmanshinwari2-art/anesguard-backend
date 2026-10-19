const { findSurgery } = require('../data/surgeries');

// Published major-cardiac-complication rates from the Lee validation cohort.
// Lee TH et al. Circulation. 1999;100:1043-1049.
const LEE_RATES = { 0: 0.4, 1: 0.9, 2: 6.6, 3: 11.0 };

// Published postoperative pulmonary complication rates from the ARISCAT derivation cohort.
// Canet J et al. Anesthesiology. 2010;113:1338-1350.
const ARISCAT_RATES = { low: 1.6, intermediate: 13.3, high: 42.1 };

const REFERENCES = [
  'ASA Physical Status Classification System. American Society of Anesthesiologists.',
  'Lee TH, et al. Circulation. 1999;100:1043-1049. Revised Cardiac Risk Index. Validation-cohort major cardiac complication rates: 0.4%, 0.9%, 6.6%, and 11% for 0, 1, 2, and 3 or more factors.',
  'Canet J, et al. Anesthesiology. 2010;113:1338-1350. ARISCAT pulmonary score. Derivation-cohort complication rates: 1.6% (low), 13.3% (intermediate), 42.1% (high).',
  'Chung F, et al. Anesthesiology. 2008;108:812-821. STOP-Bang screen for obstructive sleep apnea.',
  'Halvorsen S, et al. Eur Heart J. 2022;43:3826-3924. ESC surgical risk groups for non-cardiac surgery.',
  'Fleisher LA, et al. Circulation. 2014;130:e278-e333. Poor functional capacity is under 4 METs.',
  'American Society of Anesthesiologists. Practice guidelines for preoperative fasting. Anesthesiology. 2017;126:376-393.',
];

const on = (history, key) => Boolean(history && (history[key] === true || history[key] === 'true'));

const pulmonaryPoints = (ariscat) => {
  if (ariscat < 26) return (ariscat / 26) * 10;
  if (ariscat < 45) return 10 + ((ariscat - 26) / 19) * 10;
  return Math.min(30, 20 + ((ariscat - 45) / 31) * 10);
};

const calculateRisk = ({
  age,
  bmi,
  gender,
  spo2,
  medHistory = {},
  surgeryType,
  urgency = 'Elective',
  expectedDuration = '<2',
  functionalCapacity = 'Unknown',
  mallampati = 'I',
  neckCircumference,
  fastingStatus = 'light-ok',
}) => {
  const surgery = findSurgery(surgeryType);
  if (!surgery) {
    return { error: 'Choose a surgery type from the list' };
  }

  const years = Number(age) || 0;
  const bmiValue = Number(bmi) || 0;
  const oxygen = Number(spo2);
  const neck = Number(neckCircumference);
  const male = String(gender || '').toLowerCase() === 'male';
  const emergency = urgency === 'Emergency';

  const rcriItems = [];
  if (surgery.rcriHighRisk) rcriItems.push('High-risk surgery (intraperitoneal, intrathoracic, or suprainguinal vascular)');
  if (on(medHistory, 'ischemicHeartDisease')) rcriItems.push('Ischemic heart disease');
  if (on(medHistory, 'heartFailure')) rcriItems.push('History of heart failure');
  if (on(medHistory, 'cerebrovascularDisease')) rcriItems.push('History of cerebrovascular disease');
  if (on(medHistory, 'insulinTreatedDiabetes')) rcriItems.push('Diabetes treated with insulin');
  if (on(medHistory, 'creatinineOver2')) rcriItems.push('Preoperative creatinine above 2.0 mg/dL');
  const rcriScore = rcriItems.length;
  const cardiacRate = LEE_RATES[Math.min(3, rcriScore)];

  let ariscat = 0;
  const lungItems = [];
  if (years > 80) { ariscat += 16; lungItems.push('Age over 80 (16)'); }
  else if (years >= 51) { ariscat += 3; lungItems.push('Age 51–80 (3)'); }
  if (Number.isFinite(oxygen) && oxygen <= 90) { ariscat += 24; lungItems.push('SpO₂ 90% or lower (24)'); }
  else if (Number.isFinite(oxygen) && oxygen <= 95) { ariscat += 8; lungItems.push('SpO₂ 91–95% (8)'); }
  if (on(medHistory, 'recentRespiratoryInfection')) { ariscat += 17; lungItems.push('Respiratory infection in the last month (17)'); }
  if (on(medHistory, 'anemia')) { ariscat += 11; lungItems.push('Anemia with hemoglobin 10 g/dL or lower (11)'); }
  if (surgery.incision === 'intrathoracic') { ariscat += 24; lungItems.push('Intrathoracic incision (24)'); }
  else if (surgery.incision === 'upperAbdominal') { ariscat += 15; lungItems.push('Upper abdominal incision (15)'); }
  if (expectedDuration === '>3') { ariscat += 23; lungItems.push('Expected duration over 3 hours (23)'); }
  else if (expectedDuration === '2-3') { ariscat += 16; lungItems.push('Expected duration 2–3 hours (16)'); }
  if (emergency) { ariscat += 8; lungItems.push('Emergency procedure (8)'); }
  const ariscatBand = ariscat >= 45 ? 'high' : ariscat >= 26 ? 'intermediate' : 'low';
  const pulmonaryRate = ARISCAT_RATES[ariscatBand];

  const stopItems = [];
  if (on(medHistory, 'snoring')) stopItems.push('Snoring');
  if (on(medHistory, 'daytimeTiredness')) stopItems.push('Daytime tiredness');
  if (on(medHistory, 'observedApnea')) stopItems.push('Observed apnea');
  if (on(medHistory, 'hypertension')) stopItems.push('Treated or known hypertension');
  if (bmiValue > 35) stopItems.push('BMI over 35');
  if (years > 50) stopItems.push('Age over 50');
  if (neck > 40) stopItems.push('Neck circumference over 40 cm');
  if (male) stopItems.push('Male sex');
  const stopBangScore = stopItems.length;
  const stopBand = stopBangScore >= 5 ? 'High' : stopBangScore >= 3 ? 'Intermediate' : 'Low';

  const difficultAirway = on(medHistory, 'priorDifficultAirway') || mallampati === 'III' || mallampati === 'IV';

  let asaNumber = 'I';
  if (on(medHistory, 'moribund')) asaNumber = 'V';
  else if (on(medHistory, 'constantThreatToLife')) asaNumber = 'IV';
  else if (
    on(medHistory, 'ischemicHeartDisease')
    || on(medHistory, 'heartFailure')
    || on(medHistory, 'cerebrovascularDisease')
    || on(medHistory, 'insulinTreatedDiabetes')
    || on(medHistory, 'creatinineOver2')
    || on(medHistory, 'endStageRenal')
    || on(medHistory, 'severeLiverDisease')
    || on(medHistory, 'copdOrAsthma')
    || on(medHistory, 'knownOSA')
    || bmiValue >= 40
    || stopBangScore >= 5
  ) asaNumber = 'III';
  else if (
    on(medHistory, 'hypertension')
    || on(medHistory, 'currentSmoker')
    || on(medHistory, 'snoring')
    || bmiValue >= 30
    || stopBangScore >= 3
  ) asaNumber = 'II';
  const asaClass = emergency ? `ASA ${asaNumber}-E` : `ASA ${asaNumber}`;

  const cardiacPart = (rcriScore / 6) * 30;
  const pulmonaryPart = pulmonaryPoints(ariscat);
  const airwayRaw = stopBangScore + (difficultAirway ? 2 : 0);
  const airwayPart = (Math.min(10, airwayRaw) / 10) * 15;
  const functionalPart = functionalCapacity === '<4' ? 10 : functionalCapacity === 'Unknown' ? 4 : 0;
  const asaPart = { I: 0, II: 4, III: 8, IV: 12, V: 15 }[asaNumber];
  const riskScore = Math.max(0, Math.min(100, Math.round(cardiacPart + pulmonaryPart + airwayPart + functionalPart + asaPart)));
  const riskLevel = riskScore >= 60 ? 'High' : riskScore >= 30 ? 'Moderate' : 'Low';

  const recommendations = [];

  if (surgery.risk === 'Low') {
    recommendations.push(`${surgery.name} is a low-risk operation for this person when there is no active illness.`);
  } else if (surgery.risk === 'Intermediate') {
    recommendations.push(`${surgery.name} is an intermediate-risk operation for this person. The heart and activity answers matter before an elective case.`);
  } else {
    recommendations.push(`${surgery.name} is a high-risk operation for this person. A senior anesthesia and surgical review should see an elective case before it goes ahead.`);
  }

  if (emergency) {
    recommendations.push('This case is marked as an emergency. The stomach may not be empty, so the airway plan should include the chance of vomiting.');
  } else if (urgency === 'Urgent') {
    recommendations.push('This case is marked urgent. There is less time to improve long-term illness before the operation.');
  }

  if (functionalCapacity === '<4') {
    recommendations.push('This person cannot manage ordinary effort, such as one flight of stairs. Check for active heart disease before an elective operation.');
  } else if (functionalCapacity === 'Unknown' && surgery.risk !== 'Low') {
    recommendations.push('Activity level was not known. Ask whether this person can climb one flight of stairs before this elective operation.');
  }

  if (rcriItems.length) {
    recommendations.push(`Heart items marked for this person: ${rcriItems.join('; ')}.`);
    if (surgery.risk !== 'Low') {
      recommendations.push('A heart-risk item is present and the operation is not low risk. A recent heart tracing is appropriate.');
    }
  }

  if (lungItems.length) {
    recommendations.push(`Lung points for this person come from: ${lungItems.join('; ')}.`);
    if (on(medHistory, 'recentRespiratoryInfection') && !emergency) {
      recommendations.push('A chest infection in the last month was marked. Elective surgery should wait until that infection is treated.');
    } else if (ariscat >= 26) {
      recommendations.push('The lung score is not low. Plan breathing exercises and early walking after this operation.');
    }
  }

  if (stopBangScore >= 3 && stopItems.length) {
    recommendations.push(`Sleep-apnea answers marked for this person: ${stopItems.join(', ')}. Ask if a night breathing machine is used, and watch oxygen after anesthesia.`);
  }
  if (on(medHistory, 'knownOSA')) {
    recommendations.push('Known sleep apnea was marked. Confirm the breathing machine will be available after the operation.');
  }

  if (mallampati === 'III' || mallampati === 'IV') {
    recommendations.push(`The mouth opening class is ${mallampati}. Have a difficult-airway plan and experienced help ready before the anesthetic starts.`);
  } else if (on(medHistory, 'priorDifficultAirway')) {
    recommendations.push('A previous difficult airway was marked. Have the difficult-airway equipment ready before the anesthetic starts.');
  }

  if (!emergency && fastingStatus === 'inadequate') {
    recommendations.push('The recorded fasting time is shorter than the usual wait. Elective anesthesia should wait.');
  }

  if (on(medHistory, 'insulinTreatedDiabetes')) {
    recommendations.push('Insulin-treated diabetes was marked. This person needs a blood-sugar plan from the clinical team. This form does not set an insulin dose.');
  }
  if (on(medHistory, 'usesAnticoagulant')) {
    recommendations.push('A blood thinner was marked. Do not stop it from this form. The prescribing clinician and the surgeon decide the timing.');
  }
  if (on(medHistory, 'currentSmoker')) {
    recommendations.push('Current smoking was marked. Stopping before an elective operation lowers airway and lung risk.');
  }
  if (on(medHistory, 'hypertension')) {
    recommendations.push('High blood pressure was marked. Confirm it is controlled on the day of an elective operation.');
  }
  if (on(medHistory, 'copdOrAsthma')) {
    recommendations.push('COPD or asthma was marked. Ask about recent wheeze and whether inhalers are being used.');
  }
  if (on(medHistory, 'severeLiverDisease')) {
    recommendations.push('Severe liver disease was marked. Drug choice and fluids need a review of recent liver tests.');
  }
  if (on(medHistory, 'endStageRenal') || on(medHistory, 'creatinineOver2')) {
    recommendations.push('Kidney disease was marked. Drug choice and fluids need a review of recent kidney tests.');
  }
  if (on(medHistory, 'constantThreatToLife') || on(medHistory, 'moribund')) {
    recommendations.push('A life-threatening illness was marked. Elective surgery should wait for a clinical review.');
  }
  if (bmiValue >= 40) {
    recommendations.push(`Body mass index is ${bmiValue}. That is severe extra weight, so airway and breathing after anesthesia need extra attention.`);
  } else if (bmiValue >= 30) {
    recommendations.push(`Body mass index is ${bmiValue}. Extra weight is part of the sleep and airway check for this person.`);
  }

  if (!recommendations.length) {
    recommendations.push('The answers entered for this person do not add a special warning beyond the usual pre-anesthesia check.');
  }

  const riskFactors = [
    asaClass,
    `${surgery.name} (${surgery.risk} surgical risk)`,
    ...rcriItems.map((item) => `Cardiac: ${item}`),
    ...lungItems.map((item) => `Lung: ${item}`),
    ...stopItems.map((item) => `STOP-Bang: ${item}`),
  ];
  if (functionalCapacity === '<4') riskFactors.push('Functional capacity under 4 METs');
  if (difficultAirway) riskFactors.push('Possible difficult airway');

  return {
    riskScore,
    riskLevel,
    riskFactors: riskFactors.map((label) => ({ label })),
    recommendations,
    references: REFERENCES,
    scoreBasis: 'guideline-index-100',
    asaClass,
    riskProfile: {
      asaClass,
      surgeryId: surgery.id,
      surgeryName: surgery.name,
      surgeryRisk: surgery.risk,
      rcriScore,
      rcriItems,
      cardiacComplicationPercent: cardiacRate,
      ariscatScore: ariscat,
      ariscatBand,
      lungItems,
      pulmonaryComplicationPercent: pulmonaryRate,
      stopBangScore,
      stopBangBand: stopBand,
      stopItems,
      functionalCapacity,
      mallampati,
      fastingStatus,
      urgency,
      parts: {
        cardiac: Math.round(cardiacPart),
        pulmonary: Math.round(pulmonaryPart),
        airway: Math.round(airwayPart),
        functional: functionalPart,
        asa: asaPart,
      },
    },
  };
};

module.exports = { calculateRisk, REFERENCES };
