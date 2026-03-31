const express = require('express')
const http = require('http')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const { Server } = require('socket.io')

const authRoutes = require('./routes/auth')
const roomHandler = require('./socket/roomHandler')

dotenv.config()

const app = express()

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://video-conferencing-4dq99e5w7-pp19.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)



// Test route
app.get('/', (req, res) => {
  res.send('Smart-Meet server is running!')
})

// Create HTTP server
const server = http.createServer(app)

// Attach Socket.io to HTTP server

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://video-conferencing-4dq99e5w7-pp19.vercel.app'
    ],
    methods: ['GET', 'POST']
  }
})

// Socket.io connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  roomHandler(socket, io)

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Connect MongoDB then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected!')
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`)
    })
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err)
  })
