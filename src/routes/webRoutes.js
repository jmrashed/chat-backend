// routes/webRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const router = express.Router();
const { authenticateJWT } = require("../middleware/authMiddleware");
 

// Render the homepage where users can sign up or log in
app.get('/', (req, res) => {
    res.render('index', { title: 'Home', body: '<h2>Welcome to real time chat</h2>' });
});

router.get('/login', (req, res) => {
    res.render('login', { body: res.locals.body });
});

// Render the chat room for authenticated users
// router.get('/chat', authenticateJWT, (req, res) => {
router.get('/chat', (req, res) => {
    const messages =  ChatMessage.find().sort({ timestamp: 1 });

    res.render('chat', { body: res.locals.body, messages });
});

router.get('/login', (req, res) => {
    res.render('login', { body: res.locals.body });
});

router.get('/signup', (req, res) => {
    res.render('signup', { body: res.locals.body });
});
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { body: res.locals.body });
});

module.exports = router;
