const express = require("express");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Define your storage
const {
  sendMessage,
  getMessages,
  uploadFile,
} = require("../controllers/chatController");
const { authenticateJWT } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat related endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the message
 *         room:
 *           type: string
 *           description: The ID of the chat room
 *         message:
 *           type: string
 *           description: The content of the message
 *         sender:
 *           type: string
 *           description: The ID of the user who sent the message
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Time when the message was sent
 *     UploadResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Status message indicating success
 *         filePath:
 *           type: string
 *           description: The path where the uploaded file is stored
 */

/**
 * @swagger
 * /api/chat/messages:
 *   post:
 *     tags: [Chat]
 *     summary: Send a message
 *     description: Sends a message to a specified chat room. The message must include the room ID and the message content.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room
 *               - message
 *             properties:
 *               room:
 *                 type: string
 *                 example: "12345"
 *               message:
 *                 type: string
 *                 example: "Hello, everyone!"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized, invalid or missing JWT token
 *       500:
 *         description: Internal server error
 */
router.post("/messages", authenticateJWT, sendMessage);

/**
 * @swagger
 * /api/chat/messages:
 *   get:
 *     tags: [Chat]
 *     summary: Get messages from a chat room
 *     description: Retrieves messages from a specified chat room. Requires the room ID as a query parameter.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: room
 *         required: true
 *         schema:
 *           type: string
 *           example: "12345"
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized, invalid or missing JWT token
 *       404:
 *         description: Room not found, invalid room ID provided
 *       500:
 *         description: Internal server error
 */
router.get("/messages", authenticateJWT, getMessages);

/**
 * @swagger
 * /api/chat/upload:
 *   post:
 *     tags: [Chat]
 *     summary: Upload a file
 *     description: Allows users to upload a file to a specified chat room. The file and room ID must be included in the request.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - room
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               room:
 *                 type: string
 *                 example: "12345"
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized, invalid or missing JWT token
 *       500:
 *         description: Internal server error
 */
router.post("/upload", authenticateJWT, uploadFile);

module.exports = router;
