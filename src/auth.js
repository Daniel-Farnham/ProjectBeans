import { getData, setData } from 'dataStore.js';
import { validator } from 'validator';

// authLoginV1 function with stub response
function authLoginV1(authUserId, email, password) {
    return {
        authUserId: 1,
    };
}

// authRegisterV1 function with implementation
function authRegisterV1(email, password, nameFirst, nameLast) {
    // error when email is not valid
    // error when email is already in use
    // error when password is < 6 characters
    // error when length of nameFirst or nameLast is not between 1 and 50 inclusive

  if (!(validator(email))) {
    return { error: 'error '};
  }
  const data = getData();
  for (const user of data.users) {
    if (email === user.email) {
      return { error: 'error '};
    }
  }
  if (password.length < 6) {
    return { error: 'error '};
  }
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return { error: 'error '};  
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    return { error: 'error '};  
  }

  // concatenate lower case alphanumeric first and last name (make lowercase, remove non-AN)
  // if >20 chars, cut off at 20 chars
  // if handle already exists add a number on the end
  // added number CAN be >20 chars

  const handleStr = (nameFirst + nameLast).toLowerCase();
  // found this method on google, need to check if it's okay to use (removes non-alphanumeric chars)
  handleStr = handleStr.replace(/[^a-z0-9]/gi, '');
  // cut off at 20 characters
  if (handleStr.length > 20) {
    handleStr = handleStr.replace(0, 20);
  }
  // check if the handle already exists, for each character of the string check for numbers
  // if no numbers then handle is fine to be added, if numbers exist add 1 to the number and then to the handle
  // make sure the numbers that are actually strings are treated properly
  let handleExists = false;
  let existingHandle;
  for (const user of data.users) {
    if (handleStr === user.handleStr) {
      handleExists = true;
      existingHandle = user.handleStr;
    }
  }

  // take the existing handle and remove all characters
  if (handleExists) {
    existingHandle = existingHandle.replace(/[^0-9]/gi, '');
  }
  // add 1 to the num
  let handleNum = pasreInt(existingHandle) + 1;
  // add it to the end of our handle
  handleStr += handleNum.toString();

  // make unique userId
  const userId = data.users.length;
  
  const user = {
    uId: userId,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: handleStr
  };

  data.users.push(user);
  setData(data);

  return {
    authUserId: userId,
  };
}

export { authLoginV1, authRegisterV1 };