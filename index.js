// server/index.ts
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  creationItems;
  uploadedImages;
  payments;
  userCurrentId;
  creationCurrentId;
  uploadedImageCurrentId;
  paymentCurrentId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.creationItems = /* @__PURE__ */ new Map();
    this.uploadedImages = /* @__PURE__ */ new Map();
    this.payments = /* @__PURE__ */ new Map();
    this.userCurrentId = 1;
    this.creationCurrentId = 1;
    this.uploadedImageCurrentId = 1;
    this.paymentCurrentId = 1;
  }
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
    const isPremium = false;
    const generationsRemaining = 2;
    const createdAt = /* @__PURE__ */ new Date();
    const user = {
      ...insertUser,
      id,
      isPremium,
      generationsRemaining,
      createdAt
    };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async decrementUserGenerations(userId) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    if (user.isPremium) {
      return -1;
    }
    if (user.generationsRemaining <= 0) {
      throw new Error("No generations remaining");
    }
    const generationsRemaining = user.generationsRemaining - 1;
    const updatedUser = { ...user, generationsRemaining };
    this.users.set(userId, updatedUser);
    return generationsRemaining;
  }
  async getCreations(limit = 100, type, userId) {
    const allCreations = Array.from(this.creationItems.values());
    let filteredCreations = allCreations;
    if (type) {
      filteredCreations = filteredCreations.filter((creation) => creation.type === type);
    }
    if (userId) {
      filteredCreations = filteredCreations.filter((creation) => creation.userId === userId);
    }
    const sortedCreations = filteredCreations.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return sortedCreations.slice(0, limit);
  }
  async getCreation(id) {
    return this.creationItems.get(id);
  }
  async createCreation(insertCreation) {
    const id = this.creationCurrentId++;
    const createdAt = /* @__PURE__ */ new Date();
    const creation = { ...insertCreation, id, createdAt };
    this.creationItems.set(id, creation);
    return creation;
  }
  // Payment methods
  async createPayment(payment) {
    const id = this.paymentCurrentId++;
    const createdAt = /* @__PURE__ */ new Date();
    const newPayment = { ...payment, id, createdAt };
    this.payments.set(id, newPayment);
    return newPayment;
  }
  async getPayments(userId) {
    const allPayments = Array.from(this.payments.values());
    const userPayments = allPayments.filter((payment) => payment.userId === userId);
    return userPayments.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  async getPayment(id) {
    return this.payments.get(id);
  }
  async updatePaymentStatus(id, status) {
    const payment = this.payments.get(id);
    if (!payment) return void 0;
    const updatedPayment = { ...payment, status };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  // Upload methods
  async saveUploadedImage(image) {
    const id = this.uploadedImageCurrentId++;
    const createdAt = /* @__PURE__ */ new Date();
    const uploadedImage = { ...image, id, createdAt };
    this.uploadedImages.set(id, uploadedImage);
    return uploadedImage;
  }
  async getUserUploads(userId) {
    const allUploads = Array.from(this.uploadedImages.values());
    const userUploads = allUploads.filter((upload2) => upload2.userId === userId);
    return userUploads.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  async getUploadedImage(id) {
    return this.uploadedImages.get(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  generationsRemaining: integer("generations_remaining").default(2).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true
});
var loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100)
});
var creations = pgTable("creations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  // Link to user
  type: text("type").notNull(),
  // "2d" or "3d"
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url").notNull(),
  settings: jsonb("settings").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertCreationSchema = createInsertSchema(creations).pick({
  userId: true,
  type: true,
  prompt: true,
  imageUrl: true,
  settings: true
});
var art2DGenerationSchema = z.object({
  prompt: z.string().min(3).max(1e3),
  style: z.string(),
  aspectRatio: z.string(),
  colorScheme: z.string(),
  complexity: z.number().min(1).max(5),
  numImages: z.number().min(1).max(4),
  userId: z.number()
});
var model3DGenerationSchema = z.object({
  prompt: z.string().min(3).max(1e3),
  modelType: z.string(),
  detailLevel: z.number().min(1).max(5),
  textureQuality: z.number().min(1).max(5),
  style: z.string(),
  format: z.string(),
  userId: z.number()
});
var payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull(),
  // "pending", "completed", "failed"
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertPaymentSchema = createInsertSchema(payments).pick({
  userId: true,
  amount: true,
  status: true
});
var uploadedImages = pgTable("uploaded_images", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  originalName: text("original_name").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUploadedImageSchema = createInsertSchema(uploadedImages).pick({
  userId: true,
  imageUrl: true,
  originalName: true,
  size: true
});
var imageUploadSchema = z.object({
  userId: z.number(),
  originalName: z.string(),
  size: z.number(),
  imageData: z.string()
  // Base64 encoded image data
});

// server/routes.ts
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import multer from "multer";
import fs3 from "fs";
import path3 from "path";

// server/api/imageGenerator.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
async function generateImageFromPrompt(prompt, style = "default", numImages = 1) {
  const results = [];
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const imagesDir = path.join(process.cwd(), "client", "public", "generated-images");
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  for (let i = 0; i < numImages; i++) {
    const id = crypto.randomBytes(16).toString("hex");
    const filename = `${id}.svg`;
    const filePath = path.join(imagesDir, filename);
    const colors = getRandomColors(style);
    const width = 800;
    const height = 600;
    const svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" fill="white">${prompt}</text>
      <text x="50%" y="70%" font-family="Arial" font-size="18" text-anchor="middle" fill="white">Style: ${style}</text>
    </svg>
    `;
    fs.writeFileSync(filePath, svgContent);
    results.push({
      url: `/generated-images/${filename}`
    });
  }
  return results;
}
function getRandomColors(style) {
  switch (style.toLowerCase()) {
    case "abstract":
      return [getRandomColor(), getRandomColor()];
    case "minimalist":
      return ["#f5f5f5", "#e0e0e0"];
    case "vibrant":
      return ["#ff3366", "#33ccff"];
    case "dark":
      return ["#333333", "#111111"];
    case "landscape":
      return ["#66cc99", "#3399ff"];
    case "portrait":
      return ["#ff9966", "#ff6699"];
    default:
      return [getRandomColor(), getRandomColor()];
  }
}
function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

// server/api/modelGenerator.ts
import fs2 from "fs";
import path2 from "path";
import crypto2 from "crypto";
async function generate3DModelFromPrompt(prompt, modelType = "cube") {
  const uploadsDir = path2.join(process.cwd(), "uploads");
  if (!fs2.existsSync(uploadsDir)) {
    fs2.mkdirSync(uploadsDir, { recursive: true });
  }
  const modelsDir = path2.join(process.cwd(), "client", "public", "generated-models");
  if (!fs2.existsSync(modelsDir)) {
    fs2.mkdirSync(modelsDir, { recursive: true });
  }
  const id = crypto2.randomBytes(16).toString("hex");
  const filename = `${id}.svg`;
  const filePath = path2.join(modelsDir, filename);
  const colors = getModelColors(modelType);
  const width = 800;
  const height = 600;
  const svgContent = generate3DSVG(prompt, modelType, width, height, colors);
  fs2.writeFileSync(filePath, svgContent);
  return {
    url: `/generated-models/${filename}`
  };
}
function getModelColors(modelType) {
  switch (modelType.toLowerCase()) {
    case "character":
      return ["#e6ccff", "#b366ff", "#7f00ff"];
    case "vehicle":
      return ["#cccccc", "#999999", "#666666"];
    case "building":
      return ["#f2d9d9", "#d9b3b3", "#bf8c8c"];
    case "furniture":
      return ["#f2e6d9", "#d9c2a6", "#bf9f73"];
    case "abstract":
      return ["#d9f2e6", "#a6d9c2", "#73bf9f"];
    default:
      return ["#e6f2ff", "#b3d9ff", "#80bfff"];
  }
}
function generate3DSVG(prompt, modelType, width, height, colors) {
  let svgContent = "";
  switch (modelType.toLowerCase()) {
    case "character":
      svgContent = generateCharacterSVG(colors);
      break;
    case "vehicle":
      svgContent = generateVehicleSVG(colors);
      break;
    case "building":
      svgContent = generateBuildingSVG(colors);
      break;
    case "furniture":
      svgContent = generateFurnitureSVG(colors);
      break;
    case "abstract":
      svgContent = generateAbstractSVG(colors);
      break;
    default:
      svgContent = generateCubeSVG(colors);
  }
  return `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f5f5f5" />
    <text x="50%" y="60" font-family="Arial" font-size="24" text-anchor="middle" fill="#333">${prompt}</text>
    <text x="50%" y="${height - 30}" font-family="Arial" font-size="18" text-anchor="middle" fill="#666">Model Type: ${modelType}</text>
    <g transform="translate(${width / 2}, ${height / 2 - 50})">${svgContent}</g>
  </svg>
  `;
}
function generateCubeSVG(colors) {
  return `
    <!-- Cube -->
    <polygon points="0,-80 80,0 0,80 -80,0" fill="${colors[0]}" stroke="#333" />
    <polygon points="0,-80 80,0 80,-80" fill="${colors[1]}" stroke="#333" />
    <polygon points="80,0 0,80 80,80" fill="${colors[2]}" stroke="#333" />
  `;
}
function generateCharacterSVG(colors) {
  return `
    <!-- Character -->
    <circle cx="0" cy="-60" r="40" fill="${colors[0]}" stroke="#333" /> <!-- Head -->
    <rect x="-40" y="-10" width="80" height="120" rx="10" fill="${colors[1]}" stroke="#333" /> <!-- Body -->
    <rect x="-60" y="20" width="30" height="80" rx="5" fill="${colors[2]}" stroke="#333" transform="rotate(15,-45,60)" /> <!-- Left arm -->
    <rect x="30" y="20" width="30" height="80" rx="5" fill="${colors[2]}" stroke="#333" transform="rotate(-15,45,60)" /> <!-- Right arm -->
    <rect x="-40" y="110" width="30" height="80" rx="5" fill="${colors[2]}" stroke="#333" /> <!-- Left leg -->
    <rect x="10" y="110" width="30" height="80" rx="5" fill="${colors[2]}" stroke="#333" /> <!-- Right leg -->
  `;
}
function generateVehicleSVG(colors) {
  return `
    <!-- Vehicle -->
    <rect x="-100" y="-30" width="200" height="60" rx="10" fill="${colors[0]}" stroke="#333" /> <!-- Body -->
    <rect x="-70" y="-60" width="140" height="40" rx="5" fill="${colors[1]}" stroke="#333" /> <!-- Top -->
    <circle cx="-60" cy="40" r="20" fill="${colors[2]}" stroke="#333" /> <!-- Left wheel -->
    <circle cx="60" cy="40" r="20" fill="${colors[2]}" stroke="#333" /> <!-- Right wheel -->
    <rect x="-90" y="0" width="30" height="10" fill="${colors[1]}" /> <!-- Left light -->
    <rect x="60" y="0" width="30" height="10" fill="${colors[1]}" /> <!-- Right light -->
  `;
}
function generateBuildingSVG(colors) {
  return `
    <!-- Building -->
    <rect x="-100" y="-120" width="200" height="240" fill="${colors[0]}" stroke="#333" /> <!-- Main building -->
    <rect x="-80" y="-100" width="40" height="40" fill="${colors[1]}" stroke="#333" /> <!-- Window -->
    <rect x="40" y="-100" width="40" height="40" fill="${colors[1]}" stroke="#333" /> <!-- Window -->
    <rect x="-80" y="-40" width="40" height="40" fill="${colors[1]}" stroke="#333" /> <!-- Window -->
    <rect x="40" y="-40" width="40" height="40" fill="${colors[1]}" stroke="#333" /> <!-- Window -->
    <rect x="-80" y="20" width="40" height="40" fill="${colors[1]}" stroke="#333" /> <!-- Window -->
    <rect x="40" y="20" width="40" height="40" fill="${colors[1]}" stroke="#333" /> <!-- Window -->
    <rect x="-20" y="60" width="40" height="60" fill="${colors[2]}" stroke="#333" /> <!-- Door -->
  `;
}
function generateFurnitureSVG(colors) {
  return `
    <!-- Furniture (chair) -->
    <rect x="-60" y="-80" width="120" height="20" fill="${colors[0]}" stroke="#333" /> <!-- Back rest -->
    <rect x="-60" y="-60" width="120" height="20" fill="${colors[1]}" stroke="#333" /> <!-- Seat -->
    <rect x="-60" y="-40" width="10" height="80" fill="${colors[2]}" stroke="#333" /> <!-- Left back leg -->
    <rect x="50" y="-40" width="10" height="80" fill="${colors[2]}" stroke="#333" /> <!-- Right back leg -->
    <rect x="-50" y="30" width="10" height="10" fill="${colors[2]}" stroke="#333" /> <!-- Left front leg -->
    <rect x="40" y="30" width="10" height="10" fill="${colors[2]}" stroke="#333" /> <!-- Right front leg -->
  `;
}
function generateAbstractSVG(colors) {
  return `
    <!-- Abstract shape -->
    <polygon points="0,-80 50,-30 80,30 50,80 -50,80 -80,30 -50,-30" fill="${colors[0]}" stroke="#333" />
    <circle cx="0" cy="0" r="40" fill="${colors[1]}" stroke="#333" />
    <rect x="-30" y="-30" width="60" height="60" fill="none" stroke="${colors[2]}" stroke-width="5" />
  `;
}

// server/routes.ts
var multerStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path3.join(process.cwd(), "uploads");
    if (!fs3.existsSync(uploadDir)) {
      fs3.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path3.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  }
});
var upload = multer({ storage: multerStorage });
function configurePassport() {
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}
async function checkGenerationQuota(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await storage.getUser(req.user.id);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  if (user.isPremium || user.generationsRemaining > 0) {
    return next();
  }
  res.status(403).json({
    message: "Generation limit reached",
    requiresPayment: true
  });
}
async function registerRoutes(app2) {
  app2.use(session({
    secret: "galbi-art-generator-secret",
    // In production, use environment variable
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
    // Set to true in production with HTTPS
  }));
  configurePassport();
  app2.use(passport.initialize());
  app2.use(passport.session());
  app2.use("/uploads", express.static(path3.join(process.cwd(), "uploads")));
  app2.post("/api/auth/login", (req, res, next) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid login data",
        errors: result.error.errors
      });
    }
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      req.logIn(user, (err2) => {
        if (err2) return next(err2);
        return res.json({
          message: "Login successful",
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            isPremium: user.isPremium,
            generationsRemaining: user.generationsRemaining
          }
        });
      });
    })(req, res, next);
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid registration data",
          errors: result.error.errors
        });
      }
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(req.body);
      req.logIn(user, (err) => {
        if (err) return res.status(500).json({ message: err.message });
        return res.status(201).json({
          message: "Registration successful",
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            isPremium: user.isPremium,
            generationsRemaining: user.generationsRemaining
          }
        });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: "Logout successful" });
    });
  });
  app2.get("/api/auth/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      isPremium: user.isPremium,
      generationsRemaining: user.generationsRemaining
    });
  });
  app2.post("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const payment = await storage.createPayment({
        userId,
        amount: 999,
        // $9.99
        status: "completed"
        // In a real app, this would be 'pending' until confirmed
      });
      const updatedUser = await storage.updateUser(userId, {
        isPremium: true,
        generationsRemaining: -1
        // -1 means unlimited
      });
      res.json({
        message: "Payment successful",
        payment,
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/uploads", isAuthenticated, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const userId = req.user.id;
      const imageUrl = `/uploads/${req.file.filename}`;
      const uploadedImage = await storage.saveUploadedImage({
        userId,
        imageUrl,
        originalName: req.file.originalname,
        size: req.file.size
      });
      res.json(uploadedImage);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/creations", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 100;
      const type = req.query.type;
      const creations2 = await storage.getCreations(limit, type);
      res.json(creations2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/creations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      const creation = await storage.getCreation(id);
      if (!creation) {
        return res.status(404).json({ message: "Creation not found" });
      }
      res.json(creation);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/generate/2d", isAuthenticated, checkGenerationQuota, async (req, res) => {
    try {
      const result = art2DGenerationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: result.error.errors
        });
      }
      const { prompt, style, aspectRatio, colorScheme, complexity, numImages } = result.data;
      const userId = req.user.id;
      await storage.decrementUserGenerations(userId);
      const generatedImages = await generateImageFromPrompt(prompt, style, numImages);
      const creations2 = await Promise.all(
        generatedImages.map(async (image) => {
          return await storage.createCreation({
            type: "2d",
            userId,
            prompt,
            imageUrl: image.url,
            settings: {
              style,
              aspectRatio,
              colorScheme,
              complexity
            }
          });
        })
      );
      res.json(creations2);
    } catch (error) {
      console.error("Error generating 2D art:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/generate/3d", isAuthenticated, checkGenerationQuota, async (req, res) => {
    try {
      const result = model3DGenerationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: result.error.errors
        });
      }
      const { prompt, modelType, detailLevel, textureQuality, style, format } = result.data;
      const userId = req.user.id;
      await storage.decrementUserGenerations(userId);
      const generatedModel = await generate3DModelFromPrompt(prompt, modelType);
      const creation = await storage.createCreation({
        type: "3d",
        userId,
        prompt,
        imageUrl: generatedModel.url,
        settings: {
          modelType,
          detailLevel,
          textureQuality,
          style,
          format
        }
      });
      res.json(creation);
    } catch (error) {
      console.error("Error generating 3D model:", error);
      res.status(500).json({ message: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs4 from "fs";
import path5, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path4, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path4.resolve(__dirname, "client", "src"),
      "@shared": path4.resolve(__dirname, "shared"),
      "@assets": path4.resolve(__dirname, "attached_assets")
    }
  },
  root: path4.resolve(__dirname, "client"),
  build: {
    outDir: path4.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path5.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs4.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path5.resolve(__dirname2, "public");
  if (!fs4.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path5.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path6 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path6.startsWith("/api")) {
      let logLine = `${req.method} ${path6} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
