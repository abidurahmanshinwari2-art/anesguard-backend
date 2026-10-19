export const formatAmount = (value) => {
  if (value == null || Number.isNaN(Number(value))) return null;
  const abs = Math.abs(Number(value));
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : abs >= 1 ? 2 : 3;
  return Number(Number(value).toFixed(digits));
};

const perKg = (group, label, dose, unit, extra = {}) => ({
  group,
  label,
  kind: 'perKg',
  dose,
  unit,
  standard: extra.max != null ? `${dose} ${unit}/kg, up to ${extra.max} ${unit}` : `${dose} ${unit}/kg`,
  ...extra,
});

const fixed = (group, label, dose, unit, extra = {}) => ({
  group,
  label,
  kind: 'fixed',
  dose,
  unit,
  standard: `${dose} ${unit}`,
  ...extra,
});

// Adult teaching doses used in current anesthetic practice.
// Weight-based amounts are a usual single dose. Local-anesthetic entries are maximums.
export const DRUGS = [
  perKg('Asleep for surgery', 'Propofol (induction)', 2, 'mg', { sleep: true }),
  perKg('Asleep for surgery', 'Thiopental (induction)', 4, 'mg', { sleep: true }),
  perKg('Asleep for surgery', 'Methohexital (induction)', 1.5, 'mg', { sleep: true }),
  perKg('Asleep for surgery', 'Etomidate (induction)', 0.3, 'mg', { sleep: true }),
  perKg('Asleep for surgery', 'Ketamine (IV induction)', 1.5, 'mg', { sleep: true }),
  perKg('Asleep for surgery', 'Ketamine (IM induction)', 4, 'mg', { sleep: true, note: 'Intramuscular dose, used when a vein is not available.' }),
  perKg('Induction and sedation', 'Midazolam (sedation)', 0.05, 'mg'),
  perKg('Induction and sedation', 'Dexmedetomidine (loading)', 1, 'mcg', { note: 'Usual loading amount, given slowly.' }),

  fixed('Asleep for surgery', 'Sevoflurane (about 1 MAC)', 2, '%', { sleep: true, note: 'Breathed in to start or keep sleep. Weight is not used.' }),
  fixed('Asleep for surgery', 'Isoflurane (about 1 MAC)', 1.2, '%', { sleep: true, note: 'Breathed in to keep the person asleep. Weight is not used.' }),
  fixed('Asleep for surgery', 'Desflurane (about 1 MAC)', 6, '%', { sleep: true, note: 'Breathed in to keep the person asleep. It wears off quickly. Weight is not used.' }),
  fixed('Inhaled anesthetic', 'Nitrous oxide (adjunct)', 50, '%', { note: 'Typical added concentration with oxygen. Weight is not used.' }),

  perKg('Opioid', 'Fentanyl (analgesia)', 2, 'mcg'),
  perKg('Opioid', 'Sufentanil (induction adjunct)', 0.5, 'mcg'),
  perKg('Opioid', 'Remifentanil (bolus)', 1, 'mcg'),
  perKg('Opioid', 'Alfentanil (induction adjunct)', 20, 'mcg'),
  perKg('Opioid', 'Morphine (analgesia)', 0.1, 'mg'),
  perKg('Opioid', 'Hydromorphone (analgesia)', 0.01, 'mg'),
  perKg('Opioid', 'Meperidine (analgesia)', 0.5, 'mg'),
  perKg('Opioid', 'Tramadol (analgesia)', 1, 'mg', { max: 100 }),
  perKg('Opioid', 'Nalbuphine (analgesia)', 0.1, 'mg'),

  perKg('Muscle relaxant', 'Succinylcholine (intubation)', 1, 'mg'),
  perKg('Muscle relaxant', 'Rocuronium (intubation)', 0.6, 'mg'),
  perKg('Muscle relaxant', 'Rocuronium (rapid sequence)', 1.2, 'mg'),
  perKg('Muscle relaxant', 'Vecuronium (intubation)', 0.1, 'mg'),
  perKg('Muscle relaxant', 'Atracurium (intubation)', 0.5, 'mg'),
  perKg('Muscle relaxant', 'Cisatracurium (intubation)', 0.15, 'mg'),
  perKg('Muscle relaxant', 'Pancuronium (intubation)', 0.1, 'mg'),
  perKg('Muscle relaxant', 'Mivacurium (intubation)', 0.2, 'mg'),

  perKg('Reversal', 'Neostigmine', 0.05, 'mg'),
  perKg('Reversal', 'Glycopyrrolate (with neostigmine)', 0.01, 'mg', { note: 'Usual partner dose: about 0.2 mg for each 1 mg of neostigmine.' }),
  perKg('Reversal', 'Atropine (with neostigmine)', 0.02, 'mg'),
  perKg('Reversal', 'Edrophonium', 0.5, 'mg'),
  perKg('Reversal', 'Sugammadex (usual reversal)', 2, 'mg'),
  perKg('Reversal', 'Sugammadex (deep block)', 4, 'mg'),
  perKg('Reversal', 'Sugammadex (immediate reversal)', 16, 'mg', { note: 'Labeled immediate reversal soon after a rocuronium dose.' }),
  fixed('Reversal', 'Naloxone (starting IV dose)', 0.04, 'mg', { note: 'A small starting amount. Further doses are titrated.' }),
  fixed('Reversal', 'Flumazenil (starting IV dose)', 0.2, 'mg', { note: 'A small starting amount. Further doses are titrated.' }),

  perKg('Local anesthetic', 'Lidocaine (maximum, no epinephrine)', 4.5, 'mg', { max: 300, note: 'Teaching maximum for one dose. Not an amount to inject.' }),
  perKg('Local anesthetic', 'Lidocaine with epinephrine (maximum)', 7, 'mg', { max: 500, note: 'Teaching maximum for one dose. Not an amount to inject.' }),
  perKg('Local anesthetic', 'Bupivacaine (maximum)', 2, 'mg', { max: 175, note: 'Teaching maximum for one dose. Not an amount to inject.' }),
  perKg('Local anesthetic', 'Levobupivacaine (maximum)', 2, 'mg', { max: 150, note: 'Teaching maximum for one dose. Not an amount to inject.' }),
  perKg('Local anesthetic', 'Ropivacaine (maximum)', 3, 'mg', { max: 200, note: 'Teaching maximum for one dose. Not an amount to inject.' }),
  perKg('Local anesthetic', 'Mepivacaine (maximum)', 4.5, 'mg', { max: 400, note: 'Teaching maximum for one dose. Not an amount to inject.' }),
  perKg('Local anesthetic', 'Chloroprocaine (maximum)', 11, 'mg', { max: 800, note: 'Teaching maximum for one dose. Not an amount to inject.' }),
  perKg('Local anesthetic', 'Prilocaine (maximum)', 6, 'mg', { max: 600, note: 'Teaching maximum for one dose. Not an amount to inject.' }),

  fixed('Nausea', 'Ondansetron', 4, 'mg'),
  fixed('Nausea', 'Dexamethasone', 4, 'mg'),
  fixed('Nausea', 'Granisetron', 1, 'mg'),
  fixed('Nausea', 'Palonosetron', 0.075, 'mg'),
  fixed('Nausea', 'Metoclopramide', 10, 'mg'),
  fixed('Nausea', 'Droperidol', 0.625, 'mg'),

  fixed('Heart and blood pressure', 'Ephedrine (IV bolus)', 5, 'mg', { note: 'Usual first bolus. Weight is not used.' }),
  fixed('Heart and blood pressure', 'Phenylephrine (IV bolus)', 100, 'mcg', { note: 'Usual first bolus. Weight is not used.' }),
  fixed('Heart and blood pressure', 'Epinephrine (small IV bolus)', 10, 'mcg', { note: 'A small anesthesia bolus. This is not the 1 mg cardiac-arrest dose.' }),
  perKg('Heart and blood pressure', 'Esmolol (starting bolus)', 0.5, 'mg'),
  fixed('Heart and blood pressure', 'Labetalol (starting IV bolus)', 5, 'mg', { note: 'Usual first bolus. Weight is not used.' }),
  fixed('Heart and blood pressure', 'Hydralazine (starting IV bolus)', 5, 'mg', { note: 'Usual first bolus. Weight is not used.' }),
  fixed('Heart and blood pressure', 'Nitroglycerin (IV bolus)', 50, 'mcg', { note: 'Usual first bolus. Weight is not used.' }),

  perKg('Pain and other drugs', 'Lidocaine (IV, before airway)', 1, 'mg'),
  perKg('Pain and other drugs', 'Paracetamol (IV)', 15, 'mg', { max: 1000 }),
  {
    group: 'Pain and other drugs',
    label: 'Ketorolac (IV)',
    kind: 'byWeight',
    unit: 'mg',
    standard: '30 mg (15 mg if under 50 kg)',
    pick: (weight) => (weight < 50 ? 15 : 30),
  },
  fixed('Pain and other drugs', 'Parecoxib (IV)', 40, 'mg'),
  perKg('Pain and other drugs', 'Tranexamic acid', 10, 'mg'),
  {
    group: 'Pain and other drugs',
    label: 'Cefazolin (prophylaxis)',
    kind: 'byWeight',
    unit: 'mg',
    standard: '2000 mg (3000 mg at 120 kg or more)',
    pick: (weight) => (weight >= 120 ? 3000 : 2000),
  },
  fixed('Pain and other drugs', 'Oxytocin (IV bolus)', 5, 'IU', { note: 'Usual obstetric bolus. Weight is not used.' }),
  fixed('Pain and other drugs', 'Carbetocin', 100, 'mcg', { note: 'Usual single dose. Weight is not used.' }),

  perKg('Emergency treatment', 'Dantrolene (first dose)', 2.5, 'mg', { note: 'First dose used for malignant hyperthermia.' }),
  perKg('Emergency treatment', 'Lipid emulsion 20% (first bolus)', 1.5, 'mL', { note: 'First bolus used for local-anesthetic toxicity.' }),
];

