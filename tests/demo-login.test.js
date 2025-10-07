const axios = require('axios');

// Test login functionality by making HTTP requests to running server
describe('Demo Login Test - Live Server', () => {
    const baseURL = 'http://localhost:3020';

    test('should login successfully with demo user credentials', async () => {
        const loginData = {
            email: 'user1@example.com',
            password: 'password1'
        };

        try {
            const response = await axios.post(`${baseURL}/api/auth/login`, loginData);
            
            console.log('Login Response Status:', response.status);
            console.log('Login Response Data:', response.data);

            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('status', 'success');
            expect(response.data.data).toHaveProperty('accessToken');
            expect(response.data.data).toHaveProperty('email', 'user1@example.com');
            expect(response.data.data).toHaveProperty('username', 'user1');
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            throw error;
        }
    });

    test('should test multiple demo users', async () => {
        const users = [
            { email: 'user2@example.com', password: 'password2' },
            { email: 'user3@example.com', password: 'password3' }
        ];

        for (const user of users) {
            try {
                const response = await axios.post(`${baseURL}/api/auth/login`, user);
                
                console.log(`Testing ${user.email} - Status:`, response.status);
                expect(response.status).toBe(200);
                expect(response.data.data.email).toBe(user.email);
            } catch (error) {
                console.error(`Login failed for ${user.email}:`, error.response?.data || error.message);
                throw error;
            }
        }
    });

    test('should fail with wrong credentials', async () => {
        const loginData = {
            email: 'user1@example.com',
            password: 'wrongpassword'
        };

        try {
            await axios.post(`${baseURL}/api/auth/login`, loginData);
            // If we reach here, the test should fail
            expect(true).toBe(false);
        } catch (error) {
            console.log('Expected error for wrong password:', error.response?.status);
            expect(error.response?.status).toBe(401);
        }
    });
});