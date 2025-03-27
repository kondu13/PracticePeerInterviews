import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  skills: text("skills").array().notNull(),
  experienceLevel: text("experience_level").notNull(), // "Beginner", "Intermediate", "Advanced"
  availability: json("availability").notNull(), // Array of { day: string, timeSlots: string[] }
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Match Requests model
export const matchRequests = pgTable("match_requests", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull().references(() => users.id),
  matchedPeerId: integer("matched_peer_id").notNull().references(() => users.id),
  status: text("status").notNull(), // "Pending", "Accepted", "Declined"
  requestedTime: timestamp("requested_time").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Interview Slots model
export const interviewSlots = pgTable("interview_slots", {
  id: serial("id").primaryKey(),
  interviewerId: integer("interviewer_id").notNull().references(() => users.id),
  intervieweeId: integer("interviewee_id").references(() => users.id),
  slotTime: timestamp("slot_time").notNull(),
  endTime: timestamp("end_time").notNull(),
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

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type MatchRequest = typeof matchRequests.$inferSelect;
export type InsertMatchRequest = z.infer<typeof insertMatchRequestSchema>;

export type InterviewSlot = typeof interviewSlots.$inferSelect;
export type InsertInterviewSlot = z.infer<typeof insertInterviewSlotSchema>;

// Additional schema for login
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

export type LoginData = z.infer<typeof loginSchema>;
