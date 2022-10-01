import { getData, setData } from './dataStore.js';

// channelsListV1 function with stub response
function channelsListV1(authUserId) {
    return {
        channels: [
          {
            channelId: 1,
            name: 'My Channel',
          }
        ],
    };
}

// channelsListAllV1 function with stub response
function channelsListAllV1(authUserId) {
  // Check authUserId exists
  // If exists, return channels
  const data = getData();

  let channels = [];
  for (let channel of data.channels) {
    channels.push(channel);
  }
  return channels;
}

// channelsCreateV1 function with stub response
function channelsCreateV1 (authUserId, name, isPublic) {
  return {
    channelId: 1,
  };
}

export { channelsListV1, channelsListAllV1, channelsCreateV1 };