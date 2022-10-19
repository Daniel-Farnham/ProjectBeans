import { getData, setData } from './dataStore';
import validator from 'validator';
import { error } from './other';

const MAX_HANDLE_LEN = 20;
const GLOBAL_OWNER = 1;
const GLOBAL_MEMBER = 2;
const MIN_PASSWORD_LEN = 6;
const MIN_NAME_LEN = 1;
const MAX_NAME_LEN = 50;

type authInfo = { token: string, authUserId: number };

/**
  * Will attempt to login to an account with the given email and password,
  * returning an object containing the user's id.
  *
  * @param {string} email - The email of the account being logged in to
  * @param {string} password - The password of the account being logged in to
  *
  * @returns {{error: string}} - An error message if email/password is invalid
  * @returns {{authUserId: number}} - The user id of the logged in account
  */
function authLoginV1(email: string, password: string): authInfo | error {
  // If a user exists with matching email and password, return authUserId
  // If email matches, but password is wrong return an error
  const data = getData();
  const caseInsensitiveEmail = email.toLowerCase();
  for (const user of data.users) {
    if (user.email === caseInsensitiveEmail && user.password === password) {
      const userId = user.uId;
      const token = generateToken();

      // Once we have found the user to log into, locate their session info
      // and add a new token for this login
      for (const user of data.sessions) {
        if (user.uId === userId) {
          user.tokens.push(token);
        }
      }

      return { token: token, authUserId: userId };
    } else if (user.email === caseInsensitiveEmail && user.password !== password) {
      return { error: 'Incorrect password.' };
    }
  }

  // If haven't returned yet, email doesn't belong to a user
  return { error: 'Email doesn\'t belong to a user.' };
}

/**
  * Will attempt to register a new account with the given information, returning
  * an object containing the user's new unique id.
  *
  * @param {string} email - The email of the account being registered
  * @param {string} password - The password of the account being registered
  * @param {string} nameFirst - The users first name
  * @param {string} nameFirst - The users last name
  *
  * @returns {{error: string}} - An error message if any parameter is invalid
  * @returns {{authUserId: number}} - The user id of the registered account
  */
function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string): authInfo | error | boolean {
  // Check if the given information is valid, then generate a unique handle
  const isInvalid = registerInfoInvalid(email, password, nameFirst, nameLast);
  if (isInvalid !== false) {
    // isInvalid returns false for valid info or an error message otherwise
    return isInvalid;
  }

  const handleStr = generateHandle(nameFirst, nameLast);

  // Add the new user to the database
  const data = getData();
  const userId = data.users.length;
  const caseInsensitiveEmail = email.toLowerCase();

  let permissionId = GLOBAL_MEMBER;
  if (userId === 0) {
    permissionId = GLOBAL_OWNER;
  }

  const user = {
    uId: userId,
    email: caseInsensitiveEmail,
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: handleStr,
    password: password,
    permissionId: permissionId
  };

  data.users.push(user);

  // Add the new token to the database
  const token = generateToken();

  const sessionInfo = {
    uId: userId,
    tokens: [token]
  };

  data.sessions.push(sessionInfo);

  setData(data);

  return {
    token: token,
    authUserId: userId
  };
}

/**
  * Checks if the information used to register a new account is valid
  *
  * @param {string} email - The email of the account being registered
  * @param {string} password - The password of the account being registered
  * @param {string} nameFirst - The users first name
  * @param {string} nameFirst - The users last name
  *
  * @returns {{error: string}} - An error message if any parameter is invalid
  * @returns {boolean} - False if the information isn't invalid
  */
function registerInfoInvalid(email: string, password: string, nameFirst: string, nameLast: string): error | boolean {
  // Check whether email, password and first/last name meet the criteria
  if (!(validator.isEmail(email))) {
    return { error: 'Invalid email.' };
  }
  if (password.length < MIN_PASSWORD_LEN) {
    return { error: 'Password is less than 6 characters.' };
  }
  if (nameFirst.length < MIN_NAME_LEN || nameFirst.length > MAX_NAME_LEN) {
    return { error: 'First name isn\'t between 1 and 50 characters (inclusive)' };
  }
  if (nameLast.length < MIN_NAME_LEN || nameLast.length > MAX_NAME_LEN) {
    return { error: 'Last name isn\'t between 1 and 50 characters (inclusive)' };
  }

  // Check if the email is in use
  const data = getData();
  const caseInsensitiveEmail = email.toLowerCase();
  for (const user of data.users) {
    if (caseInsensitiveEmail === user.email) {
      return { error: 'Email is already in use.' };
    }
  }

  // If no errors then return false
  return false;
}

/**
  * Checks if a handle string exists in the database
  *
  * @param {string} handleStr - The generated handle for a new account
  *
  * @returns {boolean} - True if the handle already exists, false otherwise
  */
function handleExists(handleStr: string): boolean {
  // Loop through users array to check if the handle already exists
  const data = getData();
  for (const user of data.users) {
    if (user.handleStr === handleStr) {
      return true;
    }
  }
  return false;
}

/**
  * Generates a unique handle string
  *
  * @param {string} nameFirst - The users first name
  * @param {string} nameLast - The users last name
  *
  * @returns {string} - A unique handle made from the first and last name
  */
function generateHandle(nameFirst: string, nameLast: string): string {
  // Create an alphanumeric handle string of length <= 20
  let handleStr = (nameFirst + nameLast).toLowerCase();
  handleStr = handleStr.replace(/[^a-z0-9]/gi, '');
  if (handleStr.length > MAX_HANDLE_LEN) {
    handleStr = handleStr.substring(0, MAX_HANDLE_LEN);
  }

  // If the handle's in use, append the smallest number that makes it unique
  const originalLength = handleStr.length;
  let num = 0;
  while (handleExists(handleStr)) {
    // Reset the handle and increment the number at the end until it's unique
    handleStr = handleStr.substring(0, originalLength);
    handleStr = handleStr + num.toString();
    num++;
  }

  return handleStr;
}

/**
  * Generates a unique token
  *
  * @returns {string} - A unique token
  */
function generateToken(): string {
  const data = getData();

  // Find the token with the greatest value then add 1 so our new token is unique
  let newToken = 0;
  for (const user of data.sessions) {
    for (const token of user.tokens) {
      if (parseInt(token) > newToken) {
        newToken = parseInt(token);
      }
    }
  }
  newToken++;

  return newToken.toString();
}

export { authLoginV1, authRegisterV1 };
