import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema with additional fields for subscription status
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  generationsRemaining: integer("generations_remaining").default(2).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;

// Creation schema for art and models
export const creations = pgTable("creations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Link to user
  type: text("type").notNull(), // "2d" or "3d"
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url").notNull(),
  settings: jsonb("settings").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema for creation input
export const insertCreationSchema = createInsertSchema(creations).pick({
  userId: true,
  type: true,
  prompt: true,
  imageUrl: true,
  settings: true,
});

export type InsertCreation = z.infer<typeof insertCreationSchema>;
export type Creation = typeof creations.$inferSelect;

// Validation for art generation request
export const art2DGenerationSchema = z.object({
  prompt: z.string().min(3).max(1000),
  style: z.string(),
  aspectRatio: z.string(),
  colorScheme: z.string(),
  complexity: z.number().min(1).max(5),
  numImages: z.number().min(1).max(4),
  userId: z.number(),
});

export type Art2DGenerationRequest = z.infer<typeof art2DGenerationSchema>;

// Validation for 3D model generation request
export const model3DGenerationSchema = z.object({
  prompt: z.string().min(3).max(1000),
  modelType: z.string(),
  detailLevel: z.number().min(1).max(5),
  textureQuality: z.number().min(1).max(5),
  style: z.string(),
  format: z.string(),
  userId: z.number(),
});

export type Model3DGenerationRequest = z.infer<typeof model3DGenerationSchema>;

// Payment schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull(), // "pending", "completed", "failed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  userId: true,
  amount: true,
  status: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Schema for uploaded images
export const uploadedImages = pgTable("uploaded_images", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  originalName: text("original_name").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUploadedImageSchema = createInsertSchema(uploadedImages).pick({
  userId: true,
  imageUrl: true,
  originalName: true,
  size: true,
});

export type InsertUploadedImage = z.infer<typeof insertUploadedImageSchema>;
export type UploadedImage = typeof uploadedImages.$inferSelect;

// Schema for image upload
export const imageUploadSchema = z.object({
  userId: z.number(),
  originalName: z.string(),
  size: z.number(),
  imageData: z.string(), // Base64 encoded image data
});

export type ImageUploadRequest = z.infer<typeof imageUploadSchema>;
