import { getData, setData } from './dataStore';
import { error, tokenExists, userIdExists } from './other';
import { getUidFromToken } from './users';

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
    if (dm.members.includes(uId)) {
      list.push({ dmId: dm.dmId, name: dm.name});
    }
  }

  return { dms: list };
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

  // Add all the members to the members list
  const members = [creatorId];
  for (const uId of uIds) {
    members.push(uId);
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

export { dmCreateV1, dmListV1 };
