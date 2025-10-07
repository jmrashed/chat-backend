const mongoose = require('mongoose');
require('dotenv').config();

describe('Database Connection', () => {
    beforeAll(async () => {
        // Close any existing connections
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    }, 30000);

    afterAll(async () => {
        // Close database connection after tests
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    }, 30000);

    test('should connect to MongoDB Atlas successfully', async () => {
        const mongoUri = process.env.MONGODB_URI;
        
        expect(mongoUri).toBeDefined();
        expect(mongoUri).toContain('mongodb+srv://');
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000
        });
        
        expect(mongoose.connection.readyState).toBe(1); // 1 = connected
        expect(mongoose.connection.name).toBe('chat-app');
    }, 15000);

    test('should handle database operations', async () => {
        // Ensure connection exists before testing operations
        if (mongoose.connection.readyState !== 1) {
            const mongoUri = process.env.MONGODB_URI;
            await mongoose.connect(mongoUri);
        }
        
        // Simple ping test to verify database is responsive
        const admin = mongoose.connection.db.admin();
        const result = await admin.ping();
        
        expect(result.ok).toBe(1);
    }, 10000);
});