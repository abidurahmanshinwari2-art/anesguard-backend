const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  updateDosage,
  deleteAssessment,
  bulkDeleteAssessments,
  getStatsSummary,
} = require('../controllers/assessmentController');

router.get('/stats', protect, getStatsSummary);
router.get('/stats/summary', protect, getStatsSummary);

router.route('/')
  .get(protect, getAssessments)
  .post(protect, createAssessment)
  .delete(protect, bulkDeleteAssessments);

router.patch('/:id/dosage', protect, updateDosage);

router.route('/:id')
  .get(protect, getAssessmentById)
  .put(protect, updateAssessment)
  .delete(protect, deleteAssessment);

module.exports = router;
