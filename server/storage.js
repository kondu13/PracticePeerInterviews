import session from "express-session";
import createMemoryStore from "memorystore";
import { MongoClient } from "mongodb";
import MongoStore from "connect-mongo";

const MemoryStore = createMemoryStore(session);

export class MemStorage {
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
  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser) {
    const id = this.userCurrentId++;
    const now = new Date();
    const user = { 
      ...insertUser, 
      id, 
      createdAt: now,
      avatarUrl: insertUser.avatarUrl || null 
    };
    this.users.set(id, user);
    return user;
  }
  
  async getUsers() {
    return Array.from(this.users.values());
  }
  
  async getUsersByExperienceLevel(level) {
    return Array.from(this.users.values()).filter(
      (user) => user.experienceLevel === level
    );
  }
  
  async getUsersBySkill(skill) {
    return Array.from(this.users.values()).filter(
      (user) => user.skills.includes(skill)
    );
  }
  
  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Match request methods
  async createMatchRequest(request) {
    const id = this.requestCurrentId++;
    const now = new Date();
    const matchRequest = { 
      ...request, 
      id, 
      createdAt: now, 
      message: request.message || null 
    };
    this.matchRequests.set(id, matchRequest);
    return matchRequest;
  }
  
  async getMatchRequestById(id) {
    return this.matchRequests.get(id);
  }
  
  async getIncomingMatchRequests(userId) {
    return Array.from(this.matchRequests.values()).filter(
      (request) => request.matchedPeerId === userId
    );
  }
  
  async getOutgoingMatchRequests(userId) {
    return Array.from(this.matchRequests.values()).filter(
      (request) => request.requesterId === userId
    );
  }
  
  async updateMatchRequestStatus(id, status, matchedPeerId = null) {
    const request = this.matchRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { 
      ...request, 
      status,
      ...(matchedPeerId ? { matchedPeerId } : {})
    };
    this.matchRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Interview slot methods
  async createInterviewSlot(slot) {
    const id = this.slotCurrentId++;
    const now = new Date();
    const interviewSlot = { 
      ...slot, 
      id, 
      createdAt: now,
      intervieweeId: slot.intervieweeId || null,
      meetingLink: slot.meetingLink || null
    };
    this.interviewSlots.set(id, interviewSlot);
    return interviewSlot;
  }
  
  async getInterviewSlotById(id) {
    return this.interviewSlots.get(id);
  }
  
  async getAvailableSlots() {
    return Array.from(this.interviewSlots.values()).filter(
      (slot) => slot.status === "Available"
    );
  }
  
  async getUserUpcomingInterviews(userId) {
    const now = new Date();
    return Array.from(this.interviewSlots.values()).filter(
      (slot) => 
        (slot.interviewerId === userId || slot.intervieweeId === userId) &&
        slot.status === "Booked" &&
        new Date(slot.slotTime) > now
    ).sort((a, b) => new Date(a.slotTime).getTime() - new Date(b.slotTime).getTime());
  }
  
  async getUserPastInterviews(userId) {
    const now = new Date();
    return Array.from(this.interviewSlots.values()).filter(
      (slot) => 
        (slot.interviewerId === userId || slot.intervieweeId === userId) &&
        (slot.status === "Completed" || 
         (slot.status === "Booked" && new Date(slot.slotTime) < now))
    ).sort((a, b) => new Date(b.slotTime).getTime() - new Date(a.slotTime).getTime());
  }
  
  async bookInterviewSlot(id, intervieweeId) {
    const slot = this.interviewSlots.get(id);
    if (!slot || slot.status !== "Available") return undefined;
    
    const updatedSlot = { 
      ...slot, 
      intervieweeId, 
      status: "Booked" 
    };
    this.interviewSlots.set(id, updatedSlot);
    return updatedSlot;
  }
  
  async cancelInterviewSlot(id) {
    const slot = this.interviewSlots.get(id);
    if (!slot || slot.status !== "Booked") return undefined;
    
    const updatedSlot = { 
      ...slot, 
      status: "Cancelled" 
    };
    this.interviewSlots.set(id, updatedSlot);
    return updatedSlot;
  }
}

// MongoDB Storage implementation
export class MongoStorage {
  constructor(mongoUri) {
    this.mongoUri = mongoUri;
    this.client = new MongoClient(mongoUri);
    this.sessionStore = MongoStore.create({
      mongoUrl: mongoUri,
      ttl: 24 * 60 * 60 // 24 hours
    });
    this.connected = false;
    
    // Connect to the database
    setTimeout(() => this.connect(), 500); // Add slight delay to ensure MongoDB Memory Server is up
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db('mockinterviews');
      console.log("Connected to MongoDB");
      this.connected = true;
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  }

  async ensureConnected() {
    if (!this.connected) {
      await this.connect();
    }
  }

