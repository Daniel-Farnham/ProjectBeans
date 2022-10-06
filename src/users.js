import { getData } from './dataStore.js';
import { userIdExists } from './other.js';

// userProfileV1 function
// Parameters: authUserId, uId
// Return: Returns valid user ID, email, first name, last name, and handle
function userProfileV1 (authUserId, uId) {
  // Check if authUserId exists
  if (userIdExists(authUserId)) {
    // Check if userId to search exists, then return user data
    if (userIdExists(uId)) {
      const data = getData();
      for (const user of data.users) {
        if (user.uId === uId) {
          return user;
        }
      }
    } else {
      return { error: "userId to search is invalid" };
    }
  } else {
    return { error: "authUserId is invalid" };
  }
};

export { userProfileV1 };