import { getData } from './dataStore.js';

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
    if (channel.id === channelId) {
      return true;
    }
  }
  return false;
}

export { channelIdExists };