import { getData } from './dataStore';
import { userIdExists, User, error } from './other';

/**
  * Returns user object if a valid user is found
  *
  * @param {number} authUserId - uId of authorised user requesting profile
  * @param {number} uId - uId of user to search
  *
  * @returns {user} - Returns object with valid user ID, email, first name, last name,
  * and handle
*/
function userProfileV1 (authUserId: number, uId: number): error | { user: User } {
  // If either uId or authUserId does not exist, then return error
  if (!userIdExists(authUserId) || !userIdExists(uId)) {
    return { error: 'authUserId/uId to search is invalid' };
  }

  // Retrieve user profile for matching user
  const data = getData();
  for (const user of data.users) {
    if (user.uId === uId) {
      return {
        user: {
          uId: user.uId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr,
        }
      };
    }
  }
}

export { userProfileV1 };
