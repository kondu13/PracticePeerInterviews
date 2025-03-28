import { users, User, InsertUser, matchRequests, MatchRequest, InsertMatchRequest, interviewSlots, InterviewSlot, InsertInterviewSlot } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { MongoClient, ObjectId } from "mongodb";

const MemoryStore = createMemoryStore(session);

// Update the storage interface with CRUD methods for our models
import { Store } from "express-session";

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
  sessionStore: Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private matchRequests: Map<number, MatchRequest>;
  private interviewSlots: Map<number, InterviewSlot>;
  sessionStore: Store;
  
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
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      avatarUrl: insertUser.avatarUrl || null 
    };
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
    const matchRequest: MatchRequest = { 
      ...request, 
      id, 
      createdAt: now, 
      message: request.message || null 
    };
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
    const interviewSlot: InterviewSlot = { 
      ...slot, 
      id, 
      createdAt: now,
      intervieweeId: slot.intervieweeId || null,
      meetingLink: slot.meetingLink || null
    };
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

// MongoDB Storage implementation
export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: any;
  sessionStore: Store;
  private connected: boolean = false;
  private mongoUri: string;

  constructor(mongoUri: string) {
    this.mongoUri = mongoUri;
    this.client = new MongoClient(mongoUri);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Connect to the database
    setTimeout(() => this.connect(), 500); // Add slight delay to ensure MongoDB Memory Server is up
  }

  private async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db('mockinterviews');
      console.log("Connected to MongoDB");
      this.connected = true;
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  }

  private async ensureConnected() {
    if (!this.connected) {
      await this.connect();
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    await this.ensureConnected();
    const user = await this.db.collection('users').findOne({ id });
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.ensureConnected();
    const user = await this.db.collection('users').findOne({ username });
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.ensureConnected();
    
    // Get the highest user ID and increment by 1
    const lastUser = await this.db.collection('users')
      .find()
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    
    const id = lastUser.length > 0 ? lastUser[0].id + 1 : 1;
    const now = new Date();
    
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      avatarUrl: insertUser.avatarUrl || null 
    };
    
    await this.db.collection('users').insertOne(user);
    return user;
  }
  
  async getUsers(): Promise<User[]> {
    await this.ensureConnected();
    return await this.db.collection('users').find().toArray();
  }
  
  async getUsersByExperienceLevel(level: string): Promise<User[]> {
    await this.ensureConnected();
    return await this.db.collection('users').find({ experienceLevel: level }).toArray();
  }
  
  async getUsersBySkill(skill: string): Promise<User[]> {
    await this.ensureConnected();
    return await this.db.collection('users').find({ skills: skill }).toArray();
  }

  // Match request methods
  async createMatchRequest(request: InsertMatchRequest): Promise<MatchRequest> {
    await this.ensureConnected();
    
    // Get the highest match request ID and increment by 1
    const lastRequest = await this.db.collection('matchRequests')
      .find()
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    
    const id = lastRequest.length > 0 ? lastRequest[0].id + 1 : 1;
    const now = new Date();
    
    const matchRequest: MatchRequest = { 
      ...request, 
      id, 
      createdAt: now,
      message: request.message || null 
    };
    
    await this.db.collection('matchRequests').insertOne(matchRequest);
    return matchRequest;
  }
  
  async getMatchRequestById(id: number): Promise<MatchRequest | undefined> {
    await this.ensureConnected();
    const request = await this.db.collection('matchRequests').findOne({ id });
    return request || undefined;
  }
  
  async getIncomingMatchRequests(userId: number): Promise<MatchRequest[]> {
    await this.ensureConnected();
    return await this.db.collection('matchRequests').find({ matchedPeerId: userId }).toArray();
  }
  
  async getOutgoingMatchRequests(userId: number): Promise<MatchRequest[]> {
    await this.ensureConnected();
    return await this.db.collection('matchRequests').find({ requesterId: userId }).toArray();
  }
  
  async updateMatchRequestStatus(id: number, status: string): Promise<MatchRequest | undefined> {
    await this.ensureConnected();
    
    const result = await this.db.collection('matchRequests').findOneAndUpdate(
      { id },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    
    return result.value || undefined;
  }

  // Interview slot methods
  async createInterviewSlot(slot: InsertInterviewSlot): Promise<InterviewSlot> {
    await this.ensureConnected();
    
    // Get the highest interview slot ID and increment by 1
    const lastSlot = await this.db.collection('interviewSlots')
      .find()
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    
    const id = lastSlot.length > 0 ? lastSlot[0].id + 1 : 1;
    const now = new Date();
    
    const interviewSlot: InterviewSlot = { 
      ...slot, 
      id, 
      createdAt: now,
      intervieweeId: slot.intervieweeId || null,
      meetingLink: slot.meetingLink || null
    };
    
    await this.db.collection('interviewSlots').insertOne(interviewSlot);
    return interviewSlot;
  }
  
  async getInterviewSlotById(id: number): Promise<InterviewSlot | undefined> {
    await this.ensureConnected();
    const slot = await this.db.collection('interviewSlots').findOne({ id });
    return slot || undefined;
  }
  
  async getAvailableSlots(): Promise<InterviewSlot[]> {
    await this.ensureConnected();
    return await this.db.collection('interviewSlots').find({ status: "Available" }).toArray();
  }
  
  async getUserUpcomingInterviews(userId: number): Promise<InterviewSlot[]> {
    await this.ensureConnected();
    const now = new Date();
    
    return await this.db.collection('interviewSlots').find({
      $and: [
        { $or: [{ interviewerId: userId }, { intervieweeId: userId }] },
        { status: "Booked" },
        { slotTime: { $gt: now } }
      ]
    }).sort({ slotTime: 1 }).toArray();
  }
  
  async getUserPastInterviews(userId: number): Promise<InterviewSlot[]> {
    await this.ensureConnected();
    const now = new Date();
    
    return await this.db.collection('interviewSlots').find({
      $and: [
        { $or: [{ interviewerId: userId }, { intervieweeId: userId }] },
        { $or: [
            { status: "Completed" },
            { $and: [{ status: "Booked" }, { slotTime: { $lt: now } }] }
          ]
        }
      ]
    }).sort({ slotTime: -1 }).toArray();
  }
  
  async bookInterviewSlot(id: number, intervieweeId: number): Promise<InterviewSlot | undefined> {
    await this.ensureConnected();
    
    const result = await this.db.collection('interviewSlots').findOneAndUpdate(
      { id, status: "Available" },
      { $set: { intervieweeId, status: "Booked" } },
      { returnDocument: 'after' }
    );
    
    return result.value || undefined;
  }
  
  async cancelInterviewSlot(id: number): Promise<InterviewSlot | undefined> {
    await this.ensureConnected();
    
    const result = await this.db.collection('interviewSlots').findOneAndUpdate(
      { id, status: "Booked" },
      { $set: { status: "Cancelled" } },
      { returnDocument: 'after' }
    );
    
    return result.value || undefined;
  }
}

// Use MongoDB storage when MONGODB_URI is available
export const storage = process.env.MONGODB_URI
  ? new MongoStorage(process.env.MONGODB_URI)
  : new MemStorage();
