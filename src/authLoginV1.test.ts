import { getRequest, postRequest, deleteRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const INVALID_PARAM = 400;

function clearV1() {
  return deleteRequest(SERVER_URL + '/clear/v1', {});
}

function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  return postRequest(SERVER_URL + '/auth/register/v3', { email, password, nameFirst, nameLast });
}

function authLoginV1(email: string, password: string) {
  return postRequest(SERVER_URL + '/auth/login/v3', { email, password });
}

beforeEach(() => {
  clearV1();
});

describe('Testing basic authLoginV1 functionality', () => {
  test('Test that authLoginV1 successfully logs in and returns an integer Id', () => {
    authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const authId = authLoginV1('z5361935@ad.unsw.edu.au', 'password');
    expect(authId).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
  });

  test('Test uniqueness of token and Id when logging into registered accounts', () => {
    authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const firstId = authLoginV1('z5361935@ad.unsw.edu.au', 'password');

    authRegisterV1('hayden.smith@unsw.edu.au', '123456', 'Hayden', 'Smith');
    const secondId = authLoginV1('hayden.smith@unsw.edu.au', '123456');

    expect(firstId.token).not.toBe(secondId.token);
    expect(firstId.authUserId).not.toBe(secondId.authUserId);
  });

  test('Test authRegisterV1 and authLoginV1 return the same Id but different tokens for the same account', () => {
    const regId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const loginId = authLoginV1('z5361935@ad.unsw.edu.au', 'password');

    expect(regId.token).not.toBe(loginId.token);
    expect(regId.authUserId).toBe(loginId.authUserId);
  });

  test('Test authLoginV1 and userProfileV1 return the same Id for the same account', () => {
    authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const loginId = authLoginV1('z5361935@ad.unsw.edu.au', 'password');

    const user = getRequest(SERVER_URL + '/user/profile/v3', {
      token: loginId.token,
      uId: loginId.authUserId
    }, loginId.token);

    expect(loginId.authUserId).toBe(user.user.uId);
  });
});

describe('Testing authLoginV1 error handling', () => {
  test.each([
    {
      email: 'notRegisteredEmail',
      password: 'password',
      desc: 'Testing an email that doesn\'t belong to a user'
    },
    {
      email: 'z5361935@ad.unsw.edu.au',
      password: '123456',
      desc: 'Testing an incorrect password for an existing email'
    },
    {
      email: 'hayden.smith@unsw.edu.au',
      password: 'drowssap',
      desc: 'Testing an email and password that both don\'t belong to a user'
    },
  ])('$desc', ({ email, password }) => {
    authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const authId = authLoginV1(email, password);
    expect(authId.statusCode).toBe(INVALID_PARAM);
    const bodyObj = JSON.parse(authId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
