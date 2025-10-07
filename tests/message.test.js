const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../src/app");
const User = require("../src/models/User");
const { ChatRoom } = require("../src/models/ChatRoom");
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

  const testUser = {
    username: "messageTestUser",
    email: "messagetest@example.com",
    password: "testPassword123",
  };

  const signupResponse = await request(app)
    .post("/api/auth/signup")
    .send(testUser);

  authToken = signupResponse.body.data.accessToken;
  userId = signupResponse.body.data.id;

  const roomResponse = await request(app)
    .post("/api/rooms")
    .set("Authorization", `Bearer ${authToken}`)
    .send({ name: "Test Room", description: "Test" });

  roomId = roomResponse.body.data._id;
});

describe("Message Operations", () => {
  it("should send a message to a room", async () => {
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
    expect(response.body.data).toHaveProperty("room", roomId);
  });

  it("should require authentication to send message", async () => {
    const messageData = {
      roomId: roomId,
      content: "Unauthorized message",
    };

    const response = await request(app)
      .post("/api/messages")
      .send(messageData);

    expect(response.status).toBe(401);
  });

  it("should validate message content is required", async () => {
    const messageData = {
      roomId: roomId,
      content: "",
    };

    const response = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${authToken}`)
      .send(messageData);

    expect(response.status).toBe(400);
  });

  it("should validate roomId is required", async () => {
    const messageData = {
      content: "Message without room",
    };

    const response = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${authToken}`)
      .send(messageData);

    expect(response.status).toBe(400);
  });

  it("should not send message to non-existent room", async () => {
    const fakeRoomId = new mongoose.Types.ObjectId();
    const messageData = {
      roomId: fakeRoomId,
      content: "Message to fake room",
    };

    const response = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${authToken}`)
      .send(messageData);

    expect(response.status).toBe(404);
  });

  it("should get messages for a room", async () => {
    await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ roomId: roomId, content: "First message" });

    await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ roomId: roomId, content: "Second message" });

    const response = await request(app).get(`/api/messages/${roomId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(2);
  });

  it("should return empty array for room with no messages", async () => {
    const response = await request(app).get(`/api/messages/${roomId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(0);
  });

  it("should return 404 for messages of non-existent room", async () => {
    const fakeRoomId = new mongoose.Types.ObjectId();
    const response = await request(app).get(`/api/messages/${fakeRoomId}`);

    expect(response.status).toBe(404);
  });

  it("should validate message content length", async () => {
    const longContent = "a".repeat(1001); // Assuming 1000 char limit
    const messageData = {
      roomId: roomId,
      content: longContent,
    };

    const response = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${authToken}`)
      .send(messageData);

    expect(response.status).toBe(400);
  });
});