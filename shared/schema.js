import { z } from "zod";

// User schema
export const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  skills: z.array(z.string()).default([]),
  targetRole: z.string().optional(),
  bio: z.string().optional(),
});

// Match request schema
export const matchRequestSchema = z.object({
  requesterId: z.string(),
  targetExperienceLevel: z.enum(["beginner", "intermediate", "advanced", "any"]),
  targetSkills: z.array(z.string()).default([]),
  preferredTimes: z.array(z.string()).default([]),
  notes: z.string().optional(),
  status: z.enum(["pending", "accepted", "rejected", "canceled"]).default("pending"),
  matchedPeerId: z.string().optional().nullable(),
});

// Interview slot schema
export const interviewSlotSchema = z.object({
  interviewerId: z.string(),
  intervieweeId: z.string().optional().nullable(),
  startTime: z.date(),
  endTime: z.date(),
  status: z.enum(["available", "booked", "completed", "canceled"]).default("available"),
  meetingLink: z.string().optional(),
  meetingType: z.enum(["zoom", "google-meet", "microsoft-teams", "other"]).default("zoom"),
  notes: z.string().optional(),
  feedback: z.object({
    interviewer: z.string().default(""),
    interviewee: z.string().default(""),
  }).default({ interviewer: "", interviewee: "" }),
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration schema
export const registerSchema = userSchema.extend({
  confirmPassword: z.string().min(6, "Confirm password is required")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Schedule interview schema
export const scheduleInterviewSchema = z.object({
  startTime: z.date(),
  endTime: z.date(),
  meetingLink: z.string().url("Please enter a valid URL"),
  meetingType: z.enum(["zoom", "google-meet", "microsoft-teams", "other"]),
  notes: z.string().optional(),
});

// Export types
export const schemaTypes = {
  userSchema,
  matchRequestSchema,
  interviewSlotSchema,
  loginSchema,
  registerSchema,
  scheduleInterviewSchema
};

export default schemaTypes;