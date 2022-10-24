import { getData, setData } from './dataStore';
import { userIdExists, tokenExists, User, error } from './other';

/**
  * Returns user object if a valid user is found
  *
  * @param {string} token - token session for user requesting profile
  * @param {number} uId - uId of user to search
  *
  * @returns {user} - Returns object with valid user ID, email, first name, last name,
  * and handle
*/
function userProfileV1 (token: string, uId: number): error | { user: User } {
  // If either uId or token does not exist, then return error
  if (!tokenExists(token) || !userIdExists(uId)) {
    return { error: 'token/uId to search is invalid' };
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

/**
  * Returns object containing an array of user objects if valid token provided
  *
  * @param {string} token - token session for user requesting all users
  *
  * @returns { users } - Returns array of objects with valid user ID, email,
  *                      first name, last name, and handle string
  * and handle
*/
export function usersAllV1 (token: string): error | {users: any[]} {
  // If token invalid, return error
  if (!tokenExists(token)) {
    return { error: 'token provided is invalid' };
  }
  const data = getData();

  const users = [];

  for (const user of data.users) {
    users.push(
      {
        uId: user.uId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr,
      }
    );
  }
  return { users };
}

/**
  * Returns user object if a valid user is found
  *
  * @param {string} token - token session for user requesting profile
  * @param {string} nameFirst - user's first name to change to
  * @param {string} nameLast - user's last name to change to
  *
  * @returns {{}} - Returns empty object upon successful name change
*/
export function userProfileSetNameV1 (token: string, nameFirst: string, nameLast: string): error | {} {
  if (!tokenExists(token)) {
    return { error: 'token provided is invalid' };
  }
  
  if (!validName(nameFirst) || !validName(nameLast)) {
    return { error: 'length of nameFirst/nameLast is not between 1 and 50' };
  }
  
  // Update user profile for matching user with new names
  const uId = getUidFromToken(token);
  
  const data = getData();
  for (let user of data.users) {
    if (user.uId === uId) {
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
    }
  }

  setData(data);
  return {};
}

function validName(name: string): boolean {
  if (name.length >= 1 && name.length <= 50) {
    return true;
  }
  return false;
}

function getUidFromToken (token: string) {
  const data = getData();

  for (const session of data.sessions) {
    if (session.tokens.includes(token)) {
      return session.uId;
    }
  }
}

export { userProfileV1 };
