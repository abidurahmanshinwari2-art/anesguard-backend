const Assessment = require('../models/Assessment');
const { calculateRisk } = require('../utils/riskEngine');

const createAssessment = async (req, res, next) => {
  try {
    const data = req.body;
    const { riskFactors, riskScore, riskLevel, recommendations } = calculateRisk({
      age: Number(data.age),
      bmi: data.height && data.weight ? data.weight / (data.height / 100) ** 2 : 0,
      medHistory: data.medHistory || {},
    });

    const assessment = await Assessment.create({
      ...data,
      createdBy: req.user.uid,
      riskFactors,
      riskScore,
      riskLevel,
      recommendations,
    });

    res.status(201).json(assessment);
  } catch (err) {
    next(err);
  }
};

const getAssessments = async (req, res, next) => {
  try {
    const { search = '', riskLevel, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;

    const query = { createdBy: req.user.uid };
    if (search) query.patientName = { $regex: search, $options: 'i' };
    if (riskLevel && riskLevel !== 'all') query.riskLevel = riskLevel;

    const sortField = sortBy === 'date' ? 'createdAt' : sortBy;
    const sort = { [sortField]: order === 'asc' ? 1 : -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [assessments, total] = await Promise.all([
      Assessment.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Assessment.countDocuments(query),
    ]);

    res.json({ data: assessments, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

const getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await Assessment.findOne({ _id: req.params.id, createdBy: req.user.uid });
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
    res.json(assessment);
  } catch (err) {
    next(err);
  }
};

const updateAssessment = async (req, res, next) => {
  try {
    const existing = await Assessment.findOne({ _id: req.params.id, createdBy: req.user.uid });
    if (!existing) return res.status(404).json({ message: 'Assessment not found' });

    const data = { ...existing.toObject(), ...req.body };
    const { riskFactors, riskScore, riskLevel, recommendations } = calculateRisk({
      age: Number(data.age),
      bmi: data.height && data.weight ? data.weight / (data.height / 100) ** 2 : 0,
      medHistory: data.medHistory || {},
    });

    Object.assign(existing, req.body, { riskFactors, riskScore, riskLevel, recommendations });
    await existing.save();

    res.json(existing);
  } catch (err) {
    next(err);
  }
};

const updateDosage = async (req, res, next) => {
  try {
    const { drugSelected, calculatedDose, doseRange } = req.body;
    const assessment = await Assessment.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.uid },
      { $set: { drugSelected, calculatedDose, doseRange, status: 'Completed' } },
      { new: true }
    );
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
    res.json(assessment);
  } catch (err) {
    next(err);
  }
};

const deleteAssessment = async (req, res, next) => {
  try {
    const deleted = await Assessment.findOneAndDelete({ _id: req.params.id, createdBy: req.user.uid });
    if (!deleted) return res.status(404).json({ message: 'Assessment not found' });
    res.json({ message: 'Assessment deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
};

const bulkDeleteAssessments = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array is required' });
    }
    const result = await Assessment.deleteMany({ _id: { $in: ids }, createdBy: req.user.uid });
    res.json({ message: `${result.deletedCount} assessments deleted` });
  } catch (err) {
    next(err);
  }
};

const getStatsSummary = async (req, res, next) => {
  try {
    const match = { createdBy: req.user.uid };
    const [total, low, moderate, high] = await Promise.all([
      Assessment.countDocuments(match),
      Assessment.countDocuments({ ...match, riskLevel: 'Low' }),
      Assessment.countDocuments({ ...match, riskLevel: 'Moderate' }),
      Assessment.countDocuments({ ...match, riskLevel: 'High' }),
    ]);
    res.json({ total, low, moderate, high });
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