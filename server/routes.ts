import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { 
  art2DGenerationSchema, 
  model3DGenerationSchema, 
  loginSchema, 
  insertUserSchema,
  imageUploadSchema,
  insertPaymentSchema
} from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// Custom file generation functions instead of relying on OpenAI
import { generateImageFromPrompt } from "./api/imageGenerator";
import { generate3DModelFromPrompt } from "./api/modelGenerator";

// Configure multer for file uploads
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const upload = multer({ storage: multerStorage });

// Setup passport for authentication
function configurePassport() {
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await dbStorage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        
        // In production, use proper password hashing (bcrypt, etc.)
        if (user.password !== password) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await dbStorage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Middleware to check if user has generation quota
async function checkGenerationQuota(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const user = await dbStorage.getUser((req.user as any).id);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }
  
  if (user.isPremium || user.generationsRemaining > 0) {
    return next();
  }
  
  res.status(403).json({ 
    message: 'Generation limit reached',
    requiresPayment: true
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: 'galbi-art-generator-secret', // In production, use environment variable
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
  }));
  
  // Configure and initialize passport
  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // Authentication routes
  app.post('/api/auth/login', (req, res, next) => {
    // Validate request
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Invalid login data',
        errors: result.error.errors
      });
    }
    
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info.message || 'Authentication failed' });
      }
      
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({
          message: 'Login successful',
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
  
  app.post('/api/auth/register', async (req, res) => {
    try {
      // Validate request
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: 'Invalid registration data',
          errors: result.error.errors
        });
      }
      
      // Check if username already exists
      const existingUser = await dbStorage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      // Create user
      const user = await dbStorage.createUser(req.body);
      
      // Auto-login after registration
      req.logIn(user, (err) => {
        if (err) return res.status(500).json({ message: err.message });
        
        return res.status(201).json({
          message: 'Registration successful',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            isPremium: user.isPremium,
            generationsRemaining: user.generationsRemaining
          }
        });
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Logout successful' });
    });
  });
  
  app.get('/api/auth/user', (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      isPremium: user.isPremium,
      generationsRemaining: user.generationsRemaining
    });
  });
  
  // Payment routes
  app.post('/api/payments', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // In a real app, this would integrate with a payment processor
      // For this demo, we'll just create a payment record and upgrade the user
      
      // Create payment record
      const payment = await dbStorage.createPayment({
        userId,
        amount: 999, // $9.99
        status: 'completed' // In a real app, this would be 'pending' until confirmed
      });
      
      // Update user to premium
      const updatedUser = await dbStorage.updateUser(userId, {
        isPremium: true,
        generationsRemaining: -1 // -1 means unlimited
      });
      
      res.json({
        message: 'Payment successful',
        payment,
        user: updatedUser
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Image upload route
  app.post('/api/uploads', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const userId = (req.user as any).id;
      const imageUrl = `/uploads/${req.file.filename}`;
      
      // Save upload record
      const uploadedImage = await dbStorage.saveUploadedImage({
        userId,
        imageUrl,
        originalName: req.file.originalname,
        size: req.file.size
      });
      
      res.json(uploadedImage);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // GET all creations (with optional filtering)
  app.get("/api/creations", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const type = req.query.type as string | undefined;
      
      const creations = await dbStorage.getCreations(limit, type);
      res.json(creations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET a specific creation by ID
  app.get("/api/creations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const creation = await dbStorage.getCreation(id);
      if (!creation) {
        return res.status(404).json({ message: "Creation not found" });
      }
      
      res.json(creation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate 2D art (requires authentication and quota check)
  app.post("/api/generate/2d", isAuthenticated, checkGenerationQuota, async (req, res) => {
    try {
      // Validate request body
      const result = art2DGenerationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.errors 
        });
      }
      
      const { prompt, style, aspectRatio, colorScheme, complexity, numImages } = result.data;
      const userId = (req.user as any).id;
      
      // Decrement user's generation quota (if not premium)
      await dbStorage.decrementUserGenerations(userId);
      
      // Generate art using our custom generator (not OpenAI)
      const generatedImages = await generateImageFromPrompt(prompt, style, numImages);
      
      // Store each generated image in the database
      const creations = await Promise.all(
        generatedImages.map(async (image) => {
          return await dbStorage.createCreation({
            type: "2d",
            userId,
            prompt,
            imageUrl: image.url,
            settings: {
              style,
              aspectRatio,
              colorScheme,
              complexity,
            },
          });
        })
      );
      
      res.json(creations);
    } catch (error: any) {
      console.error("Error generating 2D art:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Generate 3D model (requires authentication and quota check)
  app.post("/api/generate/3d", isAuthenticated, checkGenerationQuota, async (req, res) => {
    try {
      // Validate request body
      const result = model3DGenerationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.errors 
        });
      }
      
      const { prompt, modelType, detailLevel, textureQuality, style, format } = result.data;
      const userId = (req.user as any).id;
      
      // Decrement user's generation quota (if not premium)
      await dbStorage.decrementUserGenerations(userId);
      
      // Generate 3D model using our custom generator (not OpenAI)
      const generatedModel = await generate3DModelFromPrompt(prompt, modelType);
      
      // Store in the database
      const creation = await dbStorage.createCreation({
        type: "3d",
        userId,
        prompt,
        imageUrl: generatedModel.url,
        settings: {
          modelType,
          detailLevel,
          textureQuality,
          style,
          format,
        },
      });
      
      res.json(creation);
    } catch (error: any) {
      console.error("Error generating 3D model:", error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
