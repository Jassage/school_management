import express from 'express';
import Event from '../models/Event.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', '-password')
      .populate('attendees.user', '-password');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', '-password')
      .populate('attendees.user', '-password');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event
router.post('/', auth, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      organizer: req.user.id
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only allow organizer or admin to update
    if (req.user.role !== 'admin' && req.user.id !== event.organizer.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only allow organizer or admin to delete
    if (req.user.role !== 'admin' && req.user.id !== event.organizer.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await event.remove();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for event
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if registration is closed
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({ message: 'Registration is closed' });
    }

    // Check if event is full
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if user is already registered
    if (event.attendees.some(a => a.user.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Already registered' });
    }

    event.attendees.push({
      user: req.user.id,
      status: 'registered'
    });

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel registration
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const attendeeIndex = event.attendees.findIndex(
      a => a.user.toString() === req.user.id
    );

    if (attendeeIndex === -1) {
      return res.status(400).json({ message: 'Not registered for this event' });
    }

    event.attendees[attendeeIndex].status = 'cancelled';
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;