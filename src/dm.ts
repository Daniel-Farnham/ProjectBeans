import { getData, setData } from './dataStore';
import { error, tokenExists, userIdExists, getUidFromToken, Messages, isMemberOfChannel } from './other';

type dmInfo = { 
  dmId: number,
  name: string,
  creator: number,
  members: Array<number>
};

type dmMessages = {
  messages: Array<Messages>,
  start: number,
  end: number
};

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
    return isInvalid;
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
    let index = 0;
    while (index < numMessages && index < start + 50) {
      messages.push(dm.messages[index]);
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
  * Checks if the dm information given is invalid
  *
  * @param {number} token - The token of the user trying to view the messages
  * @param {number} dmId - The id of the dml that has the messages
  * @param {number} start - The starting index of the messages being viewed
  *
  * @returns {{error: string}} - An error message if any parameter is invalid
  * @returns {boolean} - False if the information isn't invalid
  */
 function dmMessagesInfoInvalid(token: string, dmId: number, start: number): error | boolean {
  // Check if the token is invalid
  if (!(tokenExists(token))) {
    return { error: 'Token is invalid' };
  }

  // Check if the dmId is invalid
  if (!(dmIdExists(dmId))) {
    return { error: 'dmId is invalid' };
  }

  // If start is negative or greater than number of messages return error
  if (start < 0) {
    return { error: 'Starting index can\'t be negative' };
  }
  const data = getData();
  const dm = data.dms.find(dm => dm.dmId === dmId);
  const numMessages = dm.messages.length;
  if (start > numMessages) {
    return { error: 'Start index is greater than number of messages in dm' };
  }

  // If channelId is valid but user isn't a member of the channel return error
  const uId = getUidFromToken(token);

  if (!isMemberOfChannel(dm, uId)) {
    return { error: 'User is not a member of channel' };
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

export { dmCreateV1, dmMessagesV1 };
