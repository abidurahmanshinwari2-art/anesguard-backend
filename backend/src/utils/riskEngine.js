function calculateRisk({ age, bmi, medHistory = {} }) {
  const riskFactors = [];

  if (age > 60) riskFactors.push({ label: 'Age > 60 years', score: 2 });
  if (bmi > 30) riskFactors.push({ label: 'BMI > 30', score: 2 });
  if (medHistory.Hypertension) riskFactors.push({ label: 'Hypertension', score: 2 });
  if (medHistory['Diabetes Mellitus']) riskFactors.push({ label: 'Diabetes Mellitus', score: 1 });
  if (medHistory['Respiratory Disease']) riskFactors.push({ label: 'Respiratory Disease', score: 1 });
  if (medHistory['Cardiac Disease']) riskFactors.push({ label: 'Cardiac Disease', score: 2 });
  if (medHistory['Kidney Disease']) riskFactors.push({ label: 'Kidney Disease', score: 2 });
  if (medHistory['Liver Disease']) riskFactors.push({ label: 'Liver Disease', score: 2 });
  if (medHistory.Smoking) riskFactors.push({ label: 'Smoking', score: 1 });

  const riskScore = riskFactors.reduce((sum, f) => sum + f.score, 0);

  let riskLevel = 'Low';
  if (riskScore >= 7) riskLevel = 'High';
  else if (riskScore >= 4) riskLevel = 'Moderate';

  const recommendations = ['Thorough pre-anesthesia evaluation recommended.'];
  if (riskLevel !== 'Low') recommendations.push('Optimize comorbid conditions before surgery.');
  if (riskLevel === 'High') recommendations.push('Consider additional monitoring.');

  return { riskFactors, riskScore, riskLevel, recommendations };
}

module.exports = { calculateRisk };