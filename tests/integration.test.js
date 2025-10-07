const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../src/app");
const User = require("../src/models/User");
const { ChatRoom } = require("../src/models/ChatRoom");
const Message = require("../src/models/Message");

let user1Token, user2Token;
let user1Id, user2Id;
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

  // Create two test users
  const user1Response = await request(app)
    .post("/api/auth/signup")
    .send({
      username: "user1",
      email: "user1@example.com",
      password: "password123",
    });

  const user2Response = await request(app)
    .post("/api/auth/signup")
    .send({
      username: "user2",
      email: "user2@example.com",
      password: "password123",
    });

  user1Token = user1Response.body.data.accessToken;
  user2Token = user2Response.body.data.accessToken;
  user1Id = user1Response.body.data.id;
  user2Id = user2Response.body.data.id;
});

describe("Integration Tests - Full API Flows", () => {
  it("should complete full chat flow: signup -> create room -> send messages -> retrieve messages", async () => {
    // Create a chat room
    const roomResponse = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        name: "Integration Test Room",
        description: "Testing full flow",
      });

    expect(roomResponse.status).toBe(201);
    roomId = roomResponse.body.data._id;

    // User 1 sends a message
    const message1Response = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        roomId: roomId,
        content: "Hello from user 1!",
      });

    expect(message1Response.status).toBe(201);

    // User 2 sends a message
    const message2Response = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${user2Token}`)
      .send({
        roomId: roomId,
        content: "Hello from user 2!",
      });

    expect(message2Response.status).toBe(201);

    // Retrieve all messages
    const messagesResponse = await request(app).get(`/api/messages/${roomId}`);

    expect(messagesResponse.status).toBe(200);
    expect(messagesResponse.body.data.length).toBe(2);
    expect(messagesResponse.body.data[0].content).toBe("Hello from user 1!");
    expect(messagesResponse.body.data[1].content).toBe("Hello from user 2!");
  });

  it("should handle concurrent user operations", async () => {
    // Create room
    const roomResponse = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        name: "Concurrent Test Room",
        description: "Testing concurrent operations",
      });

    roomId = roomResponse.body.data._id;

    // Send multiple messages concurrently
    const messagePromises = [];
    for (let i = 0; i < 5; i++) {
      messagePromises.push(
        request(app)
          .post("/api/messages")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({
            roomId: roomId,
            content: `Concurrent message ${i}`,
          })
      );
    }

    const responses = await Promise.all(messagePromises);
    responses.forEach((response) => {
      expect(response.status).toBe(201);
    });

    // Verify all messages were saved
    const messagesResponse = await request(app).get(`/api/messages/${roomId}`);
    expect(messagesResponse.body.data.length).toBe(5);
  });

  it("should maintain data consistency across operations", async () => {
    // Create room
    const roomResponse = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        name: "Consistency Test Room",
        description: "Testing data consistency",
      });

    roomId = roomResponse.body.data._id;

    // Send message
    await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        roomId: roomId,
        content: "Test message for consistency",
      });

    // Verify room exists in database
    const room = await ChatRoom.findById(roomId);
    expect(room).toBeTruthy();
    expect(room.name).toBe("Consistency Test Room");

    // Verify message exists in database
    const messages = await Message.find({ room: roomId });
    expect(messages.length).toBe(1);
    expect(messages[0].content).toBe("Test message for consistency");
    expect(messages[0].sender.toString()).toBe(user1Id);
  });

  it("should handle authentication flow properly", async () => {
    // Test login with existing user
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "user1@example.com",
        password: "password123",
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.data).toHaveProperty("accessToken");

    // Use new token for authenticated request
    const newToken = loginResponse.body.data.accessToken;
    const roomResponse = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${newToken}`)
      .send({
        name: "Auth Test Room",
        description: "Testing authentication flow",
      });

    expect(roomResponse.status).toBe(201);
  });

  it("should handle error scenarios gracefully", async () => {
    // Try to send message to non-existent room
    const fakeRoomId = new mongoose.Types.ObjectId();
    const messageResponse = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        roomId: fakeRoomId,
        content: "Message to fake room",
      });

    expect(messageResponse.status).toBe(404);

    // Try to access protected route without token
    const unauthorizedResponse = await request(app)
      .post("/api/rooms")
      .send({
        name: "Unauthorized Room",
        description: "Should fail",
      });

    expect(unauthorizedResponse.status).toBe(401);

    // Try to create room with invalid data
    const invalidRoomResponse = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        description: "Room without name",
      });

    expect(invalidRoomResponse.status).toBe(400);
  });
});