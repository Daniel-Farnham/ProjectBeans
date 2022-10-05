import { getData, setData } from './dataStore.js';
import validator from 'validator';

const MAX_HANDLE_LEN = 20;

// authLoginV1 function with stub response
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

// authRegisterV1 function with implementation
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

// Check if the information used to register a new account is valid
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

// Check if a handle string exists in database
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

// Generate a unique handle string
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

export { authLoginV1, authRegisterV1 };