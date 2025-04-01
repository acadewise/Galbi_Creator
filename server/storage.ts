import { 
  users, type User, type InsertUser, 
  creations, type Creation, type InsertCreation,
  uploadedImages, type UploadedImage, type InsertUploadedImage,
  payments, type Payment, type InsertPayment
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<Omit<User, 'id'>>): Promise<User | undefined>;
  
  // Creation methods
  getCreations(limit?: number, type?: string, userId?: number): Promise<Creation[]>;
  getCreation(id: number): Promise<Creation | undefined>;
  createCreation(creation: InsertCreation): Promise<Creation>;
  
  // User generation quota methods
  decrementUserGenerations(userId: number): Promise<number>;
  
  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayments(userId: number): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
  
  // Upload methods
  saveUploadedImage(image: InsertUploadedImage): Promise<UploadedImage>;
  getUserUploads(userId: number): Promise<UploadedImage[]>;
  getUploadedImage(id: number): Promise<UploadedImage | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private creationItems: Map<number, Creation>;
  private uploadedImages: Map<number, UploadedImage>;
  private payments: Map<number, Payment>;
  
  userCurrentId: number;
  creationCurrentId: number;
  uploadedImageCurrentId: number;
  paymentCurrentId: number;

  constructor() {
    this.users = new Map();
    this.creationItems = new Map();
    this.uploadedImages = new Map();
    this.payments = new Map();
    
    this.userCurrentId = 1;
    this.creationCurrentId = 1;
    this.uploadedImageCurrentId = 1;
    this.paymentCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const isPremium = false;
    const generationsRemaining = 2;
    const createdAt = new Date();
    
    const user: User = { 
      ...insertUser, 
      id, 
      isPremium, 
      generationsRemaining, 
      createdAt 
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updates: Partial<Omit<User, 'id'>>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async decrementUserGenerations(userId: number): Promise<number> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    
    if (user.isPremium) {
      // Premium users don't have usage limits
      return -1;
    }
    
    if (user.generationsRemaining <= 0) {
      throw new Error('No generations remaining');
    }
    
    const generationsRemaining = user.generationsRemaining - 1;
    const updatedUser = { ...user, generationsRemaining };
    this.users.set(userId, updatedUser);
    
    return generationsRemaining;
  }

  async getCreations(limit: number = 100, type?: string, userId?: number): Promise<Creation[]> {
    const allCreations = Array.from(this.creationItems.values());
    
    // Apply filters
    let filteredCreations = allCreations;
    
    if (type) {
      filteredCreations = filteredCreations.filter(creation => creation.type === type);
    }
    
    if (userId) {
      filteredCreations = filteredCreations.filter(creation => creation.userId === userId);
    }
    
    // Sort by createdAt in descending order (newest first)
    const sortedCreations = filteredCreations.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return sortedCreations.slice(0, limit);
  }

  async getCreation(id: number): Promise<Creation | undefined> {
    return this.creationItems.get(id);
  }

  async createCreation(insertCreation: InsertCreation): Promise<Creation> {
    const id = this.creationCurrentId++;
    const createdAt = new Date();
    const creation: Creation = { ...insertCreation, id, createdAt };
    this.creationItems.set(id, creation);
    return creation;
  }
  
  // Payment methods
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.paymentCurrentId++;
    const createdAt = new Date();
    const newPayment: Payment = { ...payment, id, createdAt };
    this.payments.set(id, newPayment);
    return newPayment;
  }
  
  async getPayments(userId: number): Promise<Payment[]> {
    const allPayments = Array.from(this.payments.values());
    const userPayments = allPayments.filter(payment => payment.userId === userId);
    
    // Sort by createdAt in descending order
    return userPayments.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment: Payment = { ...payment, status };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // Upload methods
  async saveUploadedImage(image: InsertUploadedImage): Promise<UploadedImage> {
    const id = this.uploadedImageCurrentId++;
    const createdAt = new Date();
    const uploadedImage: UploadedImage = { ...image, id, createdAt };
    this.uploadedImages.set(id, uploadedImage);
    return uploadedImage;
  }
  
  async getUserUploads(userId: number): Promise<UploadedImage[]> {
    const allUploads = Array.from(this.uploadedImages.values());
    const userUploads = allUploads.filter(upload => upload.userId === userId);
    
    // Sort by createdAt in descending order
    return userUploads.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  
  async getUploadedImage(id: number): Promise<UploadedImage | undefined> {
    return this.uploadedImages.get(id);
  }
}

export const storage = new MemStorage();
