import { getRequest, postRequest, deleteRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// const OK = 200;

beforeEach(() => {
  // clearV1();
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic dmRemoveV1 functionality', () => {
  test('Testing dmRemoveV1 successfully returns an empty object', () => {
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

    const removeDm = deleteRequest(SERVER_URL + '/dm/remove/v1', {
      token: regId.token,
      dmId: dmId.dmId
    });
    
    expect(removeDm).toStrictEqual({});
  });

  test('Testing dmRemoveV1 removes all dm members by failing to view dm details', () => {
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

    const firstDetails = getRequest(SERVER_URL + '/dm/details/v1', {
      token: regId.token,
      dmId: dmId.dmId
    });
    
    deleteRequest(SERVER_URL + '/dm/remove/v1', {
      token: regId.token,
      dmId: dmId.dmId
    });
    
    const secondDetails = getRequest(SERVER_URL + '/dm/details/v1', {
      token: regId.token,
      dmId: dmId.dmId
    });

    const expectedMembers = [
      {
        uId: regId.authUserId,
        email: 'z5361935@ad.unsw.edu.au',
        nameFirst: 'Curtis',
        nameLast: 'Scully',
        handleStr: 'curtisscully'
      }
    ];

    expect(firstDetails.members).toStrictEqual(expectedMembers);
    expect(secondDetails).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Testing dmRemoveV1 error handling', () => {
  test('Testing dmRemoveV1 returns error when dmId is invalid', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const removeDm = deleteRequest(SERVER_URL + '/dm/remove/v1', {
      token: regId.token,
      dmId: 0
    });

    expect(removeDm).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing dmRemoveV1 returns error when authorised user isn\'t the dm creator', () => {
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
      uIds: [secondId.authUserId]
    });

    const removeDm = deleteRequest(SERVER_URL + '/dm/remove/v1', {
      token: secondId.token,
      dmId: dmId.dmId
    });

    expect(removeDm).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing dmRemoveV1 returns error when authorised user isn\'t a member', () => {
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

    const removeDm = deleteRequest(SERVER_URL + '/dm/remove/v1', {
      token: secondId.token,
      dmId: dmId.dmId
    });

    expect(removeDm).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing dmRemoveV1 returns error when token is invalid', () => {
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

    const removeDm = deleteRequest(SERVER_URL + '/dm/remove/v1', {
      token: regId.token + 'NotAToken',
      dmId: dmId.dmId
    });

    expect(removeDm).toStrictEqual({ error: expect.any(String) });
  });
});
