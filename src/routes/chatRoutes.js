const express = require("express");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Define your storage
const {
  sendMessage,
  getMessages,
  uploadFile,
  addReaction,
  removeReaction,
  editMessage,
  deleteMessage,
  markAsRead,
  searchMessages,
  pinMessage,
  addFavorite,
  removeFavorite,
  getFavorites
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
// Message CRUD operations
router.post("/messages", authenticateJWT, sendMessage);
router.get("/messages/:room", authenticateJWT, getMessages);
router.put("/messages/:id", authenticateJWT, editMessage);
router.delete("/messages/:id", authenticateJWT, deleteMessage);

// Message reactions
router.post("/messages/:id/react", authenticateJWT, addReaction);
router.delete("/messages/:id/react/:reactionId", authenticateJWT, removeReaction);

// Message status
router.put("/messages/:id/read", authenticateJWT, markAsRead);

// Message search
router.get("/messages/search", authenticateJWT, searchMessages);

// Message pinning
router.put("/messages/:id/pin", authenticateJWT, pinMessage);

// Favorites
router.post("/favorites", authenticateJWT, addFavorite);
router.delete("/favorites/:messageId", authenticateJWT, removeFavorite);
router.get("/favorites", authenticateJWT, getFavorites);

// File upload
router.post("/upload", authenticateJWT, upload.single('file'), uploadFile);

module.exports = router;
