import { getData, setData } from './dataStore.js';

/**
  * Function to clear the data store object
  * @param {}  - no parameters required
  * @returns {} - returns empty object
*/
function clearV1 () {
  let data = {
    users: [],
    channels: [],
  };
  setData(data);
  return {};
}

/**
  * Checks if the user id is registered in the database.
  * @param {number} userId - userId to check
  * @returns {Boolean} - returns true if exists, false otherwise
*/
function userIdExists(userId) {
  const data = getData();
  
  // Loop through users array to check if user exists
  for (const user of data.users) {
    if (user.uId === userId) {
      return true;
    }
  }
  return false;
}

/**
  * Checks if the channel id exists in the database.
  * @param {number} channelId - channelId to check
  * @returns {boolean} - true if channel exists, false otherwise
*/
function channelIdExists(channelId) {
  const data = getData();
  
  // Loop through channels array to check if channel exists
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return true;
    }
  }
  return false;
}
/** 
  *  Check if a user is a member of a channel
  * @param {number} uId - uId to check 
  * @param {number} channel - channel object 
  * 
  * @returns {boolean} - true if user is member, false otherwise
*/
function isMemberOfChannel(channel, uId) {
  const data = getData();
  // Loop through all members of channel 
  // if user is found, then return true
  for (const member of channel.allMembers) {
    if (member.uId === uId) {
      return true;
    }
  } 
  return false;
}

export { userIdExists, channelIdExists, clearV1, isMemberOfChannel };