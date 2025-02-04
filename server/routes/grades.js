import express from 'express';
import Grade from '../models/Grade.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all grades
router.get('/', auth, async (req, res) => {
  try {
    const grades = await Grade.find()
      .populate('student', '-password')
      .populate('course')
      .populate('submittedBy', '-password')
      .populate('lastModifiedBy', '-password');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get grades by student ID
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.params.studentId })
      .populate('course')
      .populate('submittedBy', '-password')
      .populate('lastModifiedBy', '-password');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get grades by course ID
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const grades = await Grade.find({ course: req.params.courseId })
      .populate('student', '-password')
      .populate('submittedBy', '-password')
      .populate('lastModifiedBy', '-password');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create grade
router.post('/', auth, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const grade = new Grade({
      ...req.body,
      submittedBy: req.user.id
    });
    await grade.save();
    res.status(201).json(grade);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update grade
router.put('/:id', auth, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    grade.score = req.body.score || grade.score;
    grade.weight = req.body.weight || grade.weight;
    grade.comments = req.body.comments || grade.comments;
    grade.lastModifiedBy = req.user.id;
    grade.lastModifiedAt = new Date();

    await grade.save();
    res.json(grade);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete grade (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    await grade.remove();
    res.json({ message: 'Grade deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;