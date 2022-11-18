import { getRequest, postRequest, deleteRequest, FORBIDDEN } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic dmListV1 functionality', () => {
  test('Test dmListV1 returns an empty list when the user is in no dms', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const lists = getRequest(SERVER_URL + '/dm/list/v2', {}, regId.token);

    expect(lists).toStrictEqual({ dms: [] });
  });

  test('Test dmListV1 only returns dms the user is apart of, when they aren\'t a creator of any', () => {
    const firstId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const secondId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hayden.smith@unsw.edu.au',
      password: '123456',
      nameFirst: 'Hayden',
      nameLast: 'Smith'
    });

    postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, secondId.token);

    postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, secondId.token);

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: [firstId.authUserId]
    }, secondId.token);

    const list = getRequest(SERVER_URL + '/dm/list/v2', {}, firstId.token);

    const expectedList = [
      {
        dmId: dmId.dmId,
        name: 'curtisscully, haydensmith'
      }
    ];

    expect(list.dms).toStrictEqual(expectedList);
  });

  test('Test dmListV1 only returns dms the user is apart of, when they are a creator of all', () => {
    const firstId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const secondId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hayden.smith@unsw.edu.au',
      password: '123456',
      nameFirst: 'Hayden',
      nameLast: 'Smith'
    });

    postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, secondId.token);

    const firstDm = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, firstId.token);

    const secondDm = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: [secondId.authUserId]
    }, firstId.token);

    const list = getRequest(SERVER_URL + '/dm/list/v2', {}, firstId.token);

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

describe('Testing dmListV1 error handling', () => {
  test('Test dmListV1 returns error when token is invalid', () => {
    const list = getRequest(SERVER_URL + '/dm/list/v2', {}, 'NotAToken');

    expect(list.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(list.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
