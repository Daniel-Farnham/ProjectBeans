import { getData } from './dataStore.js';


// Check if userId exists in database
function userIdExists(userId) {
  const data = getData();
  
  // Loop through users array to check if user exists
  for (const user of data.users) {
    if (user.id === userId) {
      return true;
    }
  }
  return false;
}

/**
  * Check if channelId exists in database
  * 
  * @param {number} channelId - channelId to check
  * 
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

export { userIdExists, channelIdExists };