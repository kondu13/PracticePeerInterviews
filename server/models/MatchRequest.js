import mongoose from 'mongoose';

const MatchRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetExperienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'any'],
    required: true
  },
  targetSkills: [{
    type: String,
    trim: true
  }],
  preferredTimes: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'canceled'],
    default: 'pending'
  },
  matchedPeerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: {
    type: String
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
MatchRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const MatchRequest = mongoose.model('MatchRequest', MatchRequestSchema);

export default MatchRequest;