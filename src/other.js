import { getData } from './dataStore.js';
import { validator } from 'validator';

// Check if userId exists in database
function userIdExists(userId) {
  const data = getData();
  
  // Loop through users array to check if user exists
  for (const user of data.users) {
    if (user.id === userId) {
      return true;
    }
  }
  return false;
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

// Check if the information used to register a new account is valid
function registerInfoInvalid(email, password, nameFirst, nameLast, data) {
  let isInvalid = false;
  // Check whether email, password and first/last name meet the criteria
  if (!(validator(email)) || password.length < 6 || 
      nameFirst.length < 1 || nameFirst.length > 50 ||
      nameLast.length < 1 || nameLast.length > 50) {
    
    isInvalid = true;
  }
  
  // Check if the email is in use
  for (const user of data.users) {
    if (email === user.email) {
      isInvalid = true;
    }
  }
  
  return isInvalid;
}

// Check if a handle string exists in database
function handleExists(handleStr, data) {
  // Loop through users array to check if the handle already exists
  for (const user in data.users) {
    if (user.handleStr === handleStr) {
      return true;
    }
  }
  return false;
}

export { userIdExists, channelIdExists, registerInfoInvalid, handleExists };