export const DRUG_GROUPS = [...new Set(DRUGS.map((drug) => drug.group))];

export const SLEEP_DRUGS = DRUGS.filter((drug) => drug.sleep);

const marked = (history, key) => Boolean(history && (history[key] === true || history[key] === 'true'));

const findSleepDrug = (label) => SLEEP_DRUGS.find((drug) => drug.label === label);

export const recommendSleepDrugs = (patient) => {
  if (!patient) return [];
  const history = patient.medHistory || {};
  const [systolic, diastolic] = String(patient.bloodPressure || '').split('/').map((part) => Number(part));
  const lowPressure = (systolic > 0 && systolic < 90) || (diastolic > 0 && diastolic < 60);
  const highPressure = marked(history, 'hypertension') || systolic >= 160 || diastolic >= 100;
  const heartDisease = marked(history, 'ischemicHeartDisease');
  const unstable = lowPressure || marked(history, 'heartFailure') || marked(history, 'constantThreatToLife') || marked(history, 'moribund');
  const irritableLungs = marked(history, 'copdOrAsthma') || marked(history, 'recentRespiratoryInfection');
  const emergency = patient.urgency === 'Emergency' || patient.riskProfile?.urgency === 'Emergency';
  const shortCase = (patient.expectedDuration || patient.riskProfile?.expectedDuration) === '<2';
  const sleepApnea = marked(history, 'knownOSA') || marked(history, 'observedApnea');
  const age = Number(patient.age) || 0;
  const frail = age >= 75 || patient.functionalCapacity === '<4' || patient.riskProfile?.functionalCapacity === '<4';
  const allergies = String(patient.allergies || '').toLowerCase();
  const lipidAllergy = /egg|soy|soya/.test(allergies);
  const avoidKetamine = highPressure || heartDisease;
  const picks = [];

  const add = (label, reason) => {
    if (picks.length >= 3 || picks.some((item) => item.label === label)) return;
    const drug = findSleepDrug(label);
    if (drug) picks.push({ ...drug, reason });
  };

  if (lipidAllergy) {
    add('Etomidate (induction)', 'Egg or soy is listed in the allergies. Propofol is mixed in a soy and egg lipid, so etomidate is the safer teaching choice to put this person to sleep.');
    add('Thiopental (induction)', 'Thiopental can also put this person to sleep without the soy and egg lipid used in propofol.');
  } else if (unstable && avoidKetamine) {
    add('Etomidate (induction)', 'The heart or blood pressure is unstable, and ketamine can raise heart rate. Etomidate puts this person to sleep with less drop in blood pressure.');
  } else if (unstable) {
    const pressureText = lowPressure && systolic ? `Blood pressure is ${patient.bloodPressure}. ` : 'The circulation looks unstable. ';
    add('Ketamine (IV induction)', `${pressureText}Ketamine can put this person to sleep without the blood-pressure drop seen with propofol.`);
    add('Etomidate (induction)', 'Etomidate is another choice that puts this person to sleep while the blood pressure stays steadier.');
  } else if (irritableLungs && !avoidKetamine) {
    add('Ketamine (IV induction)', 'Asthma or a recent chest infection was marked. Ketamine can open the airways while it puts this person to sleep.');
    add('Sevoflurane (about 1 MAC)', 'Sevoflurane is breathed in and is gentler on irritable airways than desflurane. It can keep this person asleep for the operation.');
  } else if (irritableLungs) {
    add('Sevoflurane (about 1 MAC)', 'The lungs are irritable and the blood pressure or heart is also a concern. Sevoflurane can keep this person asleep without the airway sting of desflurane.');
  } else if (avoidKetamine) {
    const reason = heartDisease
      ? 'Heart disease was marked. Propofol puts this person to sleep and does not raise blood pressure the way ketamine does.'
      : `Blood pressure is ${patient.bloodPressure || 'high'}. Propofol puts this person to sleep and does not raise blood pressure the way ketamine does.`;
    add('Propofol (induction)', reason);
    add('Sevoflurane (about 1 MAC)', 'Sevoflurane is breathed in to keep this person asleep during the operation.');
  } else {
    const reason = frail
      ? 'Age or limited daily activity was recorded, and the circulation is otherwise stable. Propofol is still the usual medicine that puts an adult to sleep. Stay toward the low end of the range.'
      : 'No unstable blood pressure or serious heart finding was marked. Propofol is the usual medicine that puts an adult to sleep for an operation.';
    add('Propofol (induction)', reason);
    add('Sevoflurane (about 1 MAC)', 'Sevoflurane is breathed in to keep this person asleep during the operation.');
  }

  if (irritableLungs && !picks.some((item) => item.label.startsWith('Sevoflurane'))) {
    add('Sevoflurane (about 1 MAC)', 'Asthma or a recent chest infection was also marked. Sevoflurane is breathed in and is gentler on those airways than desflurane.');
  }
  if (lipidAllergy && !picks.some((item) => item.label.startsWith('Sevoflurane'))) {
    add('Sevoflurane (about 1 MAC)', 'Sevoflurane is breathed in, so it does not use the soy and egg lipid in propofol.');
  }

  if (emergency && !avoidKetamine && !lipidAllergy) {
    add('Ketamine (IV induction)', 'This case is marked as an emergency. Ketamine can put the person to sleep when the stomach may not be empty and the circulation may change.');
  }
  if ((shortCase || sleepApnea) && !irritableLungs) {
    const reason = sleepApnea
      ? 'Sleep apnea, or pauses in breathing during sleep, was marked. Desflurane wears off quickly, which helps breathing return after the operation.'
      : 'The operation is expected to last under 2 hours. Desflurane wears off quickly, so this person can wake sooner.';
    add('Desflurane (about 1 MAC)', reason);
  }
  if (picks.length < 2 && !lipidAllergy && !unstable) {
    add('Propofol (induction)', 'Propofol is the usual medicine that puts an adult to sleep for an operation.');
  }

  return picks;
};

export const estimateDose = (drug, weightKg) => {
  if (!drug) return { amount: null, low: null, high: null, unit: 'mg', capped: false };
  const weight = Number(weightKg);
  let amount = null;
  let capped = false;

  if (drug.kind === 'perKg') {
    if (!(weight > 0)) return { amount: null, low: null, high: null, unit: drug.unit, capped: false };
    amount = drug.dose * weight;
    if (drug.max != null && amount > drug.max) {
      amount = drug.max;
      capped = true;
    }
  } else if (drug.kind === 'byWeight') {
    if (!(weight > 0)) return { amount: null, low: null, high: null, unit: drug.unit, capped: false };
    amount = drug.pick(weight);
  } else {
    amount = drug.dose;
  }

  amount = formatAmount(amount);
  return {
    amount,
    low: formatAmount(amount * 0.9),
    high: formatAmount(amount * 1.1),
    unit: drug.unit,
    capped,
  };
};

export const formatSavedDose = (amount, doseRange) => {
  if (amount == null || amount === '') return '—';
  const unit = String(doseRange || '').trim().match(/(mcg|mg|mL|%|IU)$/)?.[1] || 'mg';
  return `${amount} ${unit}`;
};
