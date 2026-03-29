import AgoraRTC from 'agora-rtc-sdk-ng'

const APP_ID = process.env.REACT_APP_AGORA_APP_ID

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

let localTracks = {
  videoTrack: null,
  audioTrack: null
}

let remoteUsers = {}

const joinAndDisplayLocalStream = async (roomId, userId) => {
  client.on('user-published', handleUserPublished)
  client.on('user-unpublished', handleUserUnpublished)
  client.on('user-left', handleUserLeft)

  await client.join(APP_ID, roomId, null, userId)

  localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
  localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack()

  await client.publish([localTracks.audioTrack, localTracks.videoTrack])

  return localTracks.videoTrack
}

const handleUserPublished = async (user, mediaType) => {
  remoteUsers[user.uid] = user
  await client.subscribe(user, mediaType)

  if (mediaType === 'video') {
    const remoteVideoTrack = user.videoTrack
    const remoteContainer = document.createElement('div')
    remoteContainer.id = `user-${user.uid}`
    remoteContainer.className = 'video-container'
    document.getElementById('video-grid').appendChild(remoteContainer)
    remoteVideoTrack.play(`user-${user.uid}`)
  }

  if (mediaType === 'audio') {
    user.audioTrack.play()
  }
}

const handleUserUnpublished = (user) => {
  delete remoteUsers[user.uid]
}

const handleUserLeft = (user) => {
  delete remoteUsers[user.uid]
  const remoteContainer = document.getElementById(`user-${user.uid}`)
  if (remoteContainer) remoteContainer.remove()
}

const leaveAndRemoveLocalStream = async () => {
  for (let track of Object.values(localTracks)) {
    if (track) {
      track.stop()
      track.close()
    }
  }
  await client.leave()
}

const toggleMic = async (isMuted) => {
  if (localTracks.audioTrack) {
    await localTracks.audioTrack.setEnabled(!isMuted)
  }
}

const toggleCamera = async (isCameraOff) => {
  if (localTracks.videoTrack) {
    await localTracks.videoTrack.setEnabled(!isCameraOff)
  }
}

const toggleScreen = async (isScreenSharing) => {
  if (isScreenSharing) {
    const screenTrack = await AgoraRTC.createScreenVideoTrack()
    await client.unpublish(localTracks.videoTrack)
    await client.publish(screenTrack)
    localTracks.videoTrack = screenTrack
  } else {
    const cameraTrack = await AgoraRTC.createCameraVideoTrack()
    await client.unpublish(localTracks.videoTrack)
    await client.publish(cameraTrack)
    localTracks.videoTrack = cameraTrack
  }
}

export {
  client,
  localTracks,
  joinAndDisplayLocalStream,
  leaveAndRemoveLocalStream,
  toggleMic,
  toggleCamera,
  toggleScreen
}
