import AgoraRTC from 'agora-rtc-sdk-ng';

const APP_ID = process.env.REACT_APP_AGORA_APP_ID;

export const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

export const setupAgora = async (channelName, token = null, uid = null) => {
  await client.join(APP_ID, channelName, token, uid);
  // Add more local tracks publishing logic later
};
