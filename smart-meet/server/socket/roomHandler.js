const Room = require('../models/Rooms')

const roomHandler = (socket, io) => {

  // User creates or joins a room
  socket.on('join-room', async ({ roomId, roomName, userId, username, meetType, meetTimings }) => {
    try {
      socket.join(roomId)
      console.log(`${username} joined room: ${roomId}`)

      // Check if room exists in DB
      let room = await Room.findOne({ roomId })

      if (!room) {
        // Create new room if it doesn't exist
        room = await Room.create({
          roomId,
          roomName: roomName || `Room-${roomId}`,
          host: userId,
          participants: [userId],
          meetType: meetType || 'instant',
          meetTimings: meetTimings || null
        })
        console.log('New room created:', roomId)
      } else {
        // Add participant if not already in room
        if (!room.participants.includes(userId)) {
          room.participants.push(userId)
          await room.save()
        }
      }

      // Notify others in room that a new user joined
      socket.to(roomId).emit('user-joined', {
        userId,
        username,
        socketId: socket.id
      })

      // Send current room users back to the joining user
      const socketsInRoom = await io.in(roomId).fetchSockets()
      const usersInRoom = socketsInRoom.map(s => s.id)
      socket.emit('room-users', usersInRoom)

    } catch (error) {
      console.log('join-room error:', error)
      socket.emit('error', { message: 'Could not join room' })
    }
  })

  // User leaves a room
  socket.on('leave-room', async ({ roomId, userId, username }) => {
    try {
      socket.leave(roomId)

      // Remove participant from DB
      await Room.findOneAndUpdate(
        { roomId },
        { $pull: { participants: userId } }
      )

      // Notify others
      socket.to(roomId).emit('user-left', {
        userId,
        username,
        socketId: socket.id
      })

      console.log(`${username} left room: ${roomId}`)
    } catch (error) {
      console.log('leave-room error:', error)
    }
  })

  // Handle disconnect
  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms]
    rooms.forEach(roomId => {
      socket.to(roomId).emit('user-left', {
        socketId: socket.id
      })
    })
  })
}

module.exports = roomHandler
