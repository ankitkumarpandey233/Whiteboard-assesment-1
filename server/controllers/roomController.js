const Room = require('../models/Room');
const { generateUniqueRoomCode } = require('../utils/generateRoomCode');

// Check if room exists
const checkRoomExists = async (roomCode) => {
  try {
    const room = await Room.findOne({ roomCode });
    return !!room;
  } catch (error) {
    console.error('Error checking room:', error);
    return false;
  }
};

// Join or create room
const joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.body;

    // Validate room code
    if (!roomCode || typeof roomCode !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Room code is required'
      });
    }

    const normalizedCode = roomCode.toUpperCase().trim();

    // Check if room exists
    let room = await Room.findOne({ roomCode: normalizedCode });

    if (!room) {
      // Create new room
      room = new Room({
        roomCode: normalizedCode,
        activeUsers: 0,
        drawingData: []
      });
      await room.save();
    }

    // Update last activity
    room.lastActivity = new Date();
    await room.save();

    res.status(200).json({
      success: true,
      room: {
        roomCode: room.roomCode,
        createdAt: room.createdAt,
        activeUsers: room.activeUsers,
        hasDrawingData: room.drawingData.length > 0
      }
    });

  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join room',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new room with auto-generated code
const createRoom = async (req, res) => {
  try {
    // Generate unique room code
    const roomCode = await generateUniqueRoomCode(checkRoomExists);

    // Create new room
    const room = new Room({
      roomCode,
      activeUsers: 0,
      drawingData: []
    });

    await room.save();

    res.status(201).json({
      success: true,
      room: {
        roomCode: room.roomCode,
        createdAt: room.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get room information
const getRoomInfo = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomCode: roomId.toUpperCase() });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      room: {
        roomCode: room.roomCode,
        createdAt: room.createdAt,
        lastActivity: room.lastActivity,
        activeUsers: room.activeUsers,
        drawingDataCount: room.drawingData.length
      }
    });

  } catch (error) {
    console.error('Error getting room info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get room information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  joinRoom,
  createRoom,
  getRoomInfo
};