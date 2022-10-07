import { userIdExists } from "./other.js";
import { getData, setData } from './dataStore.js';

const MIN_CHANNEL_LEN = 1;
const MAX_CHANNEL_LEN = 20;

/** 
 * Will return an object containing an array of channels
 * that the user is in.
 * 
 * @param {number} authUserId - userId making the request
 * 
 * @returns {{channels: channels}} - array of channel objects containing channelId and name
*/
function channelsListV1(authUserId) {
  // Check if authUserId Exists
  if (!(userIdExists(authUserId))) {
    return {error: "authUserId is invalid"};
  }

  const data = getData();
  let channels = [];
  
  // Check if user is a member of channel
  for (const channel of data.channels) {
    const channelObj = {
      channelId: channel.channelId,
      name: channel.name ,
    };
    
    for (const allMembers of channel.allMembers) {
      if (allMembers.uId === authUserId) {
        channels.push(channelObj);
      };
    };
  };

  return { channels: channels }
};


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
    // Create user object with required values
    const userObj = {
      uId: user.uId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr,
    };

    if (user.uId === authUserId) {
      ownerMembers.push(userObj);
      allMembers.push(userObj);
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

export { channelsListV1, channelsListAllV1, channelsCreateV1 };