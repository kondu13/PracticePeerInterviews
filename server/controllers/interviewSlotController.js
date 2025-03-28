import InterviewSlot from '../models/InterviewSlot.js';

// @desc    Create a new interview slot
// @route   POST /api/interview-slots
// @access  Private
export const createInterviewSlot = async (req, res) => {
  try {
    const { startTime, endTime, meetingLink, meetingType, notes } = req.body;
    
    // Validate time range
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }
    
    // Create new interview slot
    const interviewSlot = await InterviewSlot.create({
      interviewerId: req.user._id,
      startTime: start,
      endTime: end,
      meetingLink,
      meetingType: meetingType || 'zoom',
      notes
    });
    
    // Populate the interviewer info
    await interviewSlot.populate('interviewerId', '-password');
    
    res.status(201).json(interviewSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get interview slot by ID
// @route   GET /api/interview-slots/:id
// @access  Private
export const getInterviewSlotById = async (req, res) => {
  try {
    const interviewSlot = await InterviewSlot.findById(req.params.id)
      .populate('interviewerId', '-password')
      .populate('intervieweeId', '-password');
    
    if (!interviewSlot) {
      return res.status(404).json({ message: 'Interview slot not found' });
    }
    
    res.json(interviewSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all available interview slots
// @route   GET /api/interview-slots/available
// @access  Private
export const getAvailableSlots = async (req, res) => {
  try {
    const now = new Date();
    
    const availableSlots = await InterviewSlot.find({
      status: 'available',
      startTime: { $gt: now } // Only future slots
    })
    .populate('interviewerId', '-password')
    .sort({ startTime: 1 }); // Sort by start time ascending
    
    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's upcoming interviews
// @route   GET /api/interview-slots/upcoming
// @access  Private
export const getUserUpcomingInterviews = async (req, res) => {
  try {
    const now = new Date();
    
    const upcomingInterviews = await InterviewSlot.find({
      $or: [
        { interviewerId: req.user._id },
        { intervieweeId: req.user._id }
      ],
      status: 'booked',
      startTime: { $gt: now } // Only future interviews
    })
    .populate('interviewerId', '-password')
    .populate('intervieweeId', '-password')
    .sort({ startTime: 1 }); // Sort by start time ascending
    
    res.json(upcomingInterviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's past interviews
// @route   GET /api/interview-slots/past
// @access  Private
export const getUserPastInterviews = async (req, res) => {
  try {
    const now = new Date();
    
    // Find past interviews (either completed or those whose end time has passed)
    const pastInterviews = await InterviewSlot.find({
      $or: [
        { interviewerId: req.user._id },
        { intervieweeId: req.user._id }
      ],
      $or: [
        { status: 'completed' },
        { 
          status: 'booked',
          endTime: { $lt: now } // End time is in the past
        }
      ]
    })
    .populate('interviewerId', '-password')
    .populate('intervieweeId', '-password')
    .sort({ startTime: -1 }); // Sort by start time descending (most recent first)
    
    res.json(pastInterviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user's interviews (both upcoming and past)
// @route   GET /api/interview-slots
// @access  Private
export const getAllUserInterviews = async (req, res) => {
  try {
    const now = new Date();
    
    // Get upcoming interviews
    const upcoming = await InterviewSlot.find({
      $or: [
        { interviewerId: req.user._id },
        { intervieweeId: req.user._id }
      ],
      status: 'booked',
      startTime: { $gt: now }
    })
    .populate('interviewerId', '-password')
    .populate('intervieweeId', '-password')
    .sort({ startTime: 1 });
    
    // Get past interviews
    const past = await InterviewSlot.find({
      $or: [
        { interviewerId: req.user._id },
        { intervieweeId: req.user._id }
      ],
      $or: [
        { status: 'completed' },
        { 
          status: 'booked',
          endTime: { $lt: now }
        }
      ]
    })
    .populate('interviewerId', '-password')
    .populate('intervieweeId', '-password')
    .sort({ startTime: -1 });
    
    res.json({
      upcoming,
      past
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Book an interview slot
// @route   PUT /api/interview-slots/:id/book
// @access  Private
export const bookInterviewSlot = async (req, res) => {
  try {
    const slotId = req.params.id;
    
    // Find the slot
    let interviewSlot = await InterviewSlot.findById(slotId);
    
    if (!interviewSlot) {
      return res.status(404).json({ message: 'Interview slot not found' });
    }
    
    // Check if slot is available
    if (interviewSlot.status !== 'available') {
      return res.status(400).json({ message: 'This slot is not available for booking' });
    }
    
    // Check if user is trying to book their own slot
    if (interviewSlot.interviewerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own interview slot' });
    }
    
    // Update the slot
    interviewSlot.intervieweeId = req.user._id;
    interviewSlot.status = 'booked';
    await interviewSlot.save();
    
    // Populate user info
    await interviewSlot.populate('interviewerId', '-password');
    await interviewSlot.populate('intervieweeId', '-password');
    
    res.json(interviewSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel an interview slot
// @route   PUT /api/interview-slots/:id/cancel
// @access  Private
export const cancelInterviewSlot = async (req, res) => {
  try {
    const slotId = req.params.id;
    
    // Find the slot
    let interviewSlot = await InterviewSlot.findById(slotId);
    
    if (!interviewSlot) {
      return res.status(404).json({ message: 'Interview slot not found' });
    }
    
    // Check if user is either the interviewer or interviewee
    const isInterviewer = interviewSlot.interviewerId.toString() === req.user._id.toString();
    const isInterviewee = interviewSlot.intervieweeId && 
                         interviewSlot.intervieweeId.toString() === req.user._id.toString();
    
    if (!isInterviewer && !isInterviewee) {
      return res.status(401).json({ message: 'Not authorized to cancel this interview' });
    }
    
    // If interviewer cancels, change status to canceled
    if (isInterviewer) {
      interviewSlot.status = 'canceled';
    }
    
    // If interviewee cancels, make slot available again
    if (isInterviewee) {
      interviewSlot.intervieweeId = null;
      interviewSlot.status = 'available';
    }
    
    await interviewSlot.save();
    
    // Populate user info
    await interviewSlot.populate('interviewerId', '-password');
    if (interviewSlot.intervieweeId) {
      await interviewSlot.populate('intervieweeId', '-password');
    }
    
    res.json(interviewSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};