const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../src/app");
const User = require("../src/models/User");
const { ChatRoom } = require("../src/models/ChatRoom");

let authToken;
let userId;

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

  const testUser = {
    username: "roomTestUser",
    email: "roomtest@example.com",
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
    expect(response.body.data).toHaveProperty("description", "A test chat room");
  });

  it("should not create room with duplicate name", async () => {
    const roomData = {
      name: "Duplicate Room",
      description: "First room",
    };

    await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${authToken}`)
      .send(roomData);

    const response = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${authToken}`)
      .send(roomData);

    expect(response.status).toBe(400);
  });

  it("should require authentication to create room", async () => {
    const roomData = {
      name: "Unauthorized Room",
      description: "Should fail",
    };

    const response = await request(app)
      .post("/api/rooms")
      .send(roomData);

    expect(response.status).toBe(401);
  });

  it("should validate room name is required", async () => {
    const roomData = {
      description: "Room without name",
    };

    const response = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${authToken}`)
      .send(roomData);

    expect(response.status).toBe(400);
  });

  it("should get all chat rooms", async () => {
    await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Room 1", description: "First room" });

    await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Room 2", description: "Second room" });

    const response = await request(app).get("/api/rooms");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(2);
  });

  it("should get specific room by ID", async () => {
    const roomResponse = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Specific Room", description: "Test room" });

    const roomId = roomResponse.body.data._id;

    const response = await request(app).get(`/api/rooms/${roomId}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("name", "Specific Room");
  });

  it("should return 404 for non-existent room", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request(app).get(`/api/rooms/${fakeId}`);

    expect(response.status).toBe(404);
  });
});