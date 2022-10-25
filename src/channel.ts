import { userIdExists, channelIdExists, isMemberOfChannel, error, User } from './other.ts';
import { getData, setData } from './dataStore.ts';
import { userProfileV1 } from './users.ts';

const GLOBAL_OWNER = 1;

type channelDetails = {
  name: string,
  isPublic: boolean,
  ownerMembers: Array<User>,
  allMembers: Array<User>,
};

type messages = { messages: Array<messages> };

type start = { start: number };

type end = { end: number };

/**
  * Allows a user to return the channelDetails of a channel that
  * they are a member of.
  *
  *
  * @param {number} authUserId - uId of authorised user
  * @param {number} channelId - id of channel to invite to
  * ...
  *
  * @returns {Object: EmptyObject} {} - returns an object of channel details if successful
  * @returns {{error: string}} - An error message if any parameter is invalid
*/

function channelDetailsV1(authUserId: number, channelId: number): channelDetails | error {
  const data = getData();
  const findChannel = data.channels.find(o => o.channelId === channelId);

  // Check if userId and channelId is invalid.
  if (!userIdExists(authUserId) || !channelIdExists(channelId)) {
    return { error: 'userId or channelId is invalid' };
  }
  // Case where authUserId is not a member of the channel
  if (!isMemberOfChannel(findChannel, authUserId)) {
    return { error: 'authUserId is not a member of the channel' };
  }

  // Return channel details
  return {
    name: findChannel.name,
    isPublic: findChannel.isPublic,
    ownerMembers: findChannel.ownerMembers,
    allMembers: findChannel.allMembers
  };
}

/**
  * Allows a user to join a channel with an authorised userId
  * and add them to the allMembers array of the channel
  *
  * @param {number} authUserId - uId of authorised user
  * @param {number} channelId - id of channel to invite to
  * ...
  *
  * @returns {Object} {} - returns an empty object upon success
  * @returns {{error: string}} - An error message if any parameter is invalid
*/

function channelJoinV1(authUserId: number, channelId: number): error | Record<string, never> {
  const data = getData();
  const findChannel = data.channels.find(o => o.channelId === channelId);

  // Check if userId or channelId are invalid
  if (!(userIdExists(authUserId)) || !(channelIdExists(channelId))) {
    return { error: 'userId or channelId is invalid' };
  }

  const findUser = data.users.find(o => o.uId === authUserId);

  // Check if member is not Global Owner and the channel is private.
  if (!(findChannel.isPublic) && findUser.permissionId !== GLOBAL_OWNER) {
    return { error: 'Channel is private and user is not global owner or a member of the channel' };
  }

  // Check if user is already member of channel
  if (isMemberOfChannel(findChannel, authUserId)) {
    return { error: 'User is already a member of the public channel' };
  }

  const userObj = {
    uId: findUser.uId,
    email: findUser.email,
    nameFirst: findUser.nameFirst,
    nameLast: findUser.nameLast,
    handleStr: findUser.handleStr,
  };

  // Loop through channel and add new member
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.allMembers.push(userObj);
    }
  }

  setData(data);
  return {};
}

/**
  * Invites a user to a channel with an authorised user and add them to
  * the allMembers array of the channel
  *
  * @param {number} authUserId - uId of authorised user
  * @param {number} channelId - id of channel to invite to
  * @param {number} uId - id of user being invited to channel
  * ...
  *
  * @returns {Object} {} - returns an empty object upon success
*/
function channelInviteV1(authUserId: number, channelId: number, uId: number): error | boolean | Record<string, never> {
  // If any ids do not exist, return error
  if (!userIdExists(authUserId) || !userIdExists(uId) || !channelIdExists(channelId)) {
    return { error: 'authUserId/uId/channelId not valid' };
  }
  const data = getData();
  const findChannel = data.channels.find(o => o.channelId === channelId);

  // Check if memberships for authUserId and uId valid. If invalid, return error
  const invalidMembership = invalidMemberships(findChannel, authUserId, uId);
  if (invalidMembership !== false) {
    return invalidMembership;
  }
  // Invite new member to channel if authUserId is member of channel
  const newMember = userProfileV1(authUserId, uId);
  // Loop through channel and add new member
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.allMembers.push(newMember.user);
      setData(data);
      return {};
    }
  }
}

