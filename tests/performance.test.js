const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../src/app");
const User = require("../src/models/User");
const { ChatRoom } = require("../src/models/ChatRoom");
const Message = require("../src/models/Message");

let authTokens = [];
let roomId;

beforeAll(async () => {
  const mongoUri = "mongodb://localhost:27017/chat-app-test";
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}, 30000);

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
  await ChatRoom.deleteMany({});
  await Message.deleteMany({});
  authTokens = [];
}, 30000);

describe("Performance Tests", () => {
  const createMultipleUsers = async (count) => {
    const userPromises = [];
    for (let i = 0; i < count; i++) {
      userPromises.push(
        request(app)
          .post("/api/auth/signup")
          .send({
            username: `perfUser${i}`,
            email: `perfuser${i}@example.com`,
            password: "password123",
          })
      );
    }
    
    const responses = await Promise.all(userPromises);
    return responses.map(response => response.body.data.accessToken);
  };

  it("should handle concurrent user registrations", async () => {
    const startTime = Date.now();
    const userCount = 50;
    
    const tokens = await createMultipleUsers(userCount);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(tokens.length).toBe(userCount);
    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    
    console.log(`Created ${userCount} users in ${duration}ms`);
  }, 15000);

  it("should handle high message throughput", async () => {
    // Create users and room
    authTokens = await createMultipleUsers(10);
    
    const roomResponse = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${authTokens[0]}`)
      .send({
        name: "Performance Test Room",
        description: "Testing message throughput",
      });
    
    roomId = roomResponse.body.data._id;
    
    const startTime = Date.now();
    const messageCount = 100;
    
    // Send messages concurrently
    const messagePromises = [];
    for (let i = 0; i < messageCount; i++) {
      const tokenIndex = i % authTokens.length;
      messagePromises.push(
        request(app)
          .post("/api/messages")
          .set("Authorization", `Bearer ${authTokens[tokenIndex]}`)
          .send({
            roomId: roomId,
            content: `Performance test message ${i}`,
          })
      );
    }
    
    const responses = await Promise.all(messagePromises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const successfulMessages = responses.filter(r => r.status === 201).length;
    expect(successfulMessages).toBe(messageCount);
    expect(duration).toBeLessThan(15000); // Should complete within 15 seconds
    
    console.log(`Sent ${messageCount} messages in ${duration}ms (${(messageCount/duration*1000).toFixed(2)} msg/sec)`);
  }, 20000);

  it("should handle large message retrieval efficiently", async () => {
    // Create users and room
    authTokens = await createMultipleUsers(5);
    
    const roomResponse = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${authTokens[0]}`)
      .send({
        name: "Large Message Room",
        description: "Testing large message retrieval",
      });
    
    roomId = roomResponse.body.data._id;
    
    // Create many messages
    const messageCount = 200;
    const messagePromises = [];
    for (let i = 0; i < messageCount; i++) {
      const tokenIndex = i % authTokens.length;
      messagePromises.push(
        request(app)
          .post("/api/messages")
          .set("Authorization", `Bearer ${authTokens[tokenIndex]}`)
          .send({
            roomId: roomId,
            content: `Message ${i}`,
          })
      );
    }
    
    await Promise.all(messagePromises);
    
    // Test retrieval performance
    const startTime = Date.now();
    const response = await request(app).get(`/api/messages/${roomId}`);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(messageCount);
    expect(duration).toBeLessThan(2000); // Should retrieve within 2 seconds
    
    console.log(`Retrieved ${messageCount} messages in ${duration}ms`);
  }, 25000);

  it("should handle concurrent room operations", async () => {
    authTokens = await createMultipleUsers(20);
    
    const startTime = Date.now();
    const roomCount = 50;
    
    // Create rooms concurrently
    const roomPromises = [];
    for (let i = 0; i < roomCount; i++) {
      const tokenIndex = i % authTokens.length;
      roomPromises.push(
        request(app)
          .post("/api/rooms")
          .set("Authorization", `Bearer ${authTokens[tokenIndex]}`)
          .send({
            name: `Performance Room ${i}`,
            description: `Room ${i} for performance testing`,
          })
      );
    }
    
    const responses = await Promise.all(roomPromises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const successfulRooms = responses.filter(r => r.status === 201).length;
    expect(successfulRooms).toBe(roomCount);
    expect(duration).toBeLessThan(8000); // Should complete within 8 seconds
    
    console.log(`Created ${roomCount} rooms in ${duration}ms`);
  }, 15000);

  it("should maintain performance under load", async () => {
    authTokens = await createMultipleUsers(10);
    
    // Create room
    const roomResponse = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${authTokens[0]}`)
      .send({
        name: "Load Test Room",
        description: "Testing under load",
      });
    
    roomId = roomResponse.body.data._id;
    
    // Simulate mixed operations under load
    const operations = [];
    
    // Add message sending operations
    for (let i = 0; i < 30; i++) {
      const tokenIndex = i % authTokens.length;
      operations.push(
        request(app)
          .post("/api/messages")
          .set("Authorization", `Bearer ${authTokens[tokenIndex]}`)
          .send({
            roomId: roomId,
            content: `Load test message ${i}`,
          })
      );
    }
    
    // Add room retrieval operations
    for (let i = 0; i < 10; i++) {
      operations.push(
        request(app).get(`/api/rooms/${roomId}`)
      );
    }
    
    // Add message retrieval operations
    for (let i = 0; i < 10; i++) {
      operations.push(
        request(app).get(`/api/messages/${roomId}`)
      );
    }
    
    const startTime = Date.now();
    const responses = await Promise.all(operations);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const successfulOps = responses.filter(r => r.status < 400).length;
    expect(successfulOps).toBeGreaterThan(45); // At least 90% success rate
    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    
    console.log(`Completed ${operations.length} mixed operations in ${duration}ms (${successfulOps} successful)`);
  }, 15000);
});