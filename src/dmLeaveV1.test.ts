import { getRequest, postRequest, deleteRequest } from './other';

import { port, url } from './config.json';
import { StringDecoder } from 'string_decoder';
const SERVER_URL = `${url}:${port}`;

// const OK = 200;

beforeEach(() => {
  // clearV1();
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic dmLeaveV1 functionality', () => {
  test('Testing dmLeaveV1 returns an empty object on success', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v1', {
      token: regId.token,
      uIds: []
    });

    const dmLeave = postRequest(SERVER_URL + '/dm/leave/v1', {
      token: regId.token,
      dmId: dmId.dmId
    });

    expect(dmLeave).toStrictEqual({});
  });

  test('Testing dmLeaveV1 makes a dm inaccessible if the only member leaves', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v1', {
      token: regId.token,
      uIds: []
    });

    postRequest(SERVER_URL + '/dm/leave/v1', {
      token: regId.token,
      dmId: dmId.dmId
    });

    const dmDetails = getRequest(SERVER_URL + '/dm/details/v1', {
      token: regId.token,
      dmId: dmId.dmId
    });

    expect(dmDetails).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing dmLeaveV1 successfully removes a regular member', () => {
    const firstId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const secondId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hayden.smith@unsw.edu.au',
      password: '123456',
      nameFirst: 'Hayden',
      nameLast: 'Smith'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v1', {
      token: firstId.token,
      uIds: [secondId.uId]
    });

    postRequest(SERVER_URL + '/dm/leave/v1', {
      token: secondId.token,
      dmId: dmId.dmId
    });

    const dmDetails = getRequest(SERVER_URL + '/dm/details/v1', {
      token: firstId.token,
      dmId: dmId.dmId
    });

    const expectedMembers = [
      {
        uId: firstId.authUserId,
        email: 'z5361935@ad.unsw.edu.au',
        nameFirst: 'Curtis',
        nameLast: 'Scully',
        handleStr: 'curtisscully'
      }
    ];

    expect(dmDetails.members).toStrictEqual(expectedMembers);
  });
  
  test('Testing dmLeaveV1 successfully removes the creator', () => {
    const firstId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const secondId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hayden.smith@unsw.edu.au',
      password: '123456',
      nameFirst: 'Hayden',
      nameLast: 'Smith'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v1', {
      token: firstId.token,
      uIds: [secondId.uId]
    });

    postRequest(SERVER_URL + '/dm/leave/v1', {
      token: firstId.token,
      dmId: dmId.dmId
    });

    const dmDetails = getRequest(SERVER_URL + '/dm/details/v1', {
      token: secondId.token,
      dmId: dmId.dmId
    });

    const expectedMembers = [
      {
        uId: secondId.authUserId,
        email: 'hayden.smith@unsw.edu.au',
        nameFirst: 'Hayden',
        nameLast: 'Smith'
      }
    ];

    expect(dmDetails.members).toStrictEqual(expectedMembers);
  });

  test('Testing dmLeaveV1 removes a user and they can no longer access the dm', () => {
    const firstId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const secondId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hayden.smith@unsw.edu.au',
      password: '123456',
      nameFirst: 'Hayden',
      nameLast: 'Smith'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v1', {
      token: firstId.token,
      uIds: [secondId.uId]
    });

    postRequest(SERVER_URL + '/dm/leave/v1', {
      token: firstId.token,
      dmId: dmId.dmId
    });

    const dmDetails = getRequest(SERVER_URL + '/dm/details/v1', {
      token: firstId.token,
      dmId: dmId.dmId
    });

    expect(dmDetails).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Testing dmLeaveV1 error handling', () => {
  test('Testing dmLeaveV1 returns error when dmId is invalid', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmLeave = postRequest(SERVER_URL + '/dm/leave/v1', {
      token: regId.token,
      dmId: 0
    });

    expect(dmLeave).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing dmLeaveV1 returns error when authorised user isn\'t a member', () => {
    const firstId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const secondId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hayden.smith@unsw.edu.au',
      password: '123456',
      nameFirst: 'Hayden',
      nameLast: 'Smith'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v1', {
      token: firstId.token,
      uIds: []
    });

    const dmLeave = postRequest(SERVER_URL + '/dm/leave/v1', {
      token: secondId.token,
      dmId: dmId.dmId
    });

    expect(dmLeave).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing dmLeaveV1 returns error when token is invalid', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v1', {
      token: regId.token,
      uIds: []
    });

    const dmLeave = postRequest(SERVER_URL + '/dm/leave/v1', {
      token: regId.token + 'NotAToken',
      dmId: dmId.dmId
    });

    expect(dmLeave).toStrictEqual({ error: expect.any(String) });
  });
});