/**
  * Used for channelInviteV1 to check if authUserId is valid member of channel
  * and if uId is not already part of channel
  *
  * @param {number} authUserId - uId of authorised user
  * @param {object} channel - channel object
  * @param {number} uId - id of user being invited to channel
  *
  * @returns {Object} {} - returns error object if fail, false otherwise
*/

function invalidMemberships (channel, authUserId: number, uId: number): error | boolean {
  // If user already exists as member, return error
  if (isMemberOfChannel(channel, uId)) {
    return { error: 'User to invite already a member of channel' };
  }

  // If authUserId not found in channel members, return error
  if (!isMemberOfChannel(channel, authUserId)) {
    return { error: 'authUserId is not a member of channel' };
  }
  return false;
}

/**
  * Returns up to 50 messages from a channel between index start and start + 50,
  * given that the authorised user is a member of the channel.
  *
  * @param {number} authUserId - The authoirsed user trying to view messages
  * @param {number} channelId - The id of the channel that has the messages
  * @param {number} start - The starting index of the messages being viewed
  *
  * @returns {{error: string}} - An error message if any parameter is invalid
  * @returns {{messages: array}} - An array of all the returned messages
  * @returns {{start: number}} - The starting index of the returned messages
  * @returns {{end: number}} - The final index of the returned messages
  */
function channelMessagesV1(authUserId: number, channelId: number, start: number): boolean | error | messages | start | end {
  // Check if the given information is valid
  const isInvalid = messagesInfoInvalid(authUserId, channelId, start);
  if (isInvalid !== false) {
    return isInvalid;
  }

  // If start and number of messages are both 0, return empty message array
  const data = getData();
  const channel = data.channels.find(o => o.channelId === channelId);
  const numMessages = channel.messages.length;

  const messages = [];
  let end;
  if (start === 0 && numMessages === 0) {
    end = -1;
  } else {
    // If start and number of messages aren't both 0, add up to 50 messages
    let index = 0;
    while (index < numMessages && index < start + 50) {
      messages.push(channel.messages[index]);
      index++;
    }

    // Now determine if index is the least recent message or not
    if (index === numMessages) {
      end = -1;
    } else {
      end = index;
    }
  }

  return {
    messages: messages,
    start: start,
    end: end,
  };
}

/**
  * Checks if the channel information given is invalid
  *
  * @param {number} authUserId - The authoirsed user trying to view messages
  * @param {number} channelId - The id of the channel that has the messages
  * @param {number} start - The starting index of the messages being viewed
  *
  * @returns {{error: string}} - An error message if any parameter is invalid
  * @returns {boolean} - False if the information isn't invalid
  */
function messagesInfoInvalid(authUserId: number, channelId: number, start: number): error | boolean {
  // If channelId or authUserId doesn't exist return error
  if (!(channelIdExists(channelId))) {
    return { error: 'ChannelId is invalid' };
  }
  if (!(userIdExists(authUserId))) {
    return { error: 'authUserId is invalid' };
  }

  // If start is negative or greater than number of messages return error
  if (start < 0) {
    return { error: 'Starting index can\'t be negative' };
  }
  const data = getData();
  const channel = data.channels.find(o => o.channelId === channelId);
  const numMessages = channel.messages.length;
  if (start > numMessages) {
    return { error: 'Start index is greater than number of messages in channel' };
  }

  // If channelId is valid but user isn't a member of the channel return error
  let isMember = false;
  for (const user of channel.allMembers) {
    if (user.uId === authUserId) {
      isMember = true;
    }
  }
  if (isMember === false) {
    return { error: 'Authorised user is not a member of the channel' };
  }

  // If no error by now, the info isn't invalid
  return false;
}

export { channelInviteV1, channelJoinV1, channelDetailsV1, channelMessagesV1 };
