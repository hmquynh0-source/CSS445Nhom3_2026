const express = require('express');
const router = express.Router();
const { handleAIChat } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.protect);

router.post('/chat', handleAIChat);

module.exports = router;