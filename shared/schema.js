import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  skills: text("skills").array().notNull(),
  experienceLevel: text("experience_level").notNull(), // "Junior", "Mid-level", "Senior"
  targetRole: text("target_role"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Match Requests model
export const matchRequests = pgTable("match_requests", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull().references(() => users.id),
  matchedPeerId: integer("matched_peer_id").notNull().references(() => users.id),
  status: text("status").notNull(), // "Pending", "Accepted", "Rejected", "Cancelled"
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Interview Slots model
export const interviewSlots = pgTable("interview_slots", {
  id: serial("id").primaryKey(),
  interviewerId: integer("interviewer_id").notNull().references(() => users.id),
  intervieweeId: integer("interviewee_id").references(() => users.id),
  slotTime: timestamp("slot_time").notNull(),
  duration: integer("duration").notNull(), // in minutes
  topic: text("topic"),
  notes: text("notes"),
  status: text("status").notNull(), // "Available", "Booked", "Completed", "Cancelled"
  meetingLink: text("meeting_link"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true });

export const insertMatchRequestSchema = createInsertSchema(matchRequests)
  .omit({ id: true, createdAt: true });

export const insertInterviewSlotSchema = createInsertSchema(interviewSlots)
  .omit({ id: true, createdAt: true });

// Additional schema for login
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

// Export schemaTypes for backward compatibility with JavaScript code
export const schemaTypes = {
  users,
  matchRequests,
  interviewSlots,
  insertUserSchema,
  insertMatchRequestSchema,
  insertInterviewSlotSchema,
  loginSchema
};