  // User methods
  async getUser(id) {
    await this.ensureConnected();
    const user = await this.db.collection('users').findOne({ id });
    return user || undefined;
  }

  async getUserByUsername(username) {
    await this.ensureConnected();
    const user = await this.db.collection('users').findOne({ username });
    return user || undefined;
  }

  async createUser(insertUser) {
    await this.ensureConnected();
    
    // Get the highest user ID and increment by 1
    const lastUser = await this.db.collection('users')
      .find()
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    
    const id = lastUser.length > 0 ? lastUser[0].id + 1 : 1;
    const now = new Date();
    
    const user = { 
      ...insertUser, 
      id, 
      createdAt: now,
      avatarUrl: insertUser.avatarUrl || null 
    };
    
    await this.db.collection('users').insertOne(user);
    return user;
  }
  
  async getUsers() {
    await this.ensureConnected();
    return await this.db.collection('users').find().toArray();
  }
  
  async getUsersByExperienceLevel(level) {
    await this.ensureConnected();
    return await this.db.collection('users').find({ experienceLevel: level }).toArray();
  }
  
  async getUsersBySkill(skill) {
    await this.ensureConnected();
    return await this.db.collection('users').find({ skills: skill }).toArray();
  }
  
  async updateUser(id, updates) {
    await this.ensureConnected();
    
    const result = await this.db.collection('users').findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    return result.value || undefined;
  }

  // Match request methods
  async createMatchRequest(request) {
    await this.ensureConnected();
    
    // Get the highest match request ID and increment by 1
    const lastRequest = await this.db.collection('matchRequests')
      .find()
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    
    const id = lastRequest.length > 0 ? lastRequest[0].id + 1 : 1;
    const now = new Date();
    
    const matchRequest = { 
      ...request, 
      id, 
      createdAt: now,
      message: request.message || null 
    };
    
    await this.db.collection('matchRequests').insertOne(matchRequest);
    return matchRequest;
  }
  
  async getMatchRequestById(id) {
    await this.ensureConnected();
    const request = await this.db.collection('matchRequests').findOne({ id });
    return request || undefined;
  }
  
  async getIncomingMatchRequests(userId) {
    await this.ensureConnected();
    return await this.db.collection('matchRequests').find({ matchedPeerId: userId }).toArray();
  }
  
  async getOutgoingMatchRequests(userId) {
    await this.ensureConnected();
    return await this.db.collection('matchRequests').find({ requesterId: userId }).toArray();
  }
  
  async updateMatchRequestStatus(id, status, matchedPeerId = null) {
    await this.ensureConnected();
    
    // Create update object
    const updateObj = { status };
    if (matchedPeerId) {
      updateObj.matchedPeerId = matchedPeerId;
    }
    
    const result = await this.db.collection('matchRequests').findOneAndUpdate(
      { id },
      { $set: updateObj },
      { returnDocument: 'after' }
    );
    
    return result.value || undefined;
  }

  // Interview slot methods
  async createInterviewSlot(slot) {
    await this.ensureConnected();
    
    // Get the highest interview slot ID and increment by 1
    const lastSlot = await this.db.collection('interviewSlots')
      .find()
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    
    const id = lastSlot.length > 0 ? lastSlot[0].id + 1 : 1;
    const now = new Date();
    
    const interviewSlot = { 
      ...slot, 
      id, 
      createdAt: now,
      intervieweeId: slot.intervieweeId || null,
      meetingLink: slot.meetingLink || null
    };
    
    await this.db.collection('interviewSlots').insertOne(interviewSlot);
    return interviewSlot;
  }
  
  async getInterviewSlotById(id) {
    await this.ensureConnected();
    const slot = await this.db.collection('interviewSlots').findOne({ id });
    return slot || undefined;
  }
  
  async getAvailableSlots() {
    await this.ensureConnected();
    return await this.db.collection('interviewSlots').find({ status: "Available" }).toArray();
  }
  
  async getUserUpcomingInterviews(userId) {
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
  
  async getUserPastInterviews(userId) {
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
  
  async bookInterviewSlot(id, intervieweeId) {
    await this.ensureConnected();
    
    const result = await this.db.collection('interviewSlots').findOneAndUpdate(
      { id, status: "Available" },
      { $set: { intervieweeId, status: "Booked" } },
      { returnDocument: 'after' }
    );
    
    return result.value || undefined;
  }
  
  async cancelInterviewSlot(id) {
    await this.ensureConnected();
    
    const result = await this.db.collection('interviewSlots').findOneAndUpdate(
      { id, status: "Booked" },
      { $set: { status: "Cancelled" } },
      { returnDocument: 'after' }
    );
    
    return result.value || undefined;
  }
}

// Use in-memory storage for simplicity and consistency
export const storage = new MemStorage();