import express from 'express';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all students
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find()
      .populate('user', '-password')
      .populate('faculty')
      .populate('courses');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', '-password')
      .populate('faculty')
      .populate('courses');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create student (admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      studentId,
      dateOfBirth,
      gender,
      address,
      phoneNumber,
      emergencyContact,
      currentLevel,
      faculty
    } = req.body;

    // Create user account
    const user = new User({
      email,
      password,
      fullName,
      role: 'student'
    });
    await user.save();

    // Create student profile
    const student = new Student({
      user: user._id,
      studentId,
      dateOfBirth,
      gender,
      address,
      phoneNumber,
      emergencyContact,
      currentLevel,
      faculty,
      enrollmentDate: new Date()
    });
    await student.save();

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student
router.put('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Only allow admins or the student themselves to update
    if (req.user.role !== 'admin' && req.user.id !== student.user.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete student (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete associated user account
    await User.findByIdAndDelete(student.user);
    await student.remove();

    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;