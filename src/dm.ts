import { getData, setData } from './dataStore';
import {
  error, tokenExists, userIdExists, getUidFromToken, dmIdExists,
  isMemberOfDm, getMessageId, User, Messages, httpError, FORBIDDEN,
  BAD_REQUEST
} from './other';
import HTTPError from 'http-errors';

type dmInfo = {
  dmId: number,
  name: string,
  creator: number,
  members: Array<number>
};

type dmListInfo = {
  dmId: number,
  name: string
};

type dmList = {
  dms: Array<dmListInfo>
};

interface Message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
}

type messageId = { messageId: number }

type dmDetails = {
  name: string,
  members: Array<User>
};

type dmMessages = {
  messages: Array<Messages>,
  start: number,
  end: number
};
const MIN_MESSAGE_LEN = 1;
const MAX_MESSAGE_LEN = 1000;

/**
  * Creates a new dm by generating the dm name from the included user's
  * handlestrings and returns an object including the dmId.
  *
  * @param {string} token - The session token of the user creating the dm
  * @param {Array<number>} uIds - Array of userId's of other users in the dm
  *
  * @returns {{error: string}} - An error message if token/uIds is invalid
  * @returns {{dmId: number}} - The dm id of the new dm
  */
function dmCreateV1(token: string, uIds: Array<number>): {dmId: number} | error | boolean {
  // Check if the given information is valid
  const data = getData();
  const isInvalid = dmInfoInvalid(token, uIds);
  if (isInvalid !== false) {
    return isInvalid;
  }

  // Create the new dm and store it in the datastore
  const dm = constructDm(token, uIds);
  data.dms.push(dm);
  setData(data);
  return { dmId: dm.dmId };
}

/**
  * Remove a dm so all members are no longer in the dm, only if the authorised user
  * is the creator.
  *
  * @param {string} token - The session token of the user creating the dm
  * @param {number} dmId - Unique id of the dm being deleted
  *
  * @returns {Object: EmptyObject} {} - An empty object if successful
  * @returns {{error: string}} - An error message if token is invalid
  */
function dmRemoveV1(token: string, dmId: number): Record<string, never> | error | boolean {
  // Check if the given information is valid
  const data = getData();
  const isInvalid = removeInfoInvalid(token, dmId);
  if (isInvalid !== false) {
    const errorMsg = isInvalid as any;
    throw HTTPError(errorMsg.code, errorMsg.error);
  }

  // Remove all the members of the dm
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      while (dm.members.length !== 0) {
        dm.members.pop();
      }
    }
  }

  setData(data);
  return {};
}

/**
  * Checks if the information used to remove a new dm is valid
  *
  * @param {string} token - The session token of the user creating the dm
  * @param {number} dmId - Unique id of the dm being deleted
  *
  * @returns {{error: string}} - An error message if any info is invalid
  * @returns {boolean} - False if the given info isn't invalid
  */
function removeInfoInvalid(token: string, dmId: number): httpError | boolean {
  const data = getData();

  // Check if the dmId is invalid
  if (!dmIdExists(dmId)) {
    return { code: BAD_REQUEST, error: 'dmId is invalid' };
  }

  // Check if the token is invalid
  if (!tokenExists(token)) {
    return { code: FORBIDDEN, error: 'Token is invalid' };
  }

  // Check if the authorised user is the dm creator
  // If they are, check if they're still a member of the dm
  const uId = getUidFromToken(token);
  let isMember = false;
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      if (dm.creator !== uId) {
        return { code: FORBIDDEN, error: 'Authorised user isn\'t the dm creator' };
      } else if (isMemberOfDm(dm, uId)) {
        isMember = true;
      }
    }
  }

  if (!isMember) {
    return { code: FORBIDDEN, error: 'Authorised user is not a member of the dm' };
  }

  return false;
}

/**
  * Checks if the information used to create a new dm is valid
  * Returns the list of dms that the user is a member of
  *
  * @param {string} token - The session token of the user creating the dm
  *
  * @returns {{dms: dmList}} - An array of dms the user is a member of
  */
function dmListV1(token: string): dmList | error {
  // Check if the given token is invalid
  if (!tokenExists(token)) {
    return { error: 'Token is invalid' };
  }

  const data = getData();
  const uId = getUidFromToken(token);

  // Add the dmId and name of each dm the user is a member of to a list
  const list = [];
  for (const dm of data.dms) {
    if (isMemberOfDm(dm, uId)) {
      list.push({ dmId: dm.dmId, name: dm.name });
    }
  }

  return { dms: list };
}

