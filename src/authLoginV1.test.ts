import { getRequest, postRequest, deleteRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic authLoginV1 functionality', () => {
  test('Test that authLoginV1 successfully logs in and returns an integer Id', () => {
    postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const authId = postRequest(SERVER_URL + '/auth/login/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password'
    });

    expect(authId).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
  });

  test('Test uniqueness of token and Id when logging into registered accounts', () => {
    postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const firstId = postRequest(SERVER_URL + '/auth/login/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password'
    });

    postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hayden.smith@unsw.edu.au',
      password: '123456',
      nameFirst: 'Hayden',
      nameLast: 'Smith'
    });

    const secondId = postRequest(SERVER_URL + '/auth/login/v2', {
      email: 'hayden.smith@unsw.edu.au',
      password: '123456'
    });

    expect(firstId.token).not.toBe(secondId.token);
    expect(firstId.authUserId).not.toBe(secondId.authUserId);
  });

  test('Test authRegisterV1 and authLoginV1 return the same Id but different tokens for the same account', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const loginId = postRequest(SERVER_URL + '/auth/login/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password'
    });

    expect(regId.token).not.toBe(loginId.token);
    expect(regId.authUserId).toBe(loginId.authUserId);
  });

  test('Test authLoginV1 and userProfileV1 return the same Id for the same account', () => {
    postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const loginId = postRequest(SERVER_URL + '/auth/login/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password'
    });

    const user = getRequest(SERVER_URL + '/user/profile/v2', {
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
    postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const authId = postRequest(SERVER_URL + '/auth/login/v2', {
      email: email,
      password: password
    });

    expect(authId).toMatchObject({ error: expect.any(String) });
  });
});
