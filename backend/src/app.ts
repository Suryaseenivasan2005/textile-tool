import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import vendorRoutes from './routes/vendorRoutes';
import customerRoutes from './routes/customerRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import colorRoutes from './routes/colorRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import saleRoutes from './routes/saleRoutes';
import returnRoutes from './routes/returnRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import paymentRoutes from './routes/paymentRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import settingsRoutes from './routes/settingsRoutes';
import seedRoutes from './routes/seedRoutes';
import demoRoutes from './routes/demoRoutes';
import { demoMiddleware } from './middleware/demoMiddleware';
import { errorHandler } from './middleware/errorHandler';
import { getDB } from './config/database';
import { DB_CONFIG } from './constants';

const app = express();

// CORS Configuration
// In production, restrict to your frontend domain for security
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [
            'https://textile-tool.vercel.app', // Add your actual Vercel domain
            /\.vercel\.app$/, // Allow all Vercel preview deployments
        ]
        : '*', // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

console.log('🔐 CORS Configuration:', {
    environment: process.env.NODE_ENV || 'development',
    origin: corsOptions.origin,
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (for debugging production issues)
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);

    // Log body for non-GET requests (sanitize sensitive data)
    if (req.method !== 'GET' && req.body) {
        const sanitizedBody = { ...req.body };
        // Remove password from logs
        if (sanitizedBody.password) {
            sanitizedBody.password = '[REDACTED]';
        }
        console.log(`  Body:`, JSON.stringify(sanitizedBody));
    }

    next();
});

// Basic routes
app.get('/', (req, res) => {
    res.send('Backend running');
});

app.get('/favicon.ico', (req, res) => res.status(204));

// Enhanced Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const db = getDB();
        const usersCollection = db.collection(DB_CONFIG.COLLECTIONS.USERS);
        const userCount = await usersCollection.countDocuments();

        res.json({
            status: 'ok',
            message: 'Server is running',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            database: {
                connected: true,
                name: DB_CONFIG.DATABASE_NAME,
                userCount,
                needsSeeding: userCount === 0
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'Database connection failed',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            database: {
                connected: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        });
    }
});

// Routes
app.use('/api/demo', demoRoutes);
app.use('/api', demoMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/seed', seedRoutes); // Database seeding endpoints
app.use('/api/vendors', vendorRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);


// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
