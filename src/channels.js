import { getData, setData } from './dataStore.js';
import { userIdExists } from './other.js';

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

/**
  * Get an array with channels containing channelId and name
  * 
  * @param {number} authUserId - userId making the request
  * 
  * @returns {channels} - array of channel objects containing channelId and name
*/
function channelsListAllV1(authUserId) {
  // Check authUserId exists
  if (userIdExists(authUserId)) {
    const data = getData();
    let channels = [];
    // Loop through each channel and push to channels array
    for (const channel of data.channels) {
      const channelObj = {
        channelId: channel.channelId,
        name: channel.name,
      };

      channels.push(channelObj);
    }
    return channels
  } else {
    return { error: "authUserId is invalid"};
  }
}

// channelsCreateV1 function with stub response
function channelsCreateV1 (authUserId, name, isPublic) {
  return {
    channelId: 1,
  };
}

export { channelsListV1, channelsListAllV1, channelsCreateV1 };