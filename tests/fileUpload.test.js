const request = require("supertest");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const { app } = require("../src/app");
const User = require("../src/models/User");
const File = require("../src/models/File");

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
  await File.deleteMany({});

  const testUser = {
    username: "fileTestUser",
    email: "filetest@example.com",
    password: "testPassword123",
  };

  const signupResponse = await request(app)
    .post("/api/auth/signup")
    .send(testUser);

  authToken = signupResponse.body.data.accessToken;
  userId = signupResponse.body.data.id;
});

describe("File Upload Operations", () => {
  const createTestFile = (filename, content = "test content") => {
    const testFilePath = path.join(__dirname, filename);
    fs.writeFileSync(testFilePath, content);
    return testFilePath;
  };

  const cleanupTestFile = (filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  };

  it("should upload a text file successfully", async () => {
    const testFilePath = createTestFile("test.txt");

    const response = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("file", testFilePath);

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("filename");
    expect(response.body.data).toHaveProperty("originalName", "test.txt");
    expect(response.body.data).toHaveProperty("uploadedBy", userId);

    cleanupTestFile(testFilePath);
  });

  it("should require authentication for file upload", async () => {
    const testFilePath = createTestFile("test.txt");

    const response = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath);

    expect(response.status).toBe(401);

    cleanupTestFile(testFilePath);
  });

  it("should reject upload without file", async () => {
    const response = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(400);
  });

  it("should reject files exceeding size limit", async () => {
    const largeContent = "a".repeat(11 * 1024 * 1024); // 11MB
    const testFilePath = createTestFile("large.txt", largeContent);

    const response = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("file", testFilePath);

    expect(response.status).toBe(400);

    cleanupTestFile(testFilePath);
  });

  it("should get list of uploaded files", async () => {
    const testFilePath1 = createTestFile("test1.txt");
    const testFilePath2 = createTestFile("test2.txt");

    await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("file", testFilePath1);

    await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("file", testFilePath2);

    const response = await request(app)
      .get("/api/files")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(2);

    cleanupTestFile(testFilePath1);
    cleanupTestFile(testFilePath2);
  });

  it("should download a file by ID", async () => {
    const testFilePath = createTestFile("download-test.txt", "download content");

    const uploadResponse = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("file", testFilePath);

    const fileId = uploadResponse.body.data._id;

    const response = await request(app)
      .get(`/api/files/${fileId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);

    cleanupTestFile(testFilePath);
  });

  it("should return 404 for non-existent file", async () => {
    const fakeFileId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/files/${fakeFileId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(404);
  });

  it("should validate file type restrictions", async () => {
    const testFilePath = createTestFile("test.exe", "executable content");

    const response = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("file", testFilePath);

    expect(response.status).toBe(400);

    cleanupTestFile(testFilePath);
  });
});