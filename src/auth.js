import { getData, setData } from './dataStore.js';
import { registerInfoInvalid, handleExists } from './other.js';

// authLoginV1 function with stub response
function authLoginV1(authUserId, email, password) {
    return {
        authUserId: 1,
    };
}

// authRegisterV1 function with implementation
function authRegisterV1(email, password, nameFirst, nameLast) {
  // Check if the given information is valid
  const data = getData();
  if (!(registerInfoInvalid(email, password, nameFirst, nameLast, data))) {
    return { error: 'error '};
  }

  // Create the alphanumeric handle string
  const handleStr = (nameFirst + nameLast).toLowerCase();
  handleStr = handleStr.replace(/[^a-z0-9]/gi, '');
  if (handleStr.length > 20) {
    handleStr = handleStr.replace(0, 20);
  }

  // If the handle's in use, append the smallest number that makes it unique
  let num = 0;
  while (handleExists(handleStr, data)) {
    // Reset the handle and increment the number at the end until it's unique
    handleStr = handleStr.replace(0, 20);
    handleStr = handleStr + num.toString();
    num++;
  }

  // Add the new user to the database
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

export { authLoginV1, authRegisterV1 };