import { getRequest, postRequest, deleteRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// const OK = 200;

beforeEach(() => {
  // clearV1();
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic authLoginV1 functionality', () => {
  test('Test that authLoginV1 successfully logs in and returns an integer Id', () => {
    // authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    // const authId = authLoginV1('z5361935@ad.unsw.edu.au', 'password');
    // expect(authId).toStrictEqual({ authUserId: expect.any(Number) });

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

    // expect(authId.statusCode).toBe(OK);
    expect(authId).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
  });

  test('Test uniqueness of token and Id when logging into registered accounts', () => {
    // authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    // const firstId = authLoginV1('z5361935@ad.unsw.edu.au', 'password');
    // authRegisterV1('hayden.smith@unsw.edu.au', '123456', 'Hayden', 'Smith');
    // const secondId = authLoginV1('hayden.smith@unsw.edu.au', '123456');
    // expect(firstId.authUserId).not.toBe(secondId.authUserId);

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

    // expect(firstId.statusCode).toBe(OK);
    expect(firstId.token).not.toBe(secondId.token);
    expect(firstId.authUserId).not.toBe(secondId.authUserId);
  });

  test('Test authRegisterV1 and authLoginV1 return the same Id but different tokens for the same account', () => {
    // const regId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    // const loginId = authLoginV1('z5361935@ad.unsw.edu.au', 'password');
    // expect(regId.authUserId).toBe(loginId.authUserId);

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

    // expect(loginId.statusCode).toBe(OK);
    expect(regId.token).not.toBe(loginId.token);
    expect(regId.authUserId).toBe(loginId.authUserId);
  });

  test('Test authLoginV1 and userProfileV1 return the same Id for the same account', () => {
    // authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    // const loginId = authLoginV1('z5361935@ad.unsw.edu.au', 'password');
    // const user = userProfileV1(loginId.authUserId, loginId.authUserId);
    // expect(loginId.authUserId).toBe(user.user.uId);

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
      token: loginId.token,
      uId: loginId.authUserId
    });

    // expect(loginId.statusCode).toBe(OK);
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
    // authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    // const authId = authLoginV1(email, password);
    // expect(authId).toMatchObject({ error: expect.any(String) });

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

    // expect(authId.statusCode).toBe(OK);
    expect(authId).toMatchObject({ error: expect.any(String) });
  });
});
