import { getData } from './dataStore.js';

// Check if userId exists in database
function userIdExists(userId) {
  const data = getData();
  
  // Loop through users array to check if user exists
  for (let user of data.users) {
    if (user.id === userId) {
      return true;
    }
  }
  return false;
};
