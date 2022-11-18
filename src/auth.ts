import { getData, setData } from './dataStore';
import validator from 'validator';
import { error, tokenExists } from './other';
import crypto from 'crypto';
import HTTPError from 'http-errors';
import { internalNotification } from './types';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

const MAX_HANDLE_LEN = 20;
const GLOBAL_OWNER = 1;
const GLOBAL_MEMBER = 2;
const MIN_PASSWORD_LEN = 6;
const MIN_NAME_LEN = 1;
const MAX_NAME_LEN = 50;
export const GLOBAL_SECRET = "YouAren'tGettingIn!";

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
  const hashedPassword = getHashOf(password);
  for (const user of data.users) {
    if (user.email === caseInsensitiveEmail && user.password === hashedPassword) {
      const userId = user.uId;
      const token = generateToken();

      // Once we have found the user to log into, locate their session info
      // and add a new token for this login
      for (const user of data.sessions) {
        if (user.uId === userId) {
          user.tokens.push(token.hash);
        }
      }

      return { token: token.token, authUserId: userId };
    } else if (user.email === caseInsensitiveEmail && user.password !== hashedPassword) {
      throw HTTPError(400, 'Incorrect password.');
    }
  }

  // If haven't returned yet, email doesn't belong to a user
  throw HTTPError(400, 'Email doesn\'t belong to a user.');
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

  // Make the first registered user a global owner and
  // initialize the workplace analytics
  let permissionId = GLOBAL_MEMBER;
  if (userId === 0) {
    permissionId = GLOBAL_OWNER;
    createAnalytics();
  }

  const user = {
    uId: userId,
    email: caseInsensitiveEmail,
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: handleStr,
    profileImgUrl: SERVER_URL + '/static/defaultpic.jpg',
    password: getHashOf(password),
    permissionId: permissionId
  };

  data.users.push(user);

  const notification: internalNotification = {
    uId: userId,
    notifications: [],
  };
  data.notifications.push(notification);

  // Add the new token to the database
  const token = generateToken();

  const sessionInfo = {
    uId: userId,
    tokens: [token.hash]
  };

  data.sessions.push(sessionInfo);

  setData(data);

  return {
    token: token.token,
    authUserId: userId
  };
}

/**
  * Creates the initial workplace analytics when the
  * first user is registered
  *
  */
function createAnalytics() {
  const data = getData();
  const timeSent = Math.floor((new Date()).getTime() / 1000);
  const channelStats = { numChannelsExist: 0, timeStamp: timeSent };
  const dmsStats = { numDmsExist: 0, timeStamp: timeSent };
  const msgStats = { numMessagesExist: 0, timeStamp: timeSent };
  data.workspaceStats.channelsExist.push(channelStats);
  data.workspaceStats.dmsExist.push(dmsStats);
  data.workspaceStats.messagesExist.push(msgStats);
  setData(data);
}

/**
  * Will attempt to logout of a session with the token provided
  *
  * @param {string} token - token of user to be logged out
  *
  * @returns {{}} - empty object upon successful logout
  */
export function authLogoutV1 (token: string): Record<string, never> | error {
  if (!tokenExists(token)) {
    throw HTTPError(403, 'Token provided is invalid');
  }

  const data = getData();

  // Filter out the token from the user's sessions
  const hashedToken = getHashOf(token + GLOBAL_SECRET);
  for (const session of data.sessions) {
    session.tokens = session.tokens.filter(
      (activeToken: string): activeToken is string => activeToken !== hashedToken);
  }

  setData(data);

  return {};
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
    throw HTTPError(400, 'Invalid email.');
  }
  if (password.length < MIN_PASSWORD_LEN) {
    throw HTTPError(400, 'Password is less than 6 characters.');
  }
  if (nameFirst.length < MIN_NAME_LEN || nameFirst.length > MAX_NAME_LEN) {
    throw HTTPError(400, 'First name isn\'t between 1 and 50 characters (inclusive)');
  }
  if (nameLast.length < MIN_NAME_LEN || nameLast.length > MAX_NAME_LEN) {
    throw HTTPError(400, 'Last name isn\'t between 1 and 50 characters (inclusive)');
  }

  // Check if the email is in use
  const data = getData();
  const caseInsensitiveEmail = email.toLowerCase();
  for (const user of data.users) {
    if (caseInsensitiveEmail === user.email) {
      throw HTTPError(400, 'Email is already in use.');
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
function generateToken(): any {
  const data = getData();

  const newToken = data.tokenCount;

  data.tokenCount += 1;
  setData(data);

  const msg = newToken.toString() + GLOBAL_SECRET;
  return {
    token: newToken.toString(),
    hash: getHashOf(msg),
  };
}

/**
 * Return hash of plaintext string
 *
 *  @param {string} plaintext - plaintext string
 *
 * @returns {string} - A unique hash
 */
export function getHashOf(plaintext: string) {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

export { authLoginV1, authRegisterV1 };

/**
 * Sends an email to a user with a resetCode provided
 *
 * @param {string} email
 * @returns {}
 */

export async function authPasswordResetRequestV1(email: string) {
  const nodeEmail = require('nodemailer');
  const data = getData();

  const testAccount = await nodeEmail.createTestAccount();
  const resetCode = generateResetCode();

  data.resetCodeRequests.push({
    email: email,
    resetCode: resetCode
  });

  const sending = nodeEmail.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  try {
    await sending.sendMail({
      from: '"Some Guy" <BEANS.W17C.BOOST@gmail.com>',
      to: email,
      subject: 'Password Reset Request for UNSW Beans Account',
      text: 'Hi, We have received a password change request for your account with UNSW Beans. Please use this code to reset the password:' +
      resetCode + 'Thank you, UNSW Beans Team'
    });
  } catch (err) {
    console.log('Sending email has an error');
  }

  const user = data.users.find((user) => user.email === email);

  for (const session of data.sessions) {
    if (session.uId === user.uId) {
      session.tokens = [];
    }
  }
  setData(data);
  return {};
}

/**
 * Generates a reset code which is stored in dataStore
 * @returns {resetCode}
 */
function generateResetCode(): any {
  const data = getData();

  const newCode = data.resetCode;

  data.resetCode += 1;
  setData(data);

  const msg = newCode.toString() + 'resetCode';
  return { resetCode: getHashOf(msg).slice(0, 6) };
}
