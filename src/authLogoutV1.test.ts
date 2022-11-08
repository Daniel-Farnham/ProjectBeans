import { getRequest, postRequest, deleteRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const INVALID_TOKEN = 403;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing successful cases for authLogoutV1', () => {
  test('Testing returning empty object upon successful logout', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'password',
      nameFirst: 'Hang',
      nameLast: 'Pham'
    });

    const result = postRequest(SERVER_URL + '/auth/logout/v1', {
      token: user.token,
    });

    expect(result).toStrictEqual({});
  });

  test('Testing unsuccessful user profile access when using token that is no longer valid', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'password',
      nameFirst: 'Hang',
      nameLast: 'Pham'
    });

    postRequest(SERVER_URL + '/auth/logout/v1', {
      token: user.token,
    });

    const result = getRequest(SERVER_URL + '/user/profile/v2', {
      token: user.token,
      uId: user.authUserId,
    });

    expect(result.statusCode).toBe(INVALID_TOKEN);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });

  });

  test('Testing ability to login with another token if logged out of one token', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'password',
      nameFirst: 'Hang',
      nameLast: 'Pham'
    });

    const loggedInSession = postRequest(SERVER_URL + '/auth/login/v2', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'password'
    });

    postRequest(SERVER_URL + '/auth/logout/v1', {
      token: user.token,
    });

    const result = getRequest(SERVER_URL + '/user/profile/v2', {
      token: loggedInSession.token,
      uId: user.authUserId,
    });

    const expectedResult = {
      user: {
        uId: user.authUserId,
        email: 'hang.pham1@student.unsw.edu.au',
        nameFirst: 'Hang',
        nameLast: 'Pham',
        handleStr: 'hangpham',
      }
    };
    expect(result).toMatchObject(expectedResult);
  });
});

describe('Testing authLogoutV1 error handling', () => {
  test.each([
    { token: 'InvalidToken', desc: 'Testing invalid token' },
  ])('$desc', ({ token }) => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'password',
      nameFirst: 'Hang',
      nameLast: 'Pham'
    });

    const result = postRequest(SERVER_URL + '/auth/logout/v1', {
      token: user.token + token,
    });

    expect(result).toMatchObject({ error: expect.any(String) });
  });
});
