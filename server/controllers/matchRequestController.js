import { storage } from '../storage.js';

// Helper to enrich match requests with user data
const enrichMatchRequests = async (requests) => {
  const enrichedRequests = [];
  
  for (const request of requests) {
    // Get requester info
    const requester = await storage.getUser(request.requesterId);
    
    // Get matched peer info if exists
    let matchedPeer = null;
    if (request.matchedPeerId) {
      matchedPeer = await storage.getUser(request.matchedPeerId);
    }
    
    // Add user objects to the request
    enrichedRequests.push({
      ...request,
      requester: requester ? { ...requester, password: undefined } : null,
      matchedPeer: matchedPeer ? { ...matchedPeer, password: undefined } : null
    });
  }
  
  return enrichedRequests;
};

// @desc    Create a new match request
// @route   POST /api/match-requests
// @access  Private
export const createMatchRequest = async (req, res) => {
  try {
    const { targetExperienceLevel, targetSkills, preferredTimes, notes } = req.body;
    
    // Create new match request
    const matchRequest = await storage.createMatchRequest({
      requesterId: req.user.id,
      status: 'pending',
      targetExperienceLevel,
      targetSkills: targetSkills || [],
      preferredTimes: preferredTimes || [],
      notes,
      matchedPeerId: null
    });
    
    // Get requester info to include in response
    const requester = await storage.getUser(matchRequest.requesterId);
    
    res.status(201).json({
      ...matchRequest,
      requester: { ...requester, password: undefined }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get match request by ID
// @route   GET /api/match-requests/:id
// @access  Private
export const getMatchRequestById = async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const matchRequest = await storage.getMatchRequestById(requestId);
    
    if (!matchRequest) {
      return res.status(404).json({ message: 'Match request not found' });
    }
    
    // Check if user is the requester or the matched peer
    const isRequester = matchRequest.requesterId === req.user.id;
    const isMatchedPeer = matchRequest.matchedPeerId && matchRequest.matchedPeerId === req.user.id;
    
    if (!isRequester && !isMatchedPeer) {
      return res.status(401).json({ message: 'Not authorized to view this match request' });
    }
    
    // Get requester and matched peer info
    const requester = await storage.getUser(matchRequest.requesterId);
    let matchedPeer = null;
    if (matchRequest.matchedPeerId) {
      matchedPeer = await storage.getUser(matchRequest.matchedPeerId);
    }
    
    res.json({
      ...matchRequest,
      requester: { ...requester, password: undefined },
      matchedPeer: matchedPeer ? { ...matchedPeer, password: undefined } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get incoming match requests for user
// @route   GET /api/match-requests/incoming
// @access  Private
export const getIncomingMatchRequests = async (req, res) => {
  try {
    // Get the current user
    const user = await storage.getUser(req.user.id);
    
    // Get all match requests
    const allRequests = await storage.getIncomingMatchRequests(req.user.id);
    
    // Filter requests that match user's experience level and skills
    const incomingRequests = allRequests.filter(request => {
      const matchesExperience = 
        request.targetExperienceLevel === user.experienceLevel || 
        request.targetExperienceLevel === 'any';
      
      const matchesSkills = 
        request.targetSkills.length === 0 || // No skills specified means any skill is acceptable
        request.targetSkills.some(skill => user.skills.includes(skill));
        
      return request.status === 'pending' && matchesExperience && matchesSkills;
    });
    
    // Enrich with user data
    const enrichedRequests = await enrichMatchRequests(incomingRequests);
    
    res.json(enrichedRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get outgoing match requests from user
// @route   GET /api/match-requests/outgoing
// @access  Private
export const getOutgoingMatchRequests = async (req, res) => {
  try {
    const outgoingRequests = await storage.getOutgoingMatchRequests(req.user.id);
    
    // Enrich with user data
    const enrichedRequests = await enrichMatchRequests(outgoingRequests);
    
    res.json(enrichedRequests);
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
    const { incoming, outgoing } = await getMatchRequests(req.user.id);
    
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
  // Get user details
  const user = await storage.getUser(userId);
  
  // Get all requests
  const allIncomingRequests = await storage.getIncomingMatchRequests(userId);
  
  // Filter incoming requests that match user's experience and skills
  const incomingRequests = allIncomingRequests.filter(request => {
    const matchesExperience = 
      request.targetExperienceLevel === user.experienceLevel || 
      request.targetExperienceLevel === 'any';
    
    const matchesSkills = 
      request.targetSkills.length === 0 || // No skills specified means any skill is acceptable
      request.targetSkills.some(skill => user.skills.includes(skill));
      
    return request.status === 'pending' && matchesExperience && matchesSkills;
  });
  
  // Get outgoing requests
  const outgoingRequests = await storage.getOutgoingMatchRequests(userId);
  
  // Enrich both with user data
  const enrichedIncoming = await enrichMatchRequests(incomingRequests);
  const enrichedOutgoing = await enrichMatchRequests(outgoingRequests);
  
  return { 
    incoming: enrichedIncoming, 
    outgoing: enrichedOutgoing 
  };
};

// @desc    Update match request status
// @route   PUT /api/match-requests/:id/status
// @access  Private
export const updateMatchRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = parseInt(req.params.id);
    
    if (!['pending', 'accepted', 'rejected', 'canceled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    let matchRequest = await storage.getMatchRequestById(requestId);
    
    if (!matchRequest) {
      return res.status(404).json({ message: 'Match request not found' });
    }
    
    // If accepting a request, update both status and matchedPeerId
    if (status === 'accepted') {
      // Create updated request object with matchedPeerId
      matchRequest = {
        ...matchRequest,
        status,
        matchedPeerId: req.user.id
      };
      
      // Update in storage
      await storage.updateMatchRequestStatus(requestId, status, req.user.id);
    } else {
      // Just update the status
      matchRequest = await storage.updateMatchRequestStatus(requestId, status);
    }
    
    // Get requester and matched peer info
    const requester = await storage.getUser(matchRequest.requesterId);
    let matchedPeer = null;
    if (matchRequest.matchedPeerId) {
      matchedPeer = await storage.getUser(matchRequest.matchedPeerId);
    }
    
    res.json({
      ...matchRequest,
      requester: { ...requester, password: undefined },
      matchedPeer: matchedPeer ? { ...matchedPeer, password: undefined } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};