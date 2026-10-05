const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
const { calculateRisk } = require('../utils/riskEngine');

const computeBmi = (height, weight) => {
  const h = Number(height);
  const w = Number(weight);
  if (!(h > 0) || !(w > 0)) return '--';
  return (w / ((h / 100) ** 2)).toFixed(1);
};

const scoreCase = (data, bmiText) => {
  const bmiValue = parseFloat(bmiText);
  const result = calculateRisk({
    age: Number(data.age),
    bmi: Number.isFinite(bmiValue) ? bmiValue : 0,
    medHistory: data.medHistory || {},
  });
  return {
    riskScore: result.riskScore,
    riskLevel: result.riskLevel,
    riskFactors: result.riskFactors.map((factor) => factor.label),
    recommendations: result.recommendations,
  };
};

const assessmentFields = (data, userId) => {
  const bmi = computeBmi(data.height, data.weight);
  const scored = scoreCase(data, bmi);
  return {
    patientName: data.patientName,
    age: Number(data.age),
    gender: data.gender,
    height: Number(data.height),
    weight: Number(data.weight),
    bloodPressure: data.bloodPressure,
    heartRate: Number(data.heartRate),
    spo2: data.spo2 === '' || data.spo2 == null ? 98 : Number(data.spo2),
    allergies: data.allergies || 'None',
    otherDetails: data.otherDetails || '',
    medHistory: data.medHistory || {},
    bmi,
    createdBy: userId,
    ...scored,
  };
};

const ownerQuery = (req) => ({ _id: req.params.id, createdBy: req.user._id });

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const createAssessment = async (req, res, next) => {
  try {
    const data = req.body || {};
    const required = ['patientName', 'age', 'gender', 'height', 'weight', 'bloodPressure', 'heartRate'];
    const missing = required.filter((key) => data[key] === undefined || data[key] === null || String(data[key]).trim() === '');
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
    }

    const assessment = await Assessment.create(assessmentFields(data, req.user._id));
    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      assessment,
    });
  } catch (err) {
    next(err);
  }
};

const getAssessments = async (req, res, next) => {
  try {
    const { search = '', riskLevel, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;
    const query = { createdBy: req.user._id };

    if (search) query.patientName = { $regex: search, $options: 'i' };
    if (riskLevel && riskLevel !== 'all') query.riskLevel = riskLevel;

    const allowedSorts = ['createdAt', 'patientName', 'age', 'riskLevel', 'riskScore'];
    const sortField = sortBy === 'date' || !allowedSorts.includes(sortBy) ? 'createdAt' : sortBy;
    const sort = { [sortField]: order === 'asc' ? 1 : -1 };
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [assessments, total] = await Promise.all([
      Assessment.find(query).sort(sort).skip(skip).limit(limitNum),
      Assessment.countDocuments(query),
    ]);

    res.json({
      success: true,
      assessments,
      data: assessments,
      total,
      page: pageNum,
      limit: limitNum,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.max(1, Math.ceil(total / limitNum)),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getAssessmentById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    const assessment = await Assessment.findOne(ownerQuery(req));
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    res.json({ success: true, assessment });
  } catch (err) {
    next(err);
  }
};

const updateAssessment = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    const existing = await Assessment.findOne(ownerQuery(req));
    if (!existing) return res.status(404).json({ success: false, message: 'Assessment not found' });

    const merged = { ...existing.toObject(), ...req.body };
    const nextFields = assessmentFields(merged, req.user._id);
    Object.assign(existing, nextFields);
    await existing.save();

    res.json({ success: true, message: 'Assessment updated', assessment: existing });
  } catch (err) {
    next(err);
  }
};

const updateDosage = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    const { drugSelected, calculatedDose, doseRange } = req.body;
    const assessment = await Assessment.findOneAndUpdate(
      ownerQuery(req),
      {
        $set: {
          drugSelected: drugSelected || '',
          calculatedDose: calculatedDose == null || calculatedDose === '' ? null : Number(calculatedDose),
          doseRange: doseRange || '',
          status: 'Completed',
        },
      },
      { new: true }
    );
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    res.json({ success: true, assessment });
  } catch (err) {
    next(err);
  }
};

const deleteAssessment = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    const deleted = await Assessment.findOneAndDelete(ownerQuery(req));
    if (!deleted) return res.status(404).json({ success: false, message: 'Assessment not found' });
    res.json({ success: true, message: 'Assessment deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
};

const bulkDeleteAssessments = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids array is required' });
    }
    const result = await Assessment.deleteMany({ _id: { $in: ids }, createdBy: req.user._id });
    res.json({ success: true, message: `${result.deletedCount} assessments deleted` });
  } catch (err) {
    next(err);
  }
};

const getStatsSummary = async (req, res, next) => {
  try {
    const match = { createdBy: req.user._id };
    const [total, low, moderate, high, pending, completed] = await Promise.all([
      Assessment.countDocuments(match),
      Assessment.countDocuments({ ...match, riskLevel: 'Low' }),
      Assessment.countDocuments({ ...match, riskLevel: 'Moderate' }),
      Assessment.countDocuments({ ...match, riskLevel: 'High' }),
      Assessment.countDocuments({ ...match, status: 'Pending' }),
      Assessment.countDocuments({ ...match, status: 'Completed' }),
    ]);
    const stats = { total, low, moderate, high, pending, completed };
    res.json({ success: true, stats, ...stats });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  updateDosage,
  deleteAssessment,
  bulkDeleteAssessments,
  getStatsSummary,
};
