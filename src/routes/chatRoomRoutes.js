const express = require("express");
const {
  createChatRoom,
  getChatRooms,
  getChatRoomDetails,
} = require("../controllers/chatRoomController");
const { authenticateJWT } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat Rooms
 *   description: Chat room management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatRoom:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the chat room
 *         name:
 *           type: string
 *           description: Name of the chat room
 *         description:
 *           type: string
 *           description: Description of the chat room
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the chat room was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the chat room was last updated
 */

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     tags: [Chat Rooms]
 *     summary: Create a new chat room
 *     description: Creates a new chat room with a specified name and description.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: General Chat
 *               description:
 *                 type: string
 *                 example: A chat room for general discussions
 *     responses:
 *       201:
 *         description: Chat room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatRoom'
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized, invalid or missing JWT token
 *       500:
 *         description: Internal server error
 */
router.post("/", authenticateJWT, createChatRoom);

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     tags: [Chat Rooms]
 *     summary: Retrieve a list of all available chat rooms
 *     description: Fetches a list of all chat rooms that the user has access to.
 *     responses:
 *       200:
 *         description: A list of chat rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatRoom'
 *       500:
 *         description: Internal server error
 */
router.get("/", getChatRooms);

/**
 * @swagger
 * /api/rooms/{roomId}:
 *   get:
 *     tags: [Chat Rooms]
 *     summary: Get details of a specific chat room
 *     description: Retrieves detailed information about a specific chat room identified by its ID.
 *     parameters:
 *       - name: roomId
 *         in: path
 *         required: true
 *         description: The unique ID of the chat room
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat room details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatRoom'
 *       404:
 *         description: Chat room not found
 *       500:
 *         description: Internal server error
 */
router.get("/:roomId", getChatRoomDetails);

module.exports = router;
