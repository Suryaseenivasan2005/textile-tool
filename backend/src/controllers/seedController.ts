import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDB } from '../config/database';
import { DB_CONFIG } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';

/**
 * Admin Seeding Controller
 * 
 * SECURITY NOTE: This endpoint should be protected or disabled in production
 * after initial setup. Consider using environment variables to control access.
 */

export const seedAdminUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Security check: Only allow in development or with special key
    const seedKey = process.env.SEED_KEY;
    const providedKey = req.headers['x-seed-key'] || req.query.key;

    if (process.env.NODE_ENV === 'production' && seedKey !== providedKey) {
        res.status(403).json({
            error: 'Forbidden',
            message: 'Seeding is disabled in production without proper authorization'
        });
        return;
    }

    try {
        const db = getDB();
        const usersCollection = db.collection(DB_CONFIG.COLLECTIONS.USERS);

        // Default admin credentials
        const mobile = '9688257055';
        const password = 'Karthick@135';
        const name = 'Admin User';

        // Check if any users exist
        const userCount = await usersCollection.countDocuments();

        if (userCount > 0) {
            res.status(400).json({
                error: 'Database already seeded',
                message: `Database already contains ${userCount} user(s). Use the update endpoint to modify existing users.`,
                userCount
            });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin user
        const result = await usersCollection.insertOne({
            mobile,
            password: hashedPassword,
            name,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log('✅ Admin user seeded successfully');
        console.log(`   Mobile: ${mobile}`);
        console.log(`   User ID: ${result.insertedId}`);

        res.status(201).json({
            message: 'Admin user created successfully',
            user: {
                id: result.insertedId.toString(),
                mobile,
                name,
            },
            warning: 'Please change the default password after first login'
        });
    } catch (error) {
        console.error('❌ Error seeding admin user:', error);
        throw error;
    }
});

export const checkSeedStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const db = getDB();
        const usersCollection = db.collection(DB_CONFIG.COLLECTIONS.USERS);

        const userCount = await usersCollection.countDocuments();
        const needsSeeding = userCount === 0;

        res.json({
            needsSeeding,
            userCount,
            message: needsSeeding
                ? 'Database is empty and needs seeding'
                : `Database contains ${userCount} user(s)`,
        });
    } catch (error) {
        console.error('❌ Error checking seed status:', error);
        throw error;
    }
});
