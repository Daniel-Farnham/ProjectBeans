import { getData } from './dataStore.js';

// Check if channelId exists in database
function channelIdExists(channelId) {
  const data = getData();

  // Loop through channels array to check if channel exists
  for (let channel of data.channels) {
    if (channel.id === channelId) {
      return true;
    }
  }
  return false;
};

