import app from './app';
import { connectDB } from './config/database';

const PORT = parseInt(process.env.PORT || '3000', 10);

// Start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📝 API endpoints available at /:${PORT}/api`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
