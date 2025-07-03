const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
    minlength: 6,
    maxlength: 8
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Automatically delete after 24 hours
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  drawingData: [{
    type: {
      type: String,
      enum: ['stroke', 'clear'],
      required: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    userId: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
roomSchema.index({ lastActivity: -1 });

// Update lastActivity on any drawing action
roomSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Add drawing command
roomSchema.methods.addDrawingCommand = function(command) {
  this.drawingData.push(command);
  this.lastActivity = new Date();
  return this.save();
};

// Clear all drawing data
roomSchema.methods.clearDrawing = function() {
  this.drawingData = [{
    type: 'clear',
    data: {},
    timestamp: new Date()
  }];
  this.lastActivity = new Date();
  return this.save();
};

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;