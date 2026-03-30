import AgoraRTM from 'agora-rtm-sdk'

const APP_ID = 'b12d8611b83b474786a1ed784cf1886d'

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
