import { userIdExists } from "./other.js";
import { getData, setData } from './dataStore.js';

const MIN_CHANNEL_LEN = 1;
const MAX_CHANNEL_LEN = 20;

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
    return {
        channels: [
          {
            channelId: 1,
            name: 'My Channel',
          }
        ],
    };
}

// channelsCreateV1 function with stub response
function channelsCreateV1 (authUserId, name, isPublic) {
  
  const data = getData();

  // Check authUserId exists
  if (!(userIdExists(authUserId))) {
    return {error: 'authUserId is invalid.'};
  };
  
  // Check if the length of the name is between 1-20 characters long.
  // Create channel if true, return error if false.
  let channelStr = (name);
  if (channelStr.length < MIN_CHANNEL_LEN || channelStr.length > MAX_CHANNEL_LEN) {
    return {error: 'Channel name is invalid.'};
  };
  

  // Add the new channel to the database and push users
  const ownerMembers = [];
  const allMembers = [];
  
  for(const user of data.users) {
    if (user.uId === authUserId) {
      ownerMembers.push(user);
      allMembers.push(user);
    }
  }

  const channelId = data.channels.length;
  const channelObj = {
    channelId: channelId,
    name: name,
    ownerMembers: ownerMembers,
    allMembers: allMembers,
    messages: [],
    isPublic: isPublic,
  };
  
  // Push the user to the channel
  data.channels.push(channelObj);
  setData(data);


  return {channelId: channelId};
}
export { channelsCreateV1, channelsListAllV1, channelsListV1 };
