const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
require('dotenv').config();

// Mock app for testing
let app;

describe('Login Functionality Tests', () => {
    beforeAll(async () => {
        // Import app after environment is loaded
        app = require('../src/app');
        
        // Connect to test database
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        // Create test user if doesn't exist
        const existingUser = await User.findOne({ email: 'user1@example.com' });
        if (!existingUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password1', salt);
            
            const testUser = new User({
                username: 'user1',
                email: 'user1@example.com',
                password: hashedPassword
            });
            await testUser.save();
        }
    }, 30000);

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('POST /api/auth/login', () => {
        test('should login successfully with correct credentials', async () => {
            const loginData = {
                email: 'user1@example.com',
                password: 'password1'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body).toHaveProperty('status', 'success');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data.user).toHaveProperty('email', 'user1@example.com');
            expect(response.body.data.user).toHaveProperty('username', 'user1');
            expect(response.body.data.user).not.toHaveProperty('password');
        });

        test('should fail with incorrect password', async () => {
            const loginData = {
                email: 'user1@example.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body).toHaveProperty('message');
        });

        test('should fail with non-existent email', async () => {
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'password1'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body).toHaveProperty('message');
        });

        test('should fail with missing email', async () => {
            const loginData = {
                password: 'password1'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(400);

            expect(response.body).toHaveProperty('status', 'error');
        });

        test('should fail with missing password', async () => {
            const loginData = {
                email: 'user1@example.com'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(400);

            expect(response.body).toHaveProperty('status', 'error');
        });

        test('should fail with invalid email format', async () => {
            const loginData = {
                email: 'invalid-email',
                password: 'password1'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(400);

            expect(response.body).toHaveProperty('status', 'error');
        });
    });

    describe('Frontend-Backend Integration', () => {
        test('should verify backend is running on correct port', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            // If health endpoint doesn't exist, test a basic route
            if (response.status === 404) {
                await request(app)
                    .get('/')
                    .expect(200);
            }
        });

        test('should handle CORS for frontend requests', async () => {
            const response = await request(app)
                .options('/api/auth/login')
                .set('Origin', 'http://localhost:3000')
                .set('Access-Control-Request-Method', 'POST')
                .set('Access-Control-Request-Headers', 'Content-Type');

            expect(response.headers['access-control-allow-origin']).toBeDefined();
        });
    });
});