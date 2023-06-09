import { tokenExists, isMemberOfChannel, error, getUidFromToken } from './other';
import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';

// Constants
const MIN_CHANNEL_LEN = 1;
const MAX_CHANNEL_LEN = 20;

type channelSummary = {
  channelId: number,
  name: string,
};

type channelId = { channelId: number };
type channels = { channels: Array<channelSummary> };

/**
 * Will return an object containing an array of channels
 * that the user is in.
 *
 * @param {string} token - token of authorised user
 *
 * @returns {{channels: channels}} - array of channel objects containing channelId and name
*/
function channelsListV1(token: string): channels | error {
  // Check if token exists
  if (!(tokenExists(token))) {
    throw new Error('Token is invalid');
  }

  const data = getData();
  const channels = [];

  // If user is member of channel, then push channel to channels array
  for (const channel of data.channels) {
    const channelObj = {
      channelId: channel.channelId,
      name: channel.name,
    };

    const uId = getUidFromToken(token);

    if (isMemberOfChannel(channel, uId)) {
      channels.push(channelObj);
    }
  }

  return { channels: channels };
}

/**
  * Get an array of channels, which contains channelId and name for each channel
  *
  * @param {string} token - token of user making the request
  *
  * @returns {{channels}} - array of channel objects containing channelId and name
*/
function channelsListAllV1(token: string): channels | error {
  // Case where token is not valid
  if (!tokenExists(token)) {
    throw new Error('Token is invalid');
  }

  // Case for when token is valid
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
  * @param {string} token - token making the request
  * @param {string} name - name of the new channel
  * @param {boolean} isPublic - Whether or not the channel is public
  *
  * @returns {{error: string}} - An error message if any parameter is invalid
  * @returns {{channelId: channelId}} - The channel id of the new channel
*/
function channelsCreateV1 (token: string, name: string, isPublic: boolean): channelId | error {
  const data = getData();

  // Check token exists
  if (!(tokenExists(token))) {
    throw new Error('Token is invalid');
  }

  // Check if the length of the name is between 1-20 characters long.
  // Create channel if true, return error if false.
  const channelStr = (name);
  if (channelStr.length < MIN_CHANNEL_LEN || channelStr.length > MAX_CHANNEL_LEN) {
    throw HTTPError(400, 'Channel name is too short or too long');
  }

  // Add the new channel to the database and push users
  const ownerMembers = [];
  const allMembers = [];

  const uId = getUidFromToken(token);
  for (const user of data.users) {
    // Create user object with required values
    const userObj = {
      uId: user.uId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr,
    };

    if (user.uId === uId) {
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

  return { channelId: channelId };
}

export { channelsListV1, channelsListAllV1, channelsCreateV1 };
