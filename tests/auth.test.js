const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../src/app"); // Import your Express app
const User = require("../src/models/User"); // User model

// Database connection setup for tests
beforeAll(async () => {
  const mongoUri = "mongodb://localhost:27017/chat-app-test"; // Use a test database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Authentication Routes", () => {
  const testUser = {
    username: "testUser",
    email: "test@example.com",
    password: "testPassword",
  };

  // Clean up the database before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("should create a new user on signup", async () => {
    const response = await request(app).post("/api/auth/signup").send(testUser);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
  });

  it("should log in an existing user", async () => {
    // First, we need to sign up the user
    await request(app).post("/api/auth/signup").send(testUser);

    // Now attempt to log in
    const response = await request(app).post("/api/auth/login").send(testUser);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should return error for invalid login credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "wrong@example.com",
      password: "wrongPassword",
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid credentials");
  });

  it("should return error if email is already taken", async () => {
    // Sign up a user
    await request(app).post("/api/auth/signup").send(testUser);

    // Attempt to sign up with the same email again
    const response = await request(app).post("/api/auth/signup").send(testUser);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email already registered.");
  });
});
