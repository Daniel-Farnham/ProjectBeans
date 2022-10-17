import { userIdExists } from './other.js';
import { getData, setData } from './dataStore.js';
import { isMemberOfChannel, error } from './other.js';

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
function channelsListV1(authUserId: number) {
  // Check if authUserId Exists
  if (!(userIdExists(authUserId))) {
    return { error: 'authUserId is invalid' };
  }

  const data = getData();
  const channels = [];

  // If user is member of channel, then push channel to channels array
  for (const channel of data.channels) {
    const channelObj = {
      channelId: channel.channelId,
      name: channel.name,
    };

    if (isMemberOfChannel(channel, authUserId)) {
      channels.push(channelObj);
    }
  }

  return { channels: channels };
}

/**
  * Get an array of channels, which contains channelId and name for each channel
  *
  * @param {number} authUserId - userId making the request
  *
  * @returns {{channels}} - array of channel objects containing channelId and name
*/
function channelsListAllV1(authUserId: number) {
  // Case where authUserId is not valid
  if (!userIdExists(authUserId)) {
    return { error: 'authUserId is invalid' };
  }

  // Case for when authUserId is valid
  const data = getData();
  const channels = [];

  // Loop through each channel and push to channels array
  for (const channel of data.channels) {
    channels.push({
      channelId: channel.channelId,
      name: channel.name,
    });
  }
  return { channels };
}

/**
  * Will attempt to create a new chanel, returning an object
  * containing the channels unique id.
  *
  * @param {number} authUserId - userId making the request
  * @param {string} name - name of the new channel
  * @param {boolean} isPublic - Whether or not the channel is public
  *
  * @returns {{error: string}} - An error message if any parameter is invalid
  * @returns {{channelId: channelId}} - The channel id of the new channel
*/
function channelsCreateV1 (authUserId: number, name: string, isPublic: boolean) {
  
  const data = getData();

  // Check authUserId exists
  if (!(userIdExists(authUserId))) {
    return { error: 'authUserId is invalid.' };
  }

  // Check if the length of the name is between 1-20 characters long.
  // Create channel if true, return error if false.
  const channelStr = (name);
  if (channelStr.length < MIN_CHANNEL_LEN || channelStr.length > MAX_CHANNEL_LEN) {
    return { error: 'Channel name is invalid.' };
  }

  // Add the new channel to the database and push users
  const ownerMembers = [];
  const allMembers = [];

  for (const user of data.users) {
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
    //@ts-ignore - need to fix this in future to pass tsc
    messages: [],
    isPublic: isPublic,
  };

  // Push the user to the channel
  data.channels.push(channelObj);
  setData(data);

  return { channelId: channelId };
}

export { channelsListV1, channelsListAllV1, channelsCreateV1 };