/**
  * Removes a user from a dm
  *
  * @param {string} token - The session token of the user creating the dm
  * @param {number} dmId - The id of the dm being left
  *
  * @returns {{error: string}} - An error message if the given info is invalid
  * @returns {Object: EmptyObject} {} - An empty object
  */
function dmLeaveV1(token: string, dmId: number): Record<string, never> | error {
  // Check if the dmId is invalid
  if (!dmIdExists(dmId)) {
    return { error: 'dmId is invalid' };
  }

  // Check if the token is invalid
  if (!tokenExists(token)) {
    return { error: 'Token is invalid' };
  }

  const uId = getUidFromToken(token);
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      // Check if the user is a member of the dm
      if (!isMemberOfDm(dm, uId)) {
        return { error: 'User is not a member of the dm' };
      }

      // If they are remove them from the members list
      dmRemoveUser(uId, dmId);
    }
  }

  return {};
}

/**
  * Removes a user from a the members list of a dm
  *
  * @param {number} uId - The id of the user being removed
  * @param {number} dmId - The id of the dm the user is being removed from
  */
function dmRemoveUser(uId: number, dmId: number) {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      // Once the correct dm has been found search its' members
      let removed = false;
      for (let i = 0; i < dm.members.length && !removed; i++) {
        // Find the member and remove them from the members list
        if (dm.members[i].uId === uId) {
          dm.members.splice(i, 1);
          removed = true;
        }
      }
    }
  }
  // Update the dataStore
  setData(data);
}

/**
  * Provides basic details of a dm given the authorised user is a member
  *
  * @param {string} token - The session token of the user creating the dm
  * @param {number} dmId - The unique id of the dm
  *
  * @returns {{error: string}} - An error message if the given info is invalid
  * @returns {{name: string}} - The name of the dm
  * @returns {{members: Array<User>}} - The members list of users in the dm
  */
function dmDetailsV1(token: string, dmId: number): dmDetails | error {
  // Check if the dmId is invalid
  if (!dmIdExists(dmId)) {
    return { error: 'dmId is invalid' };
  }

  // Check if the token is invalid
  if (!tokenExists(token)) {
    return { error: 'Token is invalid' };
  }

  const uId = getUidFromToken(token);

  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      // Check if the user is a member of the dm
      if (!isMemberOfDm(dm, uId)) {
        return { error: 'User is not a member of the dm' };
      }

      // If they are return the dm details
      return {
        name: dm.name,
        members: dm.members
      };
    }
  }
}

/**
  * Returns up to 50 of the most recent messages in a dm, starting from a given index
  *
  * @param {string} token - The session token of the user creating the dm
  * @param {number} dmId - The id of the dm where the messages are
  * @param {number} start - The starting index of the messages being viewed
  *
  * @returns {{error: string}} - An error message if token/uIds is invalid
  * @returns {{messages: Array<Messages>}} - The array of returned messages
  * @returns {{start: number}} - The given starting index of the messages
  * @returns {{end: number}} - The end index of the returned messages
  */
