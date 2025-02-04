import express from 'express';
import Announcement from '../models/Announcement.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all announcements
router.get('/', auth, async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('author', '-password')
      .populate('readers.user', '-password')
      .populate('targetAudience.faculties');
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get announcement by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', '-password')
      .populate('readers.user', '-password')
      .populate('targetAudience.faculties');
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create announcement
router.post('/', auth, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const announcement = new Announcement({
      ...req.body,
      author: req.user.id
    });
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update announcement
router.put('/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Only allow author or admin to update
    if (req.user.role !== 'admin' && req.user.id !== announcement.author.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedAnnouncement);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete announcement
router.delete('/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Only allow author or admin to delete
    if (req.user.role !== 'admin' && req.user.id !== announcement.author.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await announcement.remove();
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark announcement as read
router.post('/:id/read', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if user has already read the announcement
    if (!announcement.readers.some(r => r.user.toString() === req.user.id)) {
      announcement.readers.push({
        user: req.user.id,
        readAt: new Date()
      });
      await announcement.save();
    }

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;