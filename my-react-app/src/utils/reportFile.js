import { jsPDF } from 'jspdf';
import { formatSavedDose } from '../components/anesthesiaDrugs.js';

const factorText = (factor) => (typeof factor === 'string' ? factor : factor?.label || '');

const buildAssessmentPdf = ({ title, subtitle, rows, factors, note, counts }) => {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const left = 16;
  const width = pageWidth - 32;
  let y = 18;

  const room = (height) => {
    if (y + height > 284) {
      pdf.addPage();
      y = 18;
    }
  };

  const write = (text, options = {}) => {
    const size = options.size || 11;
    const lineHeight = options.lineHeight || 5.2;
    pdf.setFont('helvetica', options.bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    pdf.setTextColor(...(options.color || [30, 41, 59]));
    const lines = pdf.splitTextToSize(String(text ?? ''), options.maxWidth || width);
    room(lines.length * lineHeight + 1);
    pdf.text(lines, options.x ?? left, y);
    y += lines.length * lineHeight + (options.gap ?? 1);
  };

  write(title || 'Assessment Report', { size: 18, bold: true, lineHeight: 8, gap: 2 });
  if (subtitle) write(subtitle, { size: 11, color: [100, 116, 139], gap: 4 });

  rows.forEach((group) => {
    y += 2;
    write(group.title, { size: 13, bold: true, lineHeight: 6, gap: 2 });
    group.items.forEach(([label, value]) => {
      const start = y;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(100, 116, 139);
      room(6);
      pdf.text(String(label), left, y);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      const lines = pdf.splitTextToSize(String(value ?? '—'), width - 58);
      pdf.text(lines, left + 52, y);
      y = start + Math.max(6, lines.length * 5.2);
    });
  });

  if (factors?.length) {
    y += 2;
    write('Key risk factors', { size: 13, bold: true, lineHeight: 6, gap: 2 });
    factors.forEach((factor) => write(`• ${factorText(factor)}`, { size: 11, gap: 0.5 }));
  }

  if (counts) {
    y += 2;
    write('Risk level counts', { size: 13, bold: true, lineHeight: 6, gap: 2 });
    write(`Low ${counts.low || 0}    Moderate ${counts.moderate || 0}    High ${counts.high || 0}`, { size: 11 });
  }

  if (note) {
    y += 3;
    write(note, { size: 10, color: [185, 28, 28], gap: 2 });
  }

  return pdf;
};

const assessmentDocument = (assessment, stats) => buildAssessmentPdf({
  title: 'Assessment Report',
  subtitle: assessment?.patientName
    ? `Summary for ${assessment.patientName}`
    : 'Summary of patient assessment',
  rows: [
    {
      title: 'Patient summary',
      items: [
        ['Name', assessment?.patientName || 'No data'],
        ['Age / sex', assessment ? `${assessment.age || '--'} / ${assessment.gender || '--'}` : 'No data'],
        ['Weight / height', assessment ? `${assessment.weight || '--'} kg / ${assessment.height || '--'} cm` : 'No data'],
        ['BMI', assessment?.bmi || '--'],
        ['Blood pressure', assessment?.bloodPressure || 'Not recorded'],
        ['Assessment date', assessment?.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : 'No data'],
      ],
    },
    {
      title: 'Risk summary',
      items: [
        ['Risk level', assessment?.riskLevel || 'No data'],
        ['Risk score', assessment ? `${assessment.riskScore || 0}${assessment.scoreBasis === 'guideline-index-100' ? ' / 100' : ''}` : 'No data'],
        ['Surgery', assessment?.riskProfile?.surgeryName || 'Not recorded'],
        ['ASA class', assessment?.asaClass || 'Not recorded'],
      ],
    },
    {
      title: 'Dosage summary',
      items: [
        ['Selected drug', assessment?.drugSelected || 'Not saved yet'],
        ['Calculated dose', formatSavedDose(assessment?.calculatedDose, assessment?.doseRange)],
        ['Dose range', assessment?.doseRange || '—'],
      ],
    },
  ],
  factors: Array.isArray(assessment?.riskFactors) && assessment.riskFactors.length
    ? assessment.riskFactors
    : ['No risk factors'],
  counts: stats,
  note: 'Educational use only. Not for clinical decision making.',
});

const saveBlob = (pdf, filename) => {
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export const downloadAssessmentPdf = (assessment, filename, stats) => {
  saveBlob(assessmentDocument(assessment, stats), filename);
};

export const printAssessmentPdf = (assessment, stats) => {
  const blob = assessmentDocument(assessment, stats).output('blob');
  const url = URL.createObjectURL(blob);
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  frame.src = url;
  document.body.appendChild(frame);
  frame.onload = () => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      frame.remove();
    }, 1500);
  };
};
