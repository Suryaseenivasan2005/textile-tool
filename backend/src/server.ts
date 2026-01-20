import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import app from './app';
import { connectDB } from './config/database';

const PORT = parseInt(process.env.PORT || '3000', 10);

// Validate critical environment variables
const validateEnvironment = (): void => {
    console.log('🔍 Validating environment variables...');

    const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
    const missingVars: string[] = [];

    requiredVars.forEach(varName => {
        const exists = !!process.env[varName];
        console.log(`  ${varName}: ${exists ? '✅ Set' : '❌ Missing'}`);
        if (!exists) {
            missingVars.push(varName);
        }
    });

    if (missingVars.length > 0) {
        console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
        console.error('Please check your .env file and ensure all required variables are set.');
        process.exit(1);
    }

    console.log('✅ All required environment variables are set');
};

// Global unhandled rejection handler
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('🚨 UNHANDLED REJECTION:', reason);
    console.error('Promise:', promise);
    // Don't exit in production, just log
    if (process.env.NODE_ENV === 'development') {
        process.exit(1);
    }
});

// Global uncaught exception handler
process.on('uncaughtException', (error: Error) => {
    console.error('🚨 UNCAUGHT EXCEPTION:', error);
    console.error('Stack:', error.stack);
    // Exit on uncaught exceptions as the app state may be corrupted
    process.exit(1);
});

// Start server
const startServer = async () => {
    try {
        console.log('🚀 Starting Tex-Tool Backend Server...');
        console.log(`📦 Node Environment: ${process.env.NODE_ENV || 'development'}`);

        // Validate environment
        validateEnvironment();

        // Connect to database
        await connectDB();

        // Start listening
        app.listen(PORT, '0.0.0.0', () => {
            console.log('✅ Server started successfully!');
            console.log(`🌐 Server is running on port ${PORT}`);
            console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        process.exit(1);
    }
};

startServer();
