import { storage } from '../storage.js';

export const createMatchRequest = async (req, res) => {
  try {
    const { matchedPeerId, message, status } = req.body;
    
    // Set requester as the authenticated user
    const requesterId = req.user.id;
    
    // Validate required fields
    if (!matchedPeerId) {
      return res.status(400).json({ message: 'Matched peer ID is required' });
    }
    
    // Create the match request
    const matchRequest = await storage.createMatchRequest({
      requesterId,
      matchedPeerId,
      message: message || '',
      status: status || 'Pending'
    });
    
    res.status(201).json(matchRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating match request', error: error.message });
  }
};

export const getMatchRequestById = async (req, res) => {
  try {
    const matchRequest = await storage.getMatchRequestById(parseInt(req.params.id));
    
    if (!matchRequest) {
      return res.status(404).json({ message: 'Match request not found' });
    }
    
    // Check if the user is either the requester or the matched peer
    if (matchRequest.requesterId !== req.user.id && matchRequest.matchedPeerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this match request' });
    }
    
    res.status(200).json(matchRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching match request', error: error.message });
  }
};

export const getIncomingMatchRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await storage.getIncomingMatchRequests(userId);
    
    // Get requester details for each request
    const requestsWithUsers = await Promise.all(requests.map(async (request) => {
      const requester = await storage.getUser(request.requesterId);
      if (requester) {
        const { password, ...safeRequester } = requester;
        return { ...request, requester: safeRequester };
      }
      return request;
    }));
    
    res.status(200).json(requestsWithUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incoming match requests', error: error.message });
  }
};

export const getOutgoingMatchRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await storage.getOutgoingMatchRequests(userId);
    
    // Get matched peer details for each request
    const requestsWithUsers = await Promise.all(requests.map(async (request) => {
      const matchedPeer = await storage.getUser(request.matchedPeerId);
      if (matchedPeer) {
        const { password, ...safeMatchedPeer } = matchedPeer;
        return { ...request, matchedPeer: safeMatchedPeer };
      }
      return request;
    }));
    
    res.status(200).json(requestsWithUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching outgoing match requests', error: error.message });
  }
};

export const getAllMatchRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get both incoming and outgoing requests
    const incomingRequests = await storage.getIncomingMatchRequests(userId);
    const outgoingRequests = await storage.getOutgoingMatchRequests(userId);
    
    // Get user details for each request
    const incomingWithUsers = await Promise.all(incomingRequests.map(async (request) => {
      const requester = await storage.getUser(request.requesterId);
      if (requester) {
        const { password, ...safeRequester } = requester;
        return { ...request, requester: safeRequester, type: 'incoming' };
      }
      return { ...request, type: 'incoming' };
    }));
    
    const outgoingWithUsers = await Promise.all(outgoingRequests.map(async (request) => {
      const matchedPeer = await storage.getUser(request.matchedPeerId);
      if (matchedPeer) {
        const { password, ...safeMatchedPeer } = matchedPeer;
        return { ...request, matchedPeer: safeMatchedPeer, type: 'outgoing' };
      }
      return { ...request, type: 'outgoing' };
    }));
    
    // Combine and sort by creation date (newest first)
    const allRequests = [...incomingWithUsers, ...outgoingWithUsers].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    res.status(200).json(allRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all match requests', error: error.message });
  }
};

// Helper function used by the socket implementation
export const getMatchRequests = async (userId) => {
  try {
    const incomingRequests = await storage.getIncomingMatchRequests(userId);
    const outgoingRequests = await storage.getOutgoingMatchRequests(userId);
    
    return {
      incoming: incomingRequests,
      outgoing: outgoingRequests
    };
  } catch (error) {
    console.error('Error fetching match requests for socket:', error);
    return { incoming: [], outgoing: [] };
  }
};

export const updateMatchRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = parseInt(req.params.id);
    
    // Validate the status
    if (!status || !['Pending', 'Accepted', 'Rejected', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Pending, Accepted, Rejected, or Cancelled' });
    }
    
    // Get the request
    const request = await storage.getMatchRequestById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Match request not found' });
    }
    
    // Check authorization based on the status change
    if (status === 'Accepted' || status === 'Rejected') {
      // Only the matched peer can accept or reject requests
      if (request.matchedPeerId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to accept/reject this match request' });
      }
    } else if (status === 'Cancelled') {
      // Only the requester can cancel their own requests
      if (request.requesterId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to cancel this match request' });
      }
    }
    
    // Update the request status
    const updatedRequest = await storage.updateMatchRequestStatus(requestId, status);
    
    if (!updatedRequest) {
      return res.status(500).json({ message: 'Failed to update match request status' });
    }
    
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error updating match request status', error: error.message });
  }
};