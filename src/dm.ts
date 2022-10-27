import { getData, setData } from './dataStore';
import { error, tokenExists, userIdExists, getUidFromToken, dmIdExists, isMemberOfDm, getMessageId } from './other';

type dmInfo = { 
  dmId: number,
  name: string,
  creator: number,
  members: Array<number>
};

interface Message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
}

type messageId = { messageId: number }

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
  const data = getData();
  for (const uId of uIds) {
    if (!userIdExists(uId)) {
      return { error: 'One or more given uId\'s doesn\'t exist' };
    }
  }

  // Create an array that stores the number of times each uId occurs in uIds
  const idCount = [];
  for (let i = 0; i < uIds.length; i++) {
    idCount[i] = 0;
  }

  // For each uId, loop through uIds to count how many times it occurs
  for (const uId of uIds) {
    for (let i = 0; i < uIds.length; i++) {
      if (uIds[i] === uId) {
        uIds[i]++;
      }
    }
  }

  // Check if there are any duplicate uId's
  for (const count of idCount) {
    if (count > 1) {
      return { error: 'A duplicate uId has been given' };
    }
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
  for (const user of data.users) {
    if (user.uId === creatorId) {
      members.push({
        uId: creatorId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr
      });
    }
  }

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
  data.messageCount++;
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
    return { error: 'token is invalid.' };
  }
  if (!dmIdExists(dmId)) {
    return { error: 'dmId is invalid' };
  }

  // Check if length of the message is between 1-1000 characters long.
  // Create message if true, return error if false.
  if (message.length < MIN_MESSAGE_LEN || message.length > MAX_MESSAGE_LEN) {
    return { error: 'length of message is less than 1 or over 1000 characters' };
  }

  const uId = getUidFromToken(token);
  if (!isMemberOfDm(findDm, uId)) {
    return { error: 'user is not a member of the dm' };
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

export { dmCreateV1 };

