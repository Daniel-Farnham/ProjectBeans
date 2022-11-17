import {
  tokenExists, userIdExists, channelIdExists, isMemberOfChannel,
  isOwnerOfChannel, error, getUidFromToken, FORBIDDEN, BAD_REQUEST
} from './other';
import { getData, setData } from './dataStore';
import { userProfileV1 } from './users';
import HTTPError from 'http-errors';
import { notificationSetAddChannel } from './notifications';
import { messageReactedByUser } from './message';
import { user, messagesOutput, internalChannel, channelDetails } from './types';

const GLOBAL_OWNER = 1;

// type messages = { messages: Array<messages> };

type start = { start: number };

type end = { end: number };

/**
  * Allows a user to return the channelDetails of a channel that
  * they are a member of.
  *
  *
  * @param {string} token - uId of authorised user
  * @param {number} channelId - id of channel to invite to
  * ...
  *
  * @returns {Object: EmptyObject} {} - returns an object of channel details if successful
  * @returns {{error: string}} - An error message if any parameter is invalid
*/

function channelDetailsV1(token: string, channelId: number): channelDetails | error {
  const data = getData();
  const findChannel = data.channels.find(o => o.channelId === channelId);

  // Check if userId and channelId is invalid.
  if (!(tokenExists(token))) {
    throw HTTPError(403, 'token is invalid');
  }

  if (!channelIdExists(channelId)) {
    throw HTTPError(400, 'channelId is invalid');
  }
  // Case where authUserId is not a member of the channel
  const uId = getUidFromToken(token);
  if (!isMemberOfChannel(findChannel, uId)) {
    throw HTTPError(403, 'User is not a member of the channel');
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

function channelJoinV1(token: string, channelId: number): error | Record<string, never> {
  const data = getData();
  const findChannel = data.channels.find(o => o.channelId === channelId);
  if (!(tokenExists(token))) {
    throw HTTPError(403, 'userId is invalid');
  }
  // Check if userId or channelId are invalid
  if (!channelIdExists(channelId)) {
    throw HTTPError(400, 'channelId is invalid');
  }
  const authUserId = getUidFromToken(token);
  const findUser = data.users.find(user => user.uId === authUserId);

  // Check if member is not Global Owner and the channel is private.
  if (!(findChannel.isPublic) && findUser.permissionId !== GLOBAL_OWNER) {
    throw HTTPError(403, 'Channel is private and user is not global owner or a member of the channel');
  }

  // Check if user is already member of channel
  if (isMemberOfChannel(findChannel, authUserId)) {
    throw HTTPError(400, 'User is already a member of the public channel');
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
  * Invites a user to a channel with an authorised user's token and add them to
  * the allMembers array of the channel
  *
  * @param {string} token - token of authorised user
  * @param {number} channelId - id of channel to invite to
  * @param {number} uId - id of user being invited to channel
  * ...
  *
  * @returns {Object} {} - returns an empty object upon success
*/
function channelInviteV1(token: string, channelId: number, uId: number): error | boolean | Record<string, never> {
  // If any ids do not exist, return error
  if (!userIdExists(uId) || !channelIdExists(channelId)) {
    throw HTTPError(400, 'uId/channelId not valid');
  }

  if (!tokenExists(token)) {
    throw HTTPError(403, 'token is not valid');
  }
  const data = getData();
  const findChannel = data.channels.find(channel => channel.channelId === channelId);

  const authUserId = getUidFromToken(token);

  // Check if memberships for token and uId valid. If invalid, return error
  const invalidMembership = invalidMemberships(findChannel, authUserId, uId);
  if (invalidMembership !== false) {
    return invalidMembership;
  }
  // Invite new member to channel if token is member of channel
  const newMember = userProfileV1(token, uId);
  // Loop through channel and add new member
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.allMembers.push(newMember.user);
      notificationSetAddChannel(channelId, authUserId, uId);
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

function invalidMemberships (channel: internalChannel, authUserId: number, uId: number): error | boolean {
  // If user already exists as member, return error
  if (isMemberOfChannel(channel, uId)) {
    throw HTTPError(400, 'User to invite already a member of channel');
  }

  // If authUserId not found in channel members, return error
  if (!isMemberOfChannel(channel, authUserId)) {
    throw HTTPError(403, 'authUserId is not a member of channel');
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
function channelMessagesV1(token: string, channelId: number, start: number): boolean | error | messagesOutput | start | end {
  // Check if the given information is valid

  const isInvalid = messagesInfoInvalid(token, channelId, start);
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
    const uId = getUidFromToken(token);
    // If start and number of messages aren't both 0, add up to 50 messages
    let index = start;
    while (index < numMessages && index < start + 50) {
      // Loop through each message and update whether user has reacted to message
      for (const react of channel.messages[index].reacts) {
        if (messageReactedByUser(channel.messages[index], uId, react.reactId)) {
          react.isThisUserReacted = true;
        } else {
          react.isThisUserReacted = false;
        }
      }
      messages.unshift(channel.messages[index]);
      index++;
    }

    // Now determine if index is the least recent message or not
    if (index === numMessages) {
      end = -1;
    } else {
      end = index - 1;
    }
  }

  return {
    messages: messages,
    start: start,
    end: end,
  };
}

/**
  * Allows a user to leave a channel they are a member of
  *
  *
  * @param {string} token - uId of authorised user
  * @param {number} channelId - id of channel to leave
  *
  * @returns {Object} {} - returns an empty object upon success
*/
function channelLeaveV1 (token: string, channelId: number): error | boolean | Record<string, never> {
  if (!tokenExists(token)) {
    throw HTTPError(FORBIDDEN, 'token is invalid');
  }
  if (!channelIdExists(channelId)) {
    throw HTTPError(BAD_REQUEST, 'channelId is invalid');
  }

  const data = getData();
  const findChannel = data.channels.find(channel => channel.channelId === channelId);
  const authUserId = getUidFromToken(token);

  // Check if user is not a member of valid channel
  if (!isMemberOfChannel(findChannel, authUserId)) {
    throw HTTPError(FORBIDDEN, 'User is not a member of the channel');
  }

  for (const channel of data.channels) {
    // Loop through owner members and filter out user
    for (const member of channel.ownerMembers) {
      if (member.uId === authUserId) {
        channel.ownerMembers = channel.ownerMembers.filter(
          (member: user): member is user => member.uId !== authUserId);
      }
    }
    // Loop through all members and filter out user
    for (const member of channel.allMembers) {
      if (member.uId === authUserId) {
        channel.allMembers = channel.allMembers.filter(
          (member: user): member is user => member.uId !== authUserId);
      }
    }
  }

  setData(data);
  return {};
}

/**
  * Allows a user to add an owner to a channel that they have
  * owner permissions in.
  *
  *
  * @param {string} token - uId of authorised user
  * @param {number} channelId - id of channel to give owner permissions to
  * @param {number} uId - uId of the user to be given owner permissions
  *
  * @returns {Object} {} - returns an empty object upon success
*/
function channelAddOwnerV1(token: string, channelId: number, uId: number): error | boolean | Record<string, never> {
  // Check if token is valid
  if (!tokenExists(token)) {
    throw HTTPError(FORBIDDEN, 'token is invalid');
  }
  // Check if uId is valid
  if (!userIdExists(uId)) {
    throw HTTPError(BAD_REQUEST, 'uId is invalid');
  }
  // Check if channelId is valid
  if (!channelIdExists(channelId)) {
    throw HTTPError(BAD_REQUEST, 'channelId is invalid');
  }

  const data = getData();
  const findChannel = data.channels.find(channel => channel.channelId === channelId);

  // Check if user is not a member of channel
  if (!isMemberOfChannel(findChannel, uId)) {
    throw HTTPError(BAD_REQUEST, 'User is not a member of the channel');
  }

  // Check authorised user has owner permissions
  const authUserId = getUidFromToken(token);
  const authUser = data.users.find(user => user.uId === authUserId);

  if (!isMemberOfChannel(findChannel, authUserId)) {
    throw HTTPError(FORBIDDEN, 'Auth user is not a member of the channel');
  }

  if (!isOwnerOfChannel(findChannel, authUserId) && authUser.permissionId !== GLOBAL_OWNER) {
    throw HTTPError(FORBIDDEN, 'Authorising user does not have owner permissions in this channel');
  }

  // Check if member is not an owner already
  if (isOwnerOfChannel(findChannel, uId)) {
    throw HTTPError(BAD_REQUEST, 'User is already an owner of the channel');
  }

  // Add new owner to array if token is member of channel
  const newOwner = userProfileV1(token, uId);
  // Loop through channel and add new owner
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.ownerMembers.push(newOwner.user);
      setData(data);
      return {};
    }
  }
}

/**
  * Allows a user to remove an owner to a channel that they have
  * owner permissions in.
  *
  *
  * @param {string} token - uId of authorised user
  * @param {number} channelId - id of channel to remove owner permissions from
  * @param {number} uId - uId of the user to have owner permissions removed
  *
  * @returns {Object} {} - returns an empty object upon success
*/
function channelRemoveOwnerV1(token: string, channelId: number, uId: number): error | boolean | Record<string, never> {
  // Check if token, channelId, uId are valid
  if (!tokenExists(token)) {
    throw HTTPError(FORBIDDEN, 'Token is invalid');
  }

  if (!userIdExists(uId)) {
    throw HTTPError(BAD_REQUEST, 'uId is invalid');
  }

  if (!channelIdExists(channelId)) {
    throw HTTPError(BAD_REQUEST, 'channelId is invalid');
  }

  const data = getData();
  const findChannel = data.channels.find(channel => channel.channelId === channelId);

  // User to remove it not an owner
  if (!isOwnerOfChannel(findChannel, uId)) {
    throw HTTPError(BAD_REQUEST, 'User to remove is not the owner of a channel');
  }

  // Check authorised user has owner permissions
  const authUserId = getUidFromToken(token);
  const authUser = data.users.find(user => user.uId === authUserId);

  if (!isMemberOfChannel(findChannel, authUserId)) {
    throw HTTPError(FORBIDDEN, 'Auth user is not a member of the channel');
  }

  if (!isOwnerOfChannel(findChannel, authUserId) && authUser.permissionId !== GLOBAL_OWNER) {
    throw HTTPError(FORBIDDEN, 'Authorising user does not have owner permissions in this channel');
  }

  // User to remove is the only owner
  if (findChannel.ownerMembers.length === 1) {
    throw HTTPError(BAD_REQUEST, 'The user to remove is the only owner of the channel');
  }

  // Remove the member from owner list
  for (const channel of data.channels) {
    for (const ownerMembers of channel.ownerMembers) {
      if (ownerMembers.uId === uId) {
        channel.ownerMembers = channel.ownerMembers.filter(
          (ownerMembers: user): ownerMembers is user => ownerMembers.uId !== uId);
      }
    }
  }
  return {};
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
function messagesInfoInvalid(token: string, channelId: number, start: number): error | boolean {
  // If channelId or authUserId doesn't exist return error

  if (!(tokenExists(token))) {
    throw HTTPError(403, 'token is invalid');
  }

  if (!(channelIdExists(channelId))) {
    throw HTTPError(400, 'channelId is invalid');
  }

  // If start is negative or greater than number of messages return error
  if (start < 0) {
    throw HTTPError(400, 'Starting index can\'t be negative');
  }
  const data = getData();
  const channel = data.channels.find(o => o.channelId === channelId);
  const numMessages = channel.messages.length;
  if (start > numMessages) {
    throw HTTPError(400, 'Start index is greater than number of messages in channel');
  }

  // If channelId is valid but user isn't a member of the channel return error
  const uId = getUidFromToken(token);

  if (!isMemberOfChannel(channel, uId)) {
    throw HTTPError(403, 'User is not a member of the channel');
  }

  // If no error by now, the info isn't invalid
  return false;
}

export {
  channelInviteV1, channelJoinV1, channelDetailsV1, channelMessagesV1,
  channelRemoveOwnerV1, channelAddOwnerV1, channelLeaveV1
};
