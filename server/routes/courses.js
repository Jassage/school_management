import express from 'express';
import Course from '../models/Course.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all courses
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('faculty')
      .populate('teacher', '-password')
      .populate('students', '-password');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('faculty')
      .populate('teacher', '-password')
      .populate('students', '-password');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create course (admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course
router.put('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Only allow admins or the assigned teacher to update
    if (req.user.role !== 'admin' && req.user.id !== course.teacher.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete course (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await course.remove();
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add student to course
router.post('/:id/students/:studentId', auth, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.students.addToSet(req.params.studentId);
    await course.save();

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove student from course
router.delete('/:id/students/:studentId', auth, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.students.pull(req.params.studentId);
    await course.save();

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;