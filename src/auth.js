// authLoginV1 function with stub response
function authLoginV1(authUserId, email, password) {
  // If a user exists with matching email and password, return authUserId
  const data = getData();
  for (const user of data.users) {
    if (user.email === email && user.password === password) {
      return { authUserId: user.uId };
    }
  }

  // If haven't returned yet, email isn't registered or password is wrong
  return { error: 'error' };
}

// authRegisterV1 function with stub response
function authRegisterV1(email, password, nameFirst, nameLast) {
    return {
        authUserId: 1,
    };
}

export { authLoginV1, authRegisterV1 };