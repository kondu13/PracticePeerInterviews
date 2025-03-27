import { users, User, InsertUser, matchRequests, MatchRequest, InsertMatchRequest, interviewSlots, InterviewSlot, InsertInterviewSlot } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Update the storage interface with CRUD methods for our models
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  getUsersByExperienceLevel(level: string): Promise<User[]>;
  getUsersBySkill(skill: string): Promise<User[]>;
  
  // Match request methods
  createMatchRequest(request: InsertMatchRequest): Promise<MatchRequest>;
  getMatchRequestById(id: number): Promise<MatchRequest | undefined>;
  getIncomingMatchRequests(userId: number): Promise<MatchRequest[]>;
  getOutgoingMatchRequests(userId: number): Promise<MatchRequest[]>;
  updateMatchRequestStatus(id: number, status: string): Promise<MatchRequest | undefined>;
  
  // Interview slot methods
  createInterviewSlot(slot: InsertInterviewSlot): Promise<InterviewSlot>;
  getInterviewSlotById(id: number): Promise<InterviewSlot | undefined>;
  getAvailableSlots(): Promise<InterviewSlot[]>;
  getUserUpcomingInterviews(userId: number): Promise<InterviewSlot[]>;
  getUserPastInterviews(userId: number): Promise<InterviewSlot[]>;
  bookInterviewSlot(id: number, intervieweeId: number): Promise<InterviewSlot | undefined>;
  cancelInterviewSlot(id: number): Promise<InterviewSlot | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private matchRequests: Map<number, MatchRequest>;
  private interviewSlots: Map<number, InterviewSlot>;
  sessionStore: session.SessionStore;
  
  private userCurrentId: number;
  private requestCurrentId: number;
  private slotCurrentId: number;

  constructor() {
    this.users = new Map();
    this.matchRequests = new Map();
    this.interviewSlots = new Map();
    this.userCurrentId = 1;
    this.requestCurrentId = 1;
    this.slotCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUsersByExperienceLevel(level: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.experienceLevel === level
    );
  }
  
  async getUsersBySkill(skill: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.skills.includes(skill)
    );
  }

  // Match request methods
  async createMatchRequest(request: InsertMatchRequest): Promise<MatchRequest> {
    const id = this.requestCurrentId++;
    const now = new Date();
    const matchRequest: MatchRequest = { ...request, id, createdAt: now };
    this.matchRequests.set(id, matchRequest);
    return matchRequest;
  }
  
  async getMatchRequestById(id: number): Promise<MatchRequest | undefined> {
    return this.matchRequests.get(id);
  }
  
  async getIncomingMatchRequests(userId: number): Promise<MatchRequest[]> {
    return Array.from(this.matchRequests.values()).filter(
      (request) => request.matchedPeerId === userId
    );
  }
  
  async getOutgoingMatchRequests(userId: number): Promise<MatchRequest[]> {
    return Array.from(this.matchRequests.values()).filter(
      (request) => request.requesterId === userId
    );
  }
  
  async updateMatchRequestStatus(id: number, status: string): Promise<MatchRequest | undefined> {
    const request = this.matchRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest: MatchRequest = { ...request, status };
    this.matchRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Interview slot methods
  async createInterviewSlot(slot: InsertInterviewSlot): Promise<InterviewSlot> {
    const id = this.slotCurrentId++;
    const now = new Date();
    const interviewSlot: InterviewSlot = { ...slot, id, createdAt: now };
    this.interviewSlots.set(id, interviewSlot);
    return interviewSlot;
  }
  
  async getInterviewSlotById(id: number): Promise<InterviewSlot | undefined> {
    return this.interviewSlots.get(id);
  }
  
  async getAvailableSlots(): Promise<InterviewSlot[]> {
    return Array.from(this.interviewSlots.values()).filter(
      (slot) => slot.status === "Available"
    );
  }
  
  async getUserUpcomingInterviews(userId: number): Promise<InterviewSlot[]> {
    const now = new Date();
    return Array.from(this.interviewSlots.values()).filter(
      (slot) => 
        (slot.interviewerId === userId || slot.intervieweeId === userId) &&
        slot.status === "Booked" &&
        new Date(slot.slotTime) > now
    ).sort((a, b) => new Date(a.slotTime).getTime() - new Date(b.slotTime).getTime());
  }
  
  async getUserPastInterviews(userId: number): Promise<InterviewSlot[]> {
    const now = new Date();
    return Array.from(this.interviewSlots.values()).filter(
      (slot) => 
        (slot.interviewerId === userId || slot.intervieweeId === userId) &&
        (slot.status === "Completed" || 
         (slot.status === "Booked" && new Date(slot.slotTime) < now))
    ).sort((a, b) => new Date(b.slotTime).getTime() - new Date(a.slotTime).getTime());
  }
  
  async bookInterviewSlot(id: number, intervieweeId: number): Promise<InterviewSlot | undefined> {
    const slot = this.interviewSlots.get(id);
    if (!slot || slot.status !== "Available") return undefined;
    
    const updatedSlot: InterviewSlot = { 
      ...slot, 
      intervieweeId, 
      status: "Booked" 
    };
    this.interviewSlots.set(id, updatedSlot);
    return updatedSlot;
  }
  
  async cancelInterviewSlot(id: number): Promise<InterviewSlot | undefined> {
    const slot = this.interviewSlots.get(id);
    if (!slot || slot.status !== "Booked") return undefined;
    
    const updatedSlot: InterviewSlot = { 
      ...slot, 
      status: "Cancelled" 
    };
    this.interviewSlots.set(id, updatedSlot);
    return updatedSlot;
  }
}

export const storage = new MemStorage();
