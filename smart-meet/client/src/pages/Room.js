import React, { useEffect, useState, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import socket from '../Socket'
import {
    joinAndDisplayLocalStream,
    leaveAndRemoveLocalStream,
    toggleMic,
    toggleCamera,
    toggleScreen
} from '../AgoraSetup'
import { initRTM, sendMessage, leaveRTM } from '../AgoraRTMSetup'
import '../styles/Room.css'

const Room = () => {
    const { roomId } = useParams()
    const { state } = useLocation()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [isMuted, setIsMuted] = useState(false)
    const [isCameraOff, setIsCameraOff] = useState(false)
    const [isScreenSharing, setIsScreenSharing] = useState(false)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [participants, setParticipants] = useState([])
    const [isChatOpen, setIsChatOpen] = useState(true)

    const localVideoRef = useRef(null)
    const messagesEndRef = useRef(null)
    const rtmChannelRef = useRef(null)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        initRoom()
        return () => cleanup()
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const initRoom = async () => {
        try {
            // Join Agora RTC
            const videoTrack = await joinAndDisplayLocalStream(
                roomId,
                user.id
            )

            // Play local video
            if (localVideoRef.current) {
                videoTrack.play(localVideoRef.current)
            }

            // Join Agora RTM for chat
            const { rtmChannel } = await initRTM(roomId, user.username)
            rtmChannelRef.current = rtmChannel

            // Listen for chat messages
            rtmChannel.on('ChannelMessage', ({ text }, memberId) => {
                const parsed = JSON.parse(text)
                setMessages(prev => [...prev, {
                    sender: parsed.username,
                    text: parsed.message,
                    time: new Date().toLocaleTimeString()
                }])
            })

            // Join socket room
            socket.connect()
            socket.emit('join-room', {
                roomId,
                roomName: state?.roomName,
                userId: user.id,
                username: user.username,
                meetType: state?.meetType,
                meetTimings: state?.meetTime
            })

            // Socket events
            socket.on('user-joined', ({ username }) => {
                setParticipants(prev => [...prev, username])
                setMessages(prev => [...prev, {
                    sender: 'System',
                    text: `${username} joined the room`,
                    time: new Date().toLocaleTimeString()
                }])
            })

            socket.on('user-left', ({ username }) => {
                setParticipants(prev => prev.filter(p => p !== username))
                setMessages(prev => [...prev, {
                    sender: 'System',
                    text: `${username} left the room`,
                    time: new Date().toLocaleTimeString()
                }])
            })

        } catch (error) {
            console.error('Error joining room:', error)
        }
    }

    const cleanup = async () => {
        await leaveAndRemoveLocalStream()
        await leaveRTM()
        socket.emit('leave-room', {
            roomId,
            userId: user.id,
            username: user.username
        })
        socket.disconnect()
    }

    const handleMic = async () => {
        await toggleMic(isMuted)
        setIsMuted(!isMuted)
    }

    const handleCamera = async () => {
        await toggleCamera(isCameraOff)
        setIsCameraOff(!isCameraOff)
    }

    const handleScreen = async () => {
        await toggleScreen(!isScreenSharing)
        setIsScreenSharing(!isScreenSharing)
    }

    const handleLeave = async () => {
        await cleanup()
        navigate('/')
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return
        const messageData = {
            username: user.username,
            message: newMessage
        }
        await sendMessage(JSON.stringify(messageData))
        setMessages(prev => [...prev, {
            sender: 'You',
            text: newMessage,
            time: new Date().toLocaleTimeString()
        }])
        setNewMessage('')
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSendMessage()
    }

    return (
        <div className="room-container">

            {/* Header */}
            <div className="room-header">
                <div className="room-info">
                    <span className="room-title">{state?.roomName || `Room-${roomId}`}</span>
                    <span className="room-id">ID: {roomId}</span>
                </div>
                <div className="room-header-right">
                    <span className="participants-count">
                        {participants.length + 1} participant(s)
                    </span>
                </div>
            </div>

            {/* Main content */}
            <div className="room-main">

                {/* Video grid */}
                <div className="video-section">
                    <div id="video-grid" className="video-grid">

                        {/* Local video */}
                        <div className="video-container local-video">
                            <div ref={localVideoRef} className="video-player"></div>
                            <div className="video-label">
                                You ({user?.username})
                                {isMuted && <span className="muted-badge">Muted</span>}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Chat sidebar */}
                {isChatOpen && (
                    <div className="chat-sidebar">
                        <div className="chat-header">
                            <h3>In-Meet Chat</h3>
                            <button
                                className="close-chat"
                                onClick={() => setIsChatOpen(false)}
                            >✕</button>
                        </div>

                        <div className="chat-messages">
                            {messages.length === 0 && (
                                <p className="no-messages">
                                    No messages yet. Say hello!
                                </p>
                            )}
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`message ${msg.sender === 'You' ? 'own-message' : ''} ${msg.sender === 'System' ? 'system-message' : ''}`}
                                >
                                    {msg.sender !== 'System' && (
                                        <span className="message-sender">{msg.sender}</span>
                                    )}
                                    <span className="message-text">{msg.text}</span>
                                    <span className="message-time">{msg.time}</span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button onClick={handleSendMessage}>Send</button>
                        </div>
                    </div>
                )}

            </div>

            {/* Controls */}
            <div className="room-controls">
                <button
                    className={`control-btn ${isMuted ? 'active' : ''}`}
                    onClick={handleMic}
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? 'Unmute' : 'Mute'}
                </button>

                <button
                    className={`control-btn ${isCameraOff ? 'active' : ''}`}
                    onClick={handleCamera}
                    title={isCameraOff ? 'Start Camera' : 'Stop Camera'}
                >
                    {isCameraOff ? 'Start Cam' : 'Stop Cam'}
                </button>

                <button
                    className={`control-btn ${isScreenSharing ? 'active' : ''}`}
                    onClick={handleScreen}
                    title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                >
                    {isScreenSharing ? 'Stop Share' : 'Share Screen'}
                </button>

                <button
                    className="control-btn chat-btn"
                    onClick={() => setIsChatOpen(!isChatOpen)}
                >
                    {isChatOpen ? 'Hide Chat' : 'Show Chat'}
                </button>

                <button
                    className="control-btn leave-btn"
                    onClick={handleLeave}
                >
                    Leave Room
                </button>
            </div>

        </div>
    )
}

export default Room