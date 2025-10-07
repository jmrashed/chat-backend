const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../src/app");
const User = require("../src/models/User");
const ChatRoom = require("../src/models/ChatRoom");
const Message = require("../src/models/Message");

let authToken;
let userId;
let roomId;

beforeAll(async () => {
  const mongoUri = "mongodb://localhost:27017/chat-app-test";
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
  await ChatRoom.deleteMany({});
  await Message.deleteMany({});

  // Create test user and get auth token
  const testUser = {
    username: "chatTestUser",
    email: "chattest@example.com",
    password: "testPassword123",
  };

  const signupResponse = await request(app)
    .post("/api/auth/signup")
    .send(testUser);

  authToken = signupResponse.body.data.accessToken;
  userId = signupResponse.body.data.id;
});

describe("Chat Room Management", () => {
  it("should create a new chat room", async () => {
    const roomData = {
      name: "Test Room",
      description: "A test chat room",
    };

    const response = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${authToken}`)
      .send(roomData);

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("name", "Test Room");
    roomId = response.body.data._id;
  });

  it("should get all chat rooms", async () => {
    // Create a room first
    await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Test Room", description: "Test" });

    const response = await request(app).get("/api/rooms");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("should get specific room details", async () => {
    // Create a room first
    const roomResponse = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Test Room", description: "Test" });

    const roomId = roomResponse.body.data._id;

    const response = await request(app).get(`/api/rooms/${roomId}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("name", "Test Room");
  });
});

describe("Chat Messaging", () => {
  beforeEach(async () => {
    // Create a room for messaging tests
    const roomResponse = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Message Test Room", description: "Test" });

    roomId = roomResponse.body.data._id;
  });

  it("should send a message to a chat room", async () => {
    const messageData = {
      roomId: roomId,
      content: "Hello, this is a test message!",
    };

    const response = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${authToken}`)
      .send(messageData);

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("content", "Hello, this is a test message!");
    expect(response.body.data).toHaveProperty("sender", userId);
  });

  it("should get messages for a specific room", async () => {
    // Send a message first
    await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        roomId: roomId,
        content: "Test message for retrieval",
      });

    const response = await request(app).get(`/api/messages/${roomId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty("content", "Test message for retrieval");
  });

  it("should require authentication to send messages", async () => {
    const messageData = {
      roomId: roomId,
      content: "Unauthorized message",
    };

    const response = await request(app)
      .post("/api/messages")
      .send(messageData);

    expect(response.status).toBe(401);
  });

  it("should validate message content", async () => {
    const messageData = {
      roomId: roomId,
      content: "", // Empty content should fail validation
    };

    const response = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${authToken}`)
      .send(messageData);

    expect(response.status).toBe(400);
  });
});