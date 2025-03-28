import mongoose from 'mongoose';

const InterviewSlotSchema = new mongoose.Schema({
  interviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  intervieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'completed', 'canceled'],
    default: 'available'
  },
  meetingLink: {
    type: String,
    trim: true
  },
  meetingType: {
    type: String,
    enum: ['zoom', 'google-meet', 'microsoft-teams', 'other'],
    default: 'zoom'
  },
  notes: {
    type: String
  },
  feedback: {
    interviewer: {
      type: String,
      default: ''
    },
    interviewee: {
      type: String,
      default: ''
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before updating a record
InterviewSlotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const InterviewSlot = mongoose.model('InterviewSlot', InterviewSlotSchema);

export default InterviewSlot;