function dmMessagesV1(token: string, dmId: number, start: number): dmMessages | error | boolean {
  // Check if the given information is invalid
  const isInvalid = dmMessagesInfoInvalid(token, dmId, start);
  if (isInvalid !== false) {
    const errorMsg = isInvalid as any;
    throw HTTPError(errorMsg.code, errorMsg.error);
  }

  // If start and number of messages are both 0, return empty message array
  const data = getData();
  const dm = data.dms.find(dm => dm.dmId === dmId);
  const numMessages = dm.messages.length;

  const messages = [];
  let end;
  if (start === 0 && numMessages === 0) {
    end = -1;
  } else {
    // If start and number of messages aren't both 0, add up to 50 messages
    let index = start;
    while (index < numMessages && index < start + 50) {
      messages.unshift(dm.messages[index]);
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
  * Checks if the dm information given is invalid
  *
  * @param {number} token - The token of the user trying to view the messages
  * @param {number} dmId - The id of the dml that has the messages
  * @param {number} start - The starting index of the messages being viewed
  *
  * @returns {{error: string}} - An error message if any parameter is invalid
  * @returns {boolean} - False if the information isn't invalid
  */
function dmMessagesInfoInvalid(token: string, dmId: number, start: number): httpError | boolean {
  // Check if the token is invalid
  if (!(tokenExists(token))) {
    return { code: FORBIDDEN, error: 'Token is invalid' };
  }

  // Check if the dmId is invalid
  if (!(dmIdExists(dmId))) {
    return { code: BAD_REQUEST, error: 'dmId is invalid' };
  }

  // If start is negative or greater than number of messages return error
  if (start < 0) {
    return { code: BAD_REQUEST, error: 'Starting index can\'t be negative' };
  }
  const data = getData();
  const dm = data.dms.find(dm => dm.dmId === dmId);
  const numMessages = dm.messages.length;
  if (start > numMessages) {
    return { code: BAD_REQUEST, error: 'Start index is greater than number of messages in dm' };
  }

  // If channelId is valid but user isn't a member of the channel return error
  const uId = getUidFromToken(token);

  if (!isMemberOfDm(dm, uId)) {
    return { code: FORBIDDEN, error: 'User is not a member of dm' };
  }

  // If no error by now, the info isn't invalid
  return false;
}

/**
  * Checks if the information used to create a new dm is valid
  *
  * @param {string} token - The session token of the user creating the dm
  * @param {Array<number>} uIds - Array of userId's of other users in the dm
  *
  * @returns {{error: string}} - An error message if token/uIds is invalid
  * @returns {boolean} - False if the given info isn't invalid
  */
function dmInfoInvalid(token: string, uIds: Array<number>): error | boolean {
  // Check if any of the given uId's are invalid
  for (const uId of uIds) {
    if (!userIdExists(uId)) {
      return { error: 'One or more given uId\'s doesn\'t exist' };
    }
  }
  if (containsDuplicates(uIds)) {
    return { error: 'A duplicate uId has been given' };
  }

  // Check if the given token is invalid
  if (!tokenExists(token)) {
    return { error: 'Token is invalid' };
  }

  // If no errors then return false
  return false;
}

/**
  * Construct the dm object using the given information
  *
  * @param {string} token - The session token of the user creating the dm
  * @param {Array<number>} uIds - Array of userId's of other users in the dm
  *
  * @returns {{error: string}} - An error message if token/uIds is invalid
  * @returns {boolean} - False if the given info isn't invalid
  */
function constructDm(token: string, uIds: Array<number>): dmInfo {
  // Find the handle strings of all users in the dm and sort them alphabetically
  const data = getData();
  const handles = [];
  const creatorId = getUidFromToken(token);
  uIds.push(creatorId);
  for (const user of data.users) {
    if (uIds.includes(user.uId) || user.uId === creatorId) {
      handles.push(user.handleStr);
    }
  }
  handles.sort();

  // Generate the name of the dm by appending all the handles together
  let name = '';
  for (let i = 0; i < handles.length; i++) {
    if (i === handles.length - 1) {
      name += handles[i];
    } else {
      name += (handles[i] + ', ');
    }
  }

  // Add the creator to the members list

  const members = [];

  // Add the other users in the dm to the members list
  for (const uId of uIds) {
    for (const user of data.users) {
      if (user.uId === uId) {
        members.push({
          uId: uId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr
        });
      }
    }
  }

  // Construct the dm object
  data.messageCount += 1;
  const dm = {
    dmId: data.messageCount,
    name: name,
    creator: creatorId,
    members: members,
    messages: []
  };

  return dm;
}

/**
  * Creates a message and stores it in the messages array in a dm
  *
  * @param {string} token - token of authorised user
  * @param {number} dmId - id of dm to send message to
  * @param {string} message - message to send
  * ...
  *
  * @returns {messageId} returns an object containing the messageId
*/
export function messageSendDmV1 (token: string, dmId: number, message: string): messageId | error {
  const data = getData();
  const findDm = data.dms.find(dm => dm.dmId === dmId);

  if (!(tokenExists(token))) {
    throw HTTPError(403, 'token is invalid');
  }
  if (!dmIdExists(dmId)) {
    throw HTTPError(400, 'dmId is invalid');
  }

  // Check if length of the message is between 1-1000 characters long.
  // Create message if true, return error if false.
  if (message.length < MIN_MESSAGE_LEN || message.length > MAX_MESSAGE_LEN) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }

  const uId = getUidFromToken(token);
  if (!isMemberOfDm(findDm, uId)) {
    throw HTTPError(403, 'user is not a member of the dm');
  }

  // Create message
  const messageId = getMessageId();
  const timeSent = Math.floor((new Date()).getTime() / 1000);
  const messageObj = {
    messageId: messageId,
    uId: uId,
    message: message,
    timeSent: timeSent,
  };

  storeMessageInDm(messageObj, dmId);

  return { messageId: messageId };
}

function storeMessageInDm(message: Message, dmId: number) {
  const data = getData();

  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      dm.messages.push(message);
    }
  }

  setData(data);
}

function containsDuplicates(array) {
  if (array.length !== new Set(array).size) {
    return true;
  }
  return false;
}

export { dmCreateV1, dmDetailsV1, dmMessagesV1, dmListV1, dmLeaveV1, dmRemoveV1 };
