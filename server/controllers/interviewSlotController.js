import { storage } from '../storage.js';

export const createInterviewSlot = async (req, res) => {
  try {
    const { slotTime, duration, topic, notes } = req.body;
    
    // Set interviewer as the authenticated user
    const interviewerId = req.user.id;
    
    // Validate required fields
    if (!slotTime) {
      return res.status(400).json({ message: 'Slot time is required' });
    }
    
    if (!duration) {
      return res.status(400).json({ message: 'Duration is required' });
    }
    
    // Create the interview slot
    const interviewSlot = await storage.createInterviewSlot({
      interviewerId,
      slotTime: new Date(slotTime),
      duration,
      topic: topic || 'General Interview',
      notes: notes || '',
      status: 'Available',
      intervieweeId: null,
      meetingLink: null
    });
    
    res.status(201).json(interviewSlot);
  } catch (error) {
    res.status(500).json({ message: 'Error creating interview slot', error: error.message });
  }
};

export const getInterviewSlotById = async (req, res) => {
  try {
    const interviewSlot = await storage.getInterviewSlotById(parseInt(req.params.id));
    
    if (!interviewSlot) {
      return res.status(404).json({ message: 'Interview slot not found' });
    }
    
    // Get interviewer and interviewee details
    const interviewer = await storage.getUser(interviewSlot.interviewerId);
    let interviewee = null;
    if (interviewSlot.intervieweeId) {
      interviewee = await storage.getUser(interviewSlot.intervieweeId);
    }
    
    // Filter out sensitive information
    let safeInterviewer = null;
    let safeInterviewee = null;
    
    if (interviewer) {
      const { password, ...safePeer } = interviewer;
      safeInterviewer = safePeer;
    }
    
    if (interviewee) {
      const { password, ...safePeer } = interviewee;
      safeInterviewee = safePeer;
    }
    
    // Return slot with user details
    const slotWithDetails = {
      ...interviewSlot,
      interviewer: safeInterviewer,
      interviewee: safeInterviewee
    };
    
    res.status(200).json(slotWithDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interview slot', error: error.message });
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    // Get current user ID to filter out their own slots
    const userId = req.user.id;
    
    // Get all available slots
    const slots = await storage.getAvailableSlots();
    
    // Filter out slots created by the current user
    const otherUserSlots = slots.filter(slot => slot.interviewerId !== userId);
    
    // Get interviewer details for each slot
    const slotsWithInterviewers = await Promise.all(otherUserSlots.map(async (slot) => {
      const interviewer = await storage.getUser(slot.interviewerId);
      if (interviewer) {
        const { password, ...safeInterviewer } = interviewer;
        return { ...slot, interviewer: safeInterviewer };
      }
      return slot;
    }));
    
    // Sort by date (soonest first)
    const sortedSlots = slotsWithInterviewers.sort(
      (a, b) => new Date(a.slotTime).getTime() - new Date(b.slotTime).getTime()
    );
    
    res.status(200).json(sortedSlots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available slots', error: error.message });
  }
};

export const getUserUpcomingInterviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const slots = await storage.getUserUpcomingInterviews(userId);
    
    // Get user details for each slot
    const slotsWithUsers = await Promise.all(slots.map(async (slot) => {
      const interviewer = await storage.getUser(slot.interviewerId);
      let interviewee = null;
      
      if (slot.intervieweeId) {
        interviewee = await storage.getUser(slot.intervieweeId);
      }
      
      // Clean user objects
      let safeInterviewer = null;
      let safeInterviewee = null;
      
      if (interviewer) {
        const { password, ...safe } = interviewer;
        safeInterviewer = safe;
      }
      
      if (interviewee) {
        const { password, ...safe } = interviewee;
        safeInterviewee = safe;
      }
      
      // Determine the role and partner
      let role, partner;
      
      if (slot.interviewerId === userId) {
        role = 'interviewer';
        partner = safeInterviewee;
      } else {
        role = 'interviewee';
        partner = safeInterviewer;
      }
      
      return {
        ...slot,
        interviewer: safeInterviewer,
        interviewee: safeInterviewee,
        role,
        partner
      };
    }));
    
    res.status(200).json(slotsWithUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching upcoming interviews', error: error.message });
  }
};

export const getUserPastInterviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const slots = await storage.getUserPastInterviews(userId);
    
    // Get user details for each slot
    const slotsWithUsers = await Promise.all(slots.map(async (slot) => {
      const interviewer = await storage.getUser(slot.interviewerId);
      let interviewee = null;
      
      if (slot.intervieweeId) {
        interviewee = await storage.getUser(slot.intervieweeId);
      }
      
      // Clean user objects
      let safeInterviewer = null;
      let safeInterviewee = null;
      
      if (interviewer) {
        const { password, ...safe } = interviewer;
        safeInterviewer = safe;
      }
      
      if (interviewee) {
        const { password, ...safe } = interviewee;
        safeInterviewee = safe;
      }
      
      // Determine the role and partner
      let role, partner;
      
      if (slot.interviewerId === userId) {
        role = 'interviewer';
        partner = safeInterviewee;
      } else {
        role = 'interviewee';
        partner = safeInterviewer;
      }
      
      return {
        ...slot,
        interviewer: safeInterviewer,
        interviewee: safeInterviewee,
        role,
        partner
      };
    }));
    
    res.status(200).json(slotsWithUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching past interviews', error: error.message });
  }
};

