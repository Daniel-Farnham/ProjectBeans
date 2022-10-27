import { isMemberName } from 'typescript';
import { getData, setData } from './dataStore';
import { error, tokenExists, userIdExists, getUidFromToken } from './other';

type dmInfo = { 
  dmId: number,
  name: string,
  creator: number,
  members: Array<number>
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
      if (!isMemberOfChannel(dm, uId)) {
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

export { dmCreateV1, dmLeaveV1 };