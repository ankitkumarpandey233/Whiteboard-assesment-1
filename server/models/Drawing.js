const mongoose = require('mongoose');

// Not really using this model directly, but keeping it for future features
// like saving individual drawings or implementing undo/redo
const drawingSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  userId: String,
  drawingType: {
    type: String,
    enum: ['stroke', 'shape', 'text'], // might add shapes later
    default: 'stroke'
  },
  strokeData: {
    points: [{
      x: Number,
      y: Number
    }],
    color: String,
    width: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Might use this for analytics later - which rooms have the most drawings etc
drawingSchema.index({ roomId: 1, timestamp: -1 });

module.exports = mongoose.model('Drawing', drawingSchema);