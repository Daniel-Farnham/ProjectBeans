import { getData, setData } from './dataStore.js';
import validator from 'validator';

const MAX_HANDLE_LEN = 20;

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
function authLoginV1(email, password) {
  // If a user exists with matching email and password, return authUserId
  const data = getData();
  for (const user of data.users) {
    if (user.email === email && user.password === password) {
      return { authUserId: user.uId };
    } else if (user.email === email && user.password !== password) {
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
function authRegisterV1(email, password, nameFirst, nameLast) {
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
  const user = {
    uId: userId,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: handleStr,
    password: password
  };

  data.users.push(user);
  setData(data);

  return {
    authUserId: userId,
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
function registerInfoInvalid(email, password, nameFirst, nameLast) {
  // Check whether email, password and first/last name meet the criteria
  if (!(validator.isEmail(email))) {
    return { error: 'Invalid email.' };
  }
  if (password.length < 6) {
    return { error: 'Password is less than 6 characters.' };
  }
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return { error: 'First name isn\'t between 1 and 50 characters (inclusive)' };
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    return { error: 'Last name isn\'t between 1 and 50 characters (inclusive)' };
  }
  
  // Check if the email is in use
  const data = getData();
  for (const user of data.users) {
    if (email === user.email) {
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
function handleExists(handleStr) {
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
function generateHandle(nameFirst, nameLast) {
  // Create an alphanumeric handle string of length <= 20
  let handleStr = (nameFirst + nameLast).toLowerCase();
  handleStr = handleStr.replace(/[^a-z0-9]/gi, '');
  if (handleStr.length > MAX_HANDLE_LEN) {
    handleStr = handleStr.substring(0, MAX_HANDLE_LEN);
  }
  
  // If the handle's in use, append the smallest number that makes it unique
  let originalLength = handleStr.length;
  let num = 0;
  while (handleExists(handleStr)) {
    // Reset the handle and increment the number at the end until it's unique
    handleStr = handleStr.substring(0, originalLength);
    handleStr = handleStr + num.toString();
    num++;
  }

  return handleStr;
}

<<<<<<< HEAD
export { authRegisterV1 };
=======
export { authLoginV1, authRegisterV1 };
>>>>>>> master
