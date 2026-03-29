const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  roomName: {
    type: String,
    required: true,
    trim: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  meetType: {
    type: String,
    enum: ['instant', 'scheduled'],
    default: 'instant'
  },
  meetTimings: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Room', RoomSchema)
