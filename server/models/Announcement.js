import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['general', 'academic', 'administrative', 'emergency'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  targetAudience: {
    roles: [{
      type: String,
      enum: ['admin', 'teacher', 'student']
    }],
    levels: [{
      type: String,
      enum: ['L1', 'L2', 'L3', 'M1', 'M2']
    }],
    faculties: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty'
    }]
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

announcementSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Announcement', announcementSchema);