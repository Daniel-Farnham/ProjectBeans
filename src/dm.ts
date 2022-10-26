import { transpileModule } from 'typescript';
import { getData, setData } from './dataStore';
import { error, tokenExists, userIdExists } from './other';
import { getUidFromToken } from './users';

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
    return isInvalid;
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
function removeInfoInvalid(token: string, dmId: number): error | boolean {
  const data = getData();

  // Check if the dmId is invalid
  if (!dmIdExists(dmId)) {
    return { error: 'dmId is invalid' };
  }

  // Check if the token is invalid
  if (!tokenExists(token)) {
    return { error: 'Token is invalid' };
  }

  // Check if the authorised user is the dm creator
  // If they are, check if they're still a member of the dm
  const uId = getUidFromToken(token);
  let isMember = false;
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      if (dm.creator !== uId) {
        return { error: 'Authorised user isn\'t the dm creator' };
      } else if (dm.members.includes(uId)) {
        isMember = true;
      }
    }
  }

  if (!isMember) {
    return { error: 'Authorised user is not a member of the dm'}
  }

  return false;
}

/**
  * Checks if a given dmId exists
  *
  * @param {number} dmId - Unique id of a dm
  *
  * @returns {boolean} - True of false if the id exists or not
  */
function dmIdExists(dmId: number): boolean {
  const data = getData();

  // Loop through dms array to check if dmId exists
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      return true;
    }
  }
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

export { dmCreateV1, dmRemoveV1 };
