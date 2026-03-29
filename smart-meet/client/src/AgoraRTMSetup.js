import AgoraRTM from 'agora-rtm-sdk';

const APP_ID = process.env.REACT_APP_AGORA_APP_ID;
export const rtmClient = AgoraRTM.createInstance(APP_ID);

export const setupAgoraRTM = async (uid) => {
  await rtmClient.login({ uid: String(uid) });
};
