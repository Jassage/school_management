import express from 'express';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all teachers
router.get('/', auth, async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate('user', '-password')
      .populate('courses');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user', '-password')
      .populate('courses');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create teacher (admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      employeeId,
      specialization,
      qualifications,
      department,
      officeNumber,
      officeHours
    } = req.body;

    // Create user account
    const user = new User({
      email,
      password,
      fullName,
      role: 'teacher'
    });
    await user.save();

    // Create teacher profile
    const teacher = new Teacher({
      user: user._id,
      employeeId,
      specialization,
      qualifications,
      department,
      officeNumber,
      officeHours
    });
    await teacher.save();

    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update teacher
router.put('/:id', auth, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Only allow admins or the teacher themselves to update
    if (req.user.role !== 'admin' && req.user.id !== teacher.user.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedTeacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete teacher (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Delete associated user account
    await User.findByIdAndDelete(teacher.user);
    await teacher.remove();

    res.json({ message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;