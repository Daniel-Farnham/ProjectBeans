import { getData, setData } from './dataStore.js';

// Function to clear the data store object
function clearV1 () {
  let data = {
    users: [],
    channels: [],
  };
  setData(data);
  return {};
}

// Check if channelId exists in database
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

export { channelIdExists, clearV1 };
