import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Home.css'

const Home = () => {
    const [roomId, setRoomId] = useState('')
    const [roomName, setRoomName] = useState('')
    const [meetType, setMeetType] = useState('instant')
    const [meetTime, setMeetTime] = useState('')
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const generateRoomId = () => {
        return Math.random().toString(36).substring(2, 10).toUpperCase()
    }

    const handleCreateRoom = () => {
        const newRoomId = generateRoomId()
        navigate(`/room/${newRoomId}`, {
            state: {
                roomName: roomName || `${user.username}'s Room`,
                isHost: true,
                meetType,
                meetTime
            }
        })
    }

    const handleJoinRoom = () => {
        if (!roomId.trim()) {
            alert('Please enter a Room ID')
            return
        }
        navigate(`/room/${roomId}`, {
            state: {
                roomName: `Room-${roomId}`,
                isHost: false,
                meetType: 'instant'
            }
        })
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="home-container">
            <nav className="navbar">
                <div className="nav-logo">Smart-Meet</div>
                <div className="nav-user">
                    <span>Hi, {user?.username}</span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </nav>

            <div className="home-content">
                <h1>Video Conferencing</h1>
                <p className="home-subtitle">Create or join a meeting instantly</p>

                <div className="cards-row">
                    <div className="card">
                        <h3>Create a Room</h3>
                        <div className="form-group">
                            <label>Room Name (optional)</label>
                            <input
                                type="text"
                                placeholder="Enter room name"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Meet Type</label>
                            <select
                                value={meetType}
                                onChange={(e) => setMeetType(e.target.value)}
                            >
                                <option value="instant">Instant Meeting</option>
                                <option value="scheduled">Scheduled Meeting</option>
                            </select>
                        </div>
                        {meetType === 'scheduled' && (
                            <div className="form-group">
                                <label>Schedule Time</label>
                                <input
                                    type="datetime-local"
                                    value={meetTime}
                                    onChange={(e) => setMeetTime(e.target.value)}
                                />
                            </div>
                        )}
                        <button className="primary-btn" onClick={handleCreateRoom}>
                            Create Room
                        </button>
                    </div>

                    <div className="divider">OR</div>

                    <div className="card">
                        <h3>Join a Room</h3>
                        <div className="form-group">
                            <label>Room ID</label>
                            <input
                                type="text"
                                placeholder="Enter Room ID"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                            />
                        </div>
                        <button className="secondary-btn" onClick={handleJoinRoom}>
                            Join Room
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home