import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database';
import { generateToken } from '../utils/jwt';
import { DB_CONFIG } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';
import { registerSchema, loginSchema } from '../validators/authValidators';

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { mobile, password, name } = validatedData;

    const db = getDB();
    const usersCollection = db.collection(DB_CONFIG.COLLECTIONS.USERS);

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ mobile });
    if (existingUser) {
      res.status(400).json({ error: 'User with this mobile number already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await usersCollection.insertOne({
      mobile,
      password: hashedPassword,
      name: name || 'Admin User',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate token
    const token = generateToken({
      userId: result.insertedId.toString(),
      mobile,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.insertedId.toString(),
        mobile,
        name: name || 'Admin User',
        createdAt: new Date(),
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    throw error;
  }
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { mobile, password } = validatedData;

    const db = getDB();
    const usersCollection = db.collection(DB_CONFIG.COLLECTIONS.USERS);

    // Find user
    const user = await usersCollection.findOne({ mobile });
    if (!user) {
      res.status(401).json({ error: 'Invalid mobile number or password' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid mobile number or password' });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      mobile: user.mobile,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        mobile: user.mobile,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    throw error;
  }
});

export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const db = getDB();
    const usersCollection = db.collection(DB_CONFIG.COLLECTIONS.USERS);

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id.toString(),
        mobile: user.mobile,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    throw error;
  }
});
