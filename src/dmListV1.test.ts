import { getRequest, postRequest, deleteRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// const OK = 200;

beforeEach(() => {
  // clearV1();
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic dmListV1 functionality', () => {
  test('Test dmListV1 returns an empty list when the user is in no dms', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const lists = getRequest(SERVER_URL + '/dm/list/v1', {
      token: regId.token
    });

    expect(lists).toStrictEqual({ dms: [] });
  });

  test('Test dmListV1 only returns dms the user is apart of, when they aren\'t a creator of any', () => {
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

    postRequest(SERVER_URL + '/dm/create/v1', {
      token: secondId.token,
      uIds: []
    });

    postRequest(SERVER_URL + '/dm/create/v1', {
      token: secondId.token,
      uIds: []
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v1', {
      token: secondId.token,
      uIds: [firstId.authUserId]
    });

    const list = getRequest(SERVER_URL + '/dm/list/v1', {
      token: firstId.token
    });

    const expectedList = [
      {
        dmId: dmId.dmId,
        name: 'curtisscully, haydensmith'
      }
    ];

    expect(list.dms).toStrictEqual(expectedList);
  });

  test('Test dmListV1 only returns dms the user is apart of, when they are a creator of all', () => {
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

    postRequest(SERVER_URL + '/dm/create/v1', {
      token: secondId.token,
      uIds: []
    });

    const firstDm = postRequest(SERVER_URL + '/dm/create/v1', {
      token: firstId.token,
      uIds: []
    });

    const secondDm = postRequest(SERVER_URL + '/dm/create/v1', {
      token: firstId.token,
      uIds: [secondId.authUserId]
    });

    const list = getRequest(SERVER_URL + '/dm/list/v1', {
      token: firstId.token
    });

    const expectedList = new Set([
      {
        dmId: firstDm.dmId,
        name: 'curtisscully'
      },
      {
        dmId: secondDm.dmId,
        name: 'curtisscully, haydensmith'
      }
    ]);

    expect(new Set(list.dms)).toStrictEqual(expectedList);
  });
});

describe('Testing dmCreateV1 error handling', () => {
  test('Test dmListV1 returns error when token is invalid', () => {
    const list = getRequest(SERVER_URL + '/dm/list/v1', {
      token: 'NotAToken'
    });

    expect(list).toStrictEqual({ error: expect.any(String) });
  });
});
