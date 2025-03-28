import { createServer } from "http";
import { storage } from "./storage.js";
import { setupAuth } from "./auth.js";
import { z } from "zod";
import { insertMatchRequestSchema, insertInterviewSlotSchema } from "@shared/schema";

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

export async function registerRoutes(app) {
  // Setup authentication routes
  setupAuth(app);

  // API Routes for the mock interview application
  
  // Users API
  app.get("/api/users", ensureAuthenticated, async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Don't send current user in the list
      const filteredUsers = users.filter(user => user.id !== req.user?.id);
      res.json(filteredUsers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.get("/api/users/filter", ensureAuthenticated, async (req, res) => {
    try {
      const { experienceLevel, skill } = req.query;
      let users = await storage.getUsers();
      
      // Filter by experience level if provided
      if (experienceLevel && typeof experienceLevel === 'string') {
        users = await storage.getUsersByExperienceLevel(experienceLevel);
      }
      
      // Filter by skill if provided
      if (skill && typeof skill === 'string') {
        users = await storage.getUsersBySkill(skill);
      }
      
      // Don't send current user in the list
      const filteredUsers = users.filter(user => user.id !== req.user?.id);
      res.json(filteredUsers);
    } catch (error) {
      res.status(500).json({ message: "Error filtering users" });
    }
  });

  // Match Requests API
  app.post("/api/match-request", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMatchRequestSchema.parse({
        ...req.body,
        requesterId: req.user?.id,
        status: "Pending"
      });
      
      const matchRequest = await storage.createMatchRequest(validatedData);
      res.status(201).json(matchRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating match request" });
      }
    }
  });

  app.get("/api/match-requests", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const incoming = await storage.getIncomingMatchRequests(userId);
      const outgoing = await storage.getOutgoingMatchRequests(userId);
      
      // Get user details for each request
      const incomingWithUsers = await Promise.all(
        incoming.map(async (request) => {
          const requester = await storage.getUser(request.requesterId);
          return { ...request, requester };
        })
      );
      
      const outgoingWithUsers = await Promise.all(
        outgoing.map(async (request) => {
          const matchedPeer = await storage.getUser(request.matchedPeerId);
          return { ...request, matchedPeer };
        })
      );
      
      res.json({
        incoming: incomingWithUsers,
        outgoing: outgoingWithUsers
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching match requests" });
    }
  });

  app.patch("/api/match-request/:id", ensureAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !["Accepted", "Declined"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const matchRequest = await storage.getMatchRequestById(parseInt(id));
      
      // Check if the request exists and the user is the matched peer
      if (!matchRequest) {
        return res.status(404).json({ message: "Match request not found" });
      }
      
      if (matchRequest.matchedPeerId !== req.user?.id) {
        return res.status(403).json({ message: "Not authorized to update this match request" });
      }
      
      const updatedRequest = await storage.updateMatchRequestStatus(parseInt(id), status);
      
      // If the request was accepted, create an interview slot
      if (status === "Accepted" && updatedRequest) {
        const interviewSlot = await storage.createInterviewSlot({
          interviewerId: matchRequest.matchedPeerId,
          intervieweeId: matchRequest.requesterId,
          slotTime: matchRequest.requestedTime,
          endTime: new Date(new Date(matchRequest.requestedTime).getTime() + 60 * 60 * 1000), // 1 hour duration
          status: "Booked",
          meetingLink: `https://meet.google.com/mock-interview-${Math.random().toString(36).substring(2, 8)}`
        });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Error updating match request" });
    }
  });

  // Interview Slots API
  app.post("/api/book-slot", ensureAuthenticated, async (req, res) => {
    try {
      // Extract data from request body
      const { slotTime, endTime, meetingLink } = req.body;
      
      const validatedData = insertInterviewSlotSchema.parse({
        interviewerId: req.user?.id,
        slotTime, 
        endTime,
        meetingLink,
        status: "Available"
      });
      
      const interviewSlot = await storage.createInterviewSlot(validatedData);
      res.status(201).json(interviewSlot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid slot data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating interview slot" });
      }
    }
  });

  app.get("/api/available-slots", ensureAuthenticated, async (req, res) => {
    try {
      const slots = await storage.getAvailableSlots();
      
      // Get user details for each slot
      const slotsWithUsers = await Promise.all(
        slots.map(async (slot) => {
          const interviewer = await storage.getUser(slot.interviewerId);
          return { ...slot, interviewer };
        })
      );
      
      res.json(slotsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching available slots" });
    }
  });

  app.get("/api/interviews", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const upcoming = await storage.getUserUpcomingInterviews(userId);
      const past = await storage.getUserPastInterviews(userId);
      
      // Get user details for each interview
      const upcomingWithUsers = await Promise.all(
        upcoming.map(async (interview) => {
          const interviewer = await storage.getUser(interview.interviewerId);
          const interviewee = interview.intervieweeId 
            ? await storage.getUser(interview.intervieweeId)
            : null;
          return { 
            ...interview, 
            interviewer,
            interviewee,
            partner: userId === interview.interviewerId ? interviewee : interviewer
          };
        })
      );
      
      const pastWithUsers = await Promise.all(
        past.map(async (interview) => {
          const interviewer = await storage.getUser(interview.interviewerId);
          const interviewee = interview.intervieweeId 
            ? await storage.getUser(interview.intervieweeId)
            : null;
          return { 
            ...interview, 
            interviewer,
            interviewee,
            partner: userId === interview.interviewerId ? interviewee : interviewer
          };
        })
      );
      
      res.json({
        upcoming: upcomingWithUsers,
        past: pastWithUsers
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching interviews" });
    }
  });

  app.patch("/api/book-slot/:id", ensureAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const updatedSlot = await storage.bookInterviewSlot(parseInt(id), userId);
      
      if (!updatedSlot) {
        return res.status(404).json({ message: "Slot not found or not available" });
      }
      
      res.json(updatedSlot);
    } catch (error) {
      res.status(500).json({ message: "Error booking slot" });
    }
  });

  app.delete("/api/cancel-slot/:id", ensureAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const slot = await storage.getInterviewSlotById(parseInt(id));
      
      // Check if the slot exists and the user is part of the interview
      if (!slot) {
        return res.status(404).json({ message: "Interview slot not found" });
      }
      
      if (slot.interviewerId !== userId && slot.intervieweeId !== userId) {
        return res.status(403).json({ message: "Not authorized to cancel this interview" });
      }
      
      const cancelledSlot = await storage.cancelInterviewSlot(parseInt(id));
      
      if (!cancelledSlot) {
        return res.status(400).json({ message: "Could not cancel slot" });
      }
      
      res.json(cancelledSlot);
    } catch (error) {
      res.status(500).json({ message: "Error cancelling slot" });
    }
  });
  
  // Update meeting link for an interview slot
  app.patch("/api/update-meeting-link/:id", ensureAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { meetingLink } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (!meetingLink) {
        return res.status(400).json({ message: "Meeting link is required" });
      }
      
      const slot = await storage.getInterviewSlotById(parseInt(id));
      
      // Check if the slot exists and the user is part of the interview
      if (!slot) {
        return res.status(404).json({ message: "Interview slot not found" });
      }
      
      // Only the interviewer can update the meeting link
      if (slot.interviewerId !== userId) {
        return res.status(403).json({ message: "Only the interviewer can update the meeting link" });
      }
      
      // Update the meeting link in storage
      // For the purposes of this prototype, we'll just update the slot directly
      // In a full implementation, you'd add a storage method for this
      slot.meetingLink = meetingLink;
      
      res.json(slot);
    } catch (error) {
      res.status(500).json({ message: "Error updating meeting link" });
    }
  });

  // Best Match API for finding most suitable peers
  app.get("/api/best-match", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get all users
      const allUsers = await storage.getUsers();
      
      // Filter out current user
      const potentialMatches = allUsers.filter(user => user.id !== userId);
      
      // Implement a simple matching algorithm based on:
      // 1. Experience level (weight: 0.4)
      // 2. Overlapping skills (weight: 0.6)
      
      const scoredMatches = potentialMatches.map(user => {
        // Experience level match (exact match gets 1.0, adjacent levels get 0.5)
        let experienceScore = 0;
        if (user.experienceLevel === currentUser.experienceLevel) {
          experienceScore = 1.0;
        } else if (
          (currentUser.experienceLevel === "Beginner" && user.experienceLevel === "Intermediate") ||
          (currentUser.experienceLevel === "Intermediate" && user.experienceLevel === "Beginner") ||
          (currentUser.experienceLevel === "Intermediate" && user.experienceLevel === "Advanced") ||
          (currentUser.experienceLevel === "Advanced" && user.experienceLevel === "Intermediate")
        ) {
          experienceScore = 0.5;
        }
        
        // Skill overlap calculation
        const userSkills = new Set(user.skills);
        const currentUserSkills = new Set(currentUser.skills);
        
        // Count overlapping skills
        let overlappingSkills = 0;
        currentUserSkills.forEach(skill => {
          if (userSkills.has(skill)) {
            overlappingSkills++;
          }
        });
        
        // Calculate skill score (percentage of the current user's skills that match)
        const skillScore = currentUserSkills.size > 0 
          ? overlappingSkills / currentUserSkills.size 
          : 0;
        
        // Calculate combined score (weighted)
        const combinedScore = (experienceScore * 0.4) + (skillScore * 0.6);
        
        return {
          ...user,
          matchScore: combinedScore
        };
      });
      
      // Sort by match score (descending)
      scoredMatches.sort((a, b) => b.matchScore - a.matchScore);
      
      // Return top 5 matches
      res.json(scoredMatches.slice(0, 5));
    } catch (error) {
      res.status(500).json({ message: "Error finding best matches" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}