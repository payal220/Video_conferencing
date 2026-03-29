import AgoraRTM from 'agora-rtm-sdk'

const APP_ID = process.env.REACT_APP_AGORA_APP_ID

let rtmClient
let rtmChannel

const initRTM = async (roomId, username) => {
  rtmClient = AgoraRTM.createInstance(APP_ID)

  await rtmClient.login({
    uid: String(Date.now()),
    token: null
  })

  rtmChannel = rtmClient.createChannel(roomId)
  await rtmChannel.join()

  await rtmClient.addOrUpdateLocalUserAttributes({
    username: username
  })

  return { rtmClient, rtmChannel }
}

const sendMessage = async (message) => {
  if (rtmChannel) {
    await rtmChannel.sendMessage({ text: message })
  }
}

const leaveRTM = async () => {
  if (rtmChannel) await rtmChannel.leave()
  if (rtmClient) await rtmClient.logout()
}

export { initRTM, sendMessage, leaveRTM }
