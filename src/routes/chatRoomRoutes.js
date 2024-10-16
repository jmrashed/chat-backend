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
 * /api/rooms:
 *   post:
 *     tags: [Chat Rooms]
 *     summary: Create a new chat room
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chat room created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticateJWT, createChatRoom);

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     tags: [Chat Rooms]
 *     summary: Retrieve a list of all available chat rooms
 *     responses:
 *       200:
 *         description: A list of chat rooms
 */
router.get("/", getChatRooms);

/**
 * @swagger
 * /api/rooms/{roomId}:
 *   get:
 *     tags: [Chat Rooms]
 *     summary: Get details of a specific chat room
 *     parameters:
 *       - name: roomId
 *         in: path
 *         required: true
 *         description: The ID of the chat room
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat room details retrieved successfully
 *       404:
 *         description: Chat room not found
 */
router.get("/:roomId", getChatRoomDetails);

module.exports = router;
