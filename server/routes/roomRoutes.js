const express = require('express');
const router = express.Router();
const {
  joinRoom,
  createRoom,
  getRoomInfo
} = require('../controllers/roomController');

// Room routes
router.post('/join', joinRoom);          // Join existing room or create if doesn't exist
router.post('/create', createRoom);       // Create new room with auto-generated code
router.get('/:roomId', getRoomInfo);     // Get room information

module.exports = router;