import MatchRequest from '../models/MatchRequest.js';
import User from '../models/User.js';

// @desc    Create a new match request
// @route   POST /api/match-requests
// @access  Private
export const createMatchRequest = async (req, res) => {
  try {
    const { targetExperienceLevel, targetSkills, preferredTimes, notes } = req.body;
    
    // Create new match request
    const matchRequest = await MatchRequest.create({
      requesterId: req.user._id,
      targetExperienceLevel,
      targetSkills: targetSkills || [],
      preferredTimes: preferredTimes || [],
      notes
    });
    
    // Populate the requester info
    await matchRequest.populate('requesterId', '-password');
    
    res.status(201).json(matchRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get match request by ID
// @route   GET /api/match-requests/:id
// @access  Private
export const getMatchRequestById = async (req, res) => {
  try {
    const matchRequest = await MatchRequest.findById(req.params.id)
      .populate('requesterId', '-password')
      .populate('matchedPeerId', '-password');
    
    if (!matchRequest) {
      return res.status(404).json({ message: 'Match request not found' });
    }
    
    // Check if user is the requester or the matched peer
    const isRequester = matchRequest.requesterId._id.toString() === req.user._id.toString();
    const isMatchedPeer = matchRequest.matchedPeerId && 
                          matchRequest.matchedPeerId._id.toString() === req.user._id.toString();
    
    if (!isRequester && !isMatchedPeer) {
      return res.status(401).json({ message: 'Not authorized to view this match request' });
    }
    
    res.json(matchRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get incoming match requests for user
// @route   GET /api/match-requests/incoming
// @access  Private
export const getIncomingMatchRequests = async (req, res) => {
  try {
    // Find potential matches based on user's experience level and skills
    const user = await User.findById(req.user._id);
    
    // Find requests that target this user's experience level
    // and include at least one of the user's skills (if any are specified)
    const incomingRequests = await MatchRequest.find({
      requesterId: { $ne: req.user._id }, // Not from this user
      status: 'pending',
      $or: [
        { targetExperienceLevel: user.experienceLevel },
        { targetExperienceLevel: 'any' }
      ],
      $or: [
        { targetSkills: { $in: user.skills } },
        { targetSkills: { $size: 0 } } // No skills specified means any skill is acceptable
      ]
    })
    .populate('requesterId', '-password')
    .populate('matchedPeerId', '-password');
    
    res.json(incomingRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get outgoing match requests from user
// @route   GET /api/match-requests/outgoing
// @access  Private
export const getOutgoingMatchRequests = async (req, res) => {
  try {
    const outgoingRequests = await MatchRequest.find({
      requesterId: req.user._id
    })
    .populate('requesterId', '-password')
    .populate('matchedPeerId', '-password');
    
    res.json(outgoingRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all match requests
// @route   GET /api/match-requests
// @access  Private (admin only in a real app)
export const getAllMatchRequests = async (req, res) => {
  try {
    // In a real app, this would be restricted to admins
    // For this prototype, we'll return all match requests for the logged-in user
    const { incoming, outgoing } = await getMatchRequests(req.user._id);
    
    res.json({
      incoming,
      outgoing
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get both incoming and outgoing requests
export const getMatchRequests = async (userId) => {
  // Get user details to match incoming requests
  const user = await User.findById(userId);
  
  // Find incoming requests
  const incoming = await MatchRequest.find({
    requesterId: { $ne: userId }, // Not from this user
    status: 'pending',
    $or: [
      { targetExperienceLevel: user.experienceLevel },
      { targetExperienceLevel: 'any' }
    ],
    $or: [
      { targetSkills: { $in: user.skills } },
      { targetSkills: { $size: 0 } } // No skills specified means any skill is acceptable
    ]
  })
  .populate('requesterId', '-password')
  .populate('matchedPeerId', '-password');
  
  // Find outgoing requests
  const outgoing = await MatchRequest.find({
    requesterId: userId
  })
  .populate('requesterId', '-password')
  .populate('matchedPeerId', '-password');
  
  return { incoming, outgoing };
};

// @desc    Update match request status
// @route   PUT /api/match-requests/:id/status
// @access  Private
export const updateMatchRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'accepted', 'rejected', 'canceled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    let matchRequest = await MatchRequest.findById(req.params.id);
    
    if (!matchRequest) {
      return res.status(404).json({ message: 'Match request not found' });
    }
    
    // If accepting a request, set the matchedPeerId to the current user
    if (status === 'accepted') {
      matchRequest.matchedPeerId = req.user._id;
    }
    
    // Update status
    matchRequest.status = status;
    await matchRequest.save();
    
    // Populate the requester and matchedPeer info
    await matchRequest.populate('requesterId', '-password');
    if (matchRequest.matchedPeerId) {
      await matchRequest.populate('matchedPeerId', '-password');
    }
    
    res.json(matchRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};