export const getAllUserInterviews = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get both upcoming and past interviews
    const upcomingInterviews = await storage.getUserUpcomingInterviews(userId);
    const pastInterviews = await storage.getUserPastInterviews(userId);
    
    // Merge and sort by date (soonest first for upcoming, most recent first for past)
    const allInterviews = [
      ...upcomingInterviews.map(interview => ({ ...interview, type: 'upcoming' })),
      ...pastInterviews.map(interview => ({ ...interview, type: 'past' }))
    ];
    
    // Get user details for each interview
    const interviewsWithUsers = await Promise.all(allInterviews.map(async (interview) => {
      const interviewer = await storage.getUser(interview.interviewerId);
      let interviewee = null;
      
      if (interview.intervieweeId) {
        interviewee = await storage.getUser(interview.intervieweeId);
      }
      
      // Clean user objects
      let safeInterviewer = null;
      let safeInterviewee = null;
      
      if (interviewer) {
        const { password, ...safe } = interviewer;
        safeInterviewer = safe;
      }
      
      if (interviewee) {
        const { password, ...safe } = interviewee;
        safeInterviewee = safe;
      }
      
      // Determine the role and partner
      let role, partner;
      
      if (interview.interviewerId === userId) {
        role = 'interviewer';
        partner = safeInterviewee;
      } else {
        role = 'interviewee';
        partner = safeInterviewer;
      }
      
      return {
        ...interview,
        interviewer: safeInterviewer,
        interviewee: safeInterviewee,
        role,
        partner
      };
    }));
    
    res.status(200).json(interviewsWithUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all interviews', error: error.message });
  }
};

export const bookInterviewSlot = async (req, res) => {
  try {
    const slotId = parseInt(req.params.id);
    const intervieweeId = req.user.id;
    
    // Get the slot to verify eligibility
    const slot = await storage.getInterviewSlotById(slotId);
    
    if (!slot) {
      return res.status(404).json({ message: 'Interview slot not found' });
    }
    
    // Check if the slot is available
    if (slot.status !== 'Available') {
      return res.status(400).json({ message: 'Interview slot is not available for booking' });
    }
    
    // Make sure the user isn't booking their own slot
    if (slot.interviewerId === intervieweeId) {
      return res.status(400).json({ message: 'You cannot book your own interview slot' });
    }
    
    // Book the slot
    const updatedSlot = await storage.bookInterviewSlot(slotId, intervieweeId);
    
    if (!updatedSlot) {
      return res.status(500).json({ message: 'Failed to book interview slot' });
    }
    
    // Get user details
    const interviewer = await storage.getUser(updatedSlot.interviewerId);
    const interviewee = await storage.getUser(updatedSlot.intervieweeId);
    
    // Clean user objects
    let safeInterviewer = null;
    let safeInterviewee = null;
    
    if (interviewer) {
      const { password, ...safe } = interviewer;
      safeInterviewer = safe;
    }
    
    if (interviewee) {
      const { password, ...safe } = interviewee;
      safeInterviewee = safe;
    }
    
    // Return slot with user details
    const slotWithDetails = {
      ...updatedSlot,
      interviewer: safeInterviewer,
      interviewee: safeInterviewee
    };
    
    res.status(200).json(slotWithDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error booking interview slot', error: error.message });
  }
};

export const cancelInterviewSlot = async (req, res) => {
  try {
    const slotId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Get the slot
    const slot = await storage.getInterviewSlotById(slotId);
    
    if (!slot) {
      return res.status(404).json({ message: 'Interview slot not found' });
    }
    
    // Check if user is authorized to cancel
    if (slot.interviewerId !== userId && slot.intervieweeId !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this interview slot' });
    }
    
    // Check if the slot is booked
    if (slot.status !== 'Booked') {
      return res.status(400).json({ message: 'Only booked interview slots can be cancelled' });
    }
    
    // Cancel the slot
    const updatedSlot = await storage.cancelInterviewSlot(slotId);
    
    if (!updatedSlot) {
      return res.status(500).json({ message: 'Failed to cancel interview slot' });
    }
    
    res.status(200).json(updatedSlot);
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling interview slot', error: error.message });
  }
};