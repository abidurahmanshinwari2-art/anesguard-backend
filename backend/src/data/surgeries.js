// Surgical risk bands follow the 2022 ESC Guidelines on non-cardiac surgery
// (Halvorsen et al., Eur Heart J. 2022).
// rcriHighRisk is the original Lee definition: intraperitoneal, intrathoracic,
// or suprainguinal vascular surgery (Circulation. 1999).
// incision is the ARISCAT category (Canet et al., Anesthesiology. 2010).

const SURGERIES = [
  { id: 'cataract', name: 'Cataract or other eye surgery', risk: 'Low', incision: 'peripheral', rcriHighRisk: false },
  { id: 'breast', name: 'Breast surgery', risk: 'Low', incision: 'peripheral', rcriHighRisk: false },
  { id: 'superficial', name: 'Superficial or skin surgery', risk: 'Low', incision: 'peripheral', rcriHighRisk: false },
  { id: 'dental', name: 'Dental or ambulatory procedure', risk: 'Low', incision: 'peripheral', rcriHighRisk: false },
  { id: 'thyroid', name: 'Thyroid surgery', risk: 'Low', incision: 'peripheral', rcriHighRisk: false },
  { id: 'endoscopy', name: 'Endoscopy', risk: 'Low', incision: 'peripheral', rcriHighRisk: false },
  { id: 'minor-ortho', name: 'Minor orthopedic surgery (arthroscopy, small hardware)', risk: 'Low', incision: 'peripheral', rcriHighRisk: false },
  { id: 'minor-gyn', name: 'Minor gynecologic surgery', risk: 'Low', incision: 'peripheral', rcriHighRisk: false },
  { id: 'inguinal-hernia', name: 'Open inguinal hernia repair', risk: 'Low', incision: 'peripheral', rcriHighRisk: false },
  { id: 'lap-chole', name: 'Laparoscopic cholecystectomy', risk: 'Intermediate', incision: 'peripheral', rcriHighRisk: true },
  { id: 'lap-abdominal', name: 'Other laparoscopic abdominal surgery', risk: 'Intermediate', incision: 'peripheral', rcriHighRisk: true },
  { id: 'open-abdominal', name: 'Open abdominal surgery (bowel, stomach, open gallbladder)', risk: 'Intermediate', incision: 'upperAbdominal', rcriHighRisk: true },
  { id: 'major-gyn', name: 'Major gynecologic surgery (open hysterectomy)', risk: 'Intermediate', incision: 'upperAbdominal', rcriHighRisk: true },
  { id: 'major-urology', name: 'Major urologic surgery', risk: 'Intermediate', incision: 'peripheral', rcriHighRisk: false },
  { id: 'joint-replacement', name: 'Hip or knee replacement', risk: 'Intermediate', incision: 'peripheral', rcriHighRisk: false },
  { id: 'head-neck', name: 'Major head and neck surgery', risk: 'Intermediate', incision: 'peripheral', rcriHighRisk: false },
  { id: 'carotid', name: 'Carotid endarterectomy', risk: 'Intermediate', incision: 'peripheral', rcriHighRisk: false },
  { id: 'thoracotomy', name: 'Thoracotomy or lung resection', risk: 'High', incision: 'intrathoracic', rcriHighRisk: true },
  { id: 'esophagectomy', name: 'Esophagectomy', risk: 'High', incision: 'intrathoracic', rcriHighRisk: true },
  { id: 'liver-pancreas', name: 'Liver resection or pancreatic surgery', risk: 'High', incision: 'upperAbdominal', rcriHighRisk: true },
  { id: 'open-aortic', name: 'Open aortic or major vascular surgery', risk: 'High', incision: 'upperAbdominal', rcriHighRisk: true },
  { id: 'limb-revasc', name: 'Lower-limb bypass or major amputation', risk: 'High', incision: 'peripheral', rcriHighRisk: false },
];

const findSurgery = (id) => SURGERIES.find((item) => item.id === id) || null;

module.exports = { SURGERIES, findSurgery };
