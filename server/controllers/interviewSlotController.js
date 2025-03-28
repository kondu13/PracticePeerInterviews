import { storage } from '../storage.js';

// Helper to enrich interview slots with user data
const enrichInterviewSlots = async (slots) => {
  const enrichedSlots = [];
  
  for (const slot of slots) {
    // Get interviewer info
    const interviewer = await storage.getUser(slot.interviewerId);
    
    // Get interviewee info if exists
    let interviewee = null;
    if (slot.intervieweeId) {
      interviewee = await storage.getUser(slot.intervieweeId);
    }
    
    // Add user objects to the slot
    enrichedSlots.push({
      ...slot,
      interviewer: interviewer ? { ...interviewer, password: undefined } : null,
      interviewee: interviewee ? { ...interviewee, password: undefined } : null
    });
  }
  
  return enrichedSlots;
};

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
    const interviewSlot = await storage.createInterviewSlot({
      interviewerId: req.user.id,
      startTime: start,
      endTime: end,
      status: "Available",
      meetingLink,
      meetingType: meetingType || 'zoom',
      notes
    });
    
    // Get interviewer info to include in response
    const interviewer = await storage.getUser(interviewSlot.interviewerId);
    
    res.status(201).json({
      ...interviewSlot,
      interviewer: { ...interviewer, password: undefined }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get interview slot by ID
// @route   GET /api/interview-slots/:id
// @access  Private
export const getInterviewSlotById = async (req, res) => {
  try {
    const slotId = parseInt(req.params.id);
    const interviewSlot = await storage.getInterviewSlotById(slotId);
    
    if (!interviewSlot) {
      return res.status(404).json({ message: 'Interview slot not found' });
    }
    
    // Get user info
    const interviewer = await storage.getUser(interviewSlot.interviewerId);
    let interviewee = null;
    if (interviewSlot.intervieweeId) {
      interviewee = await storage.getUser(interviewSlot.intervieweeId);
    }
    
    res.json({
      ...interviewSlot,
      interviewer: { ...interviewer, password: undefined },
      interviewee: interviewee ? { ...interviewee, password: undefined } : null
    });
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
    
    // Get all available slots
    const availableSlots = await storage.getAvailableSlots();
    
    // Filter to only include future slots
    const futureSlots = availableSlots.filter(slot => 
      new Date(slot.startTime) > now
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    // Enrich with user data
    const enrichedSlots = await enrichInterviewSlots(futureSlots);
    
    res.json(enrichedSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's upcoming interviews
// @route   GET /api/interview-slots/upcoming
// @access  Private
export const getUserUpcomingInterviews = async (req, res) => {
  try {
    // Get upcoming interviews
    const upcomingInterviews = await storage.getUserUpcomingInterviews(req.user.id);
    
    // Enrich with user data
    const enrichedInterviews = await enrichInterviewSlots(upcomingInterviews);
    
    res.json(enrichedInterviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's past interviews
// @route   GET /api/interview-slots/past
// @access  Private
export const getUserPastInterviews = async (req, res) => {
  try {
    // Get past interviews
    const pastInterviews = await storage.getUserPastInterviews(req.user.id);
    
    // Enrich with user data
    const enrichedInterviews = await enrichInterviewSlots(pastInterviews);
    
    res.json(enrichedInterviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user's interviews (both upcoming and past)
// @route   GET /api/interview-slots
// @access  Private
export const getAllUserInterviews = async (req, res) => {
  try {
    // Get upcoming interviews
    const upcomingInterviews = await storage.getUserUpcomingInterviews(req.user.id);
    
    // Get past interviews
    const pastInterviews = await storage.getUserPastInterviews(req.user.id);
    
    // Enrich with user data
    const enrichedUpcoming = await enrichInterviewSlots(upcomingInterviews);
    const enrichedPast = await enrichInterviewSlots(pastInterviews);
    
    res.json({
      upcoming: enrichedUpcoming,
      past: enrichedPast
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
    const slotId = parseInt(req.params.id);
    
    // Find the slot
    const interviewSlot = await storage.getInterviewSlotById(slotId);
    
    if (!interviewSlot) {
      return res.status(404).json({ message: 'Interview slot not found' });
    }
    
    // Check if slot is available
    if (interviewSlot.status !== "Available") {
      return res.status(400).json({ message: 'This slot is not available for booking' });
    }
    
    // Check if user is trying to book their own slot
    if (interviewSlot.interviewerId === req.user.id) {
      return res.status(400).json({ message: 'You cannot book your own interview slot' });
    }
    
    // Update the slot
    const updatedSlot = await storage.bookInterviewSlot(slotId, req.user.id);
    
    if (!updatedSlot) {
      return res.status(500).json({ message: 'Failed to book interview slot' });
    }
    
    // Get user info
    const interviewer = await storage.getUser(updatedSlot.interviewerId);
    const interviewee = await storage.getUser(updatedSlot.intervieweeId);
    
    res.json({
      ...updatedSlot,
      interviewer: { ...interviewer, password: undefined },
      interviewee: { ...interviewee, password: undefined }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel an interview slot
// @route   PUT /api/interview-slots/:id/cancel
// @access  Private
export const cancelInterviewSlot = async (req, res) => {
  try {
    const slotId = parseInt(req.params.id);
    
    // Find the slot
    const interviewSlot = await storage.getInterviewSlotById(slotId);
    
    if (!interviewSlot) {
      return res.status(404).json({ message: 'Interview slot not found' });
    }
    
    // Check if user is either the interviewer or interviewee
    const isInterviewer = interviewSlot.interviewerId === req.user.id;
    const isInterviewee = interviewSlot.intervieweeId && interviewSlot.intervieweeId === req.user.id;
    
    if (!isInterviewer && !isInterviewee) {
      return res.status(401).json({ message: 'Not authorized to cancel this interview' });
    }
    
    let updatedSlot;
    
    // If interviewer cancels, change status to canceled
    if (isInterviewer) {
      // Create updated slot object
      updatedSlot = {
        ...interviewSlot,
        status: "Cancelled"
      };
      
      // Update in storage
      await storage.cancelInterviewSlot(slotId);
    }
    
    // If interviewee cancels, make slot available again
    if (isInterviewee) {
      // Create updated slot object
      updatedSlot = {
        ...interviewSlot,
        status: "Available",
        intervieweeId: null
      };
      
      // For this case, we need a special method (not implemented yet)
      // For now, we'll use cancelInterviewSlot which sets status to "Cancelled"
      await storage.cancelInterviewSlot(slotId);
    }
    
    // Get user info
    const interviewer = await storage.getUser(updatedSlot.interviewerId);
    let interviewee = null;
    if (updatedSlot.intervieweeId) {
      interviewee = await storage.getUser(updatedSlot.intervieweeId);
    }
    
    res.json({
      ...updatedSlot,
      interviewer: { ...interviewer, password: undefined },
      interviewee: interviewee ? { ...interviewee, password: undefined } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};