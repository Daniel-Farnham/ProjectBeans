import { getRequest, postRequest, deleteRequest, BAD_REQUEST, FORBIDDEN } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic dmRemoveV1 functionality', () => {
  test('Testing dmRemoveV1 successfully returns an empty object', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const removeDm = deleteRequest(SERVER_URL + '/dm/remove/v2', {
      dmId: dmId.dmId
    }, regId.token);

    expect(removeDm).toStrictEqual({});
  });

  test('Testing dmRemoveV1 removes all dm members by failing to view dm details', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const firstDetails = getRequest(SERVER_URL + '/dm/details/v2', {
      dmId: dmId.dmId
    }, regId.token);

    deleteRequest(SERVER_URL + '/dm/remove/v2', {
      dmId: dmId.dmId
    }, regId.token);

    const secondDetails = getRequest(SERVER_URL + '/dm/details/v2', {
      dmId: dmId.dmId
    }, regId.token);

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
    expect(secondDetails.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(secondDetails.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('Testing dmRemoveV1 error handling', () => {
  test('Testing dmRemoveV1 returns error when dmId is invalid', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const removeDm = deleteRequest(SERVER_URL + '/dm/remove/v2', {
      dmId: 0
    }, regId.token);

    expect(removeDm.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(removeDm.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing dmRemoveV1 returns error when authorised user isn\'t the dm creator', () => {
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

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: [secondId.authUserId]
    }, firstId.token);

    const removeDm = deleteRequest(SERVER_URL + '/dm/remove/v2', {
      dmId: dmId.dmId
    }, secondId.token);

    expect(removeDm.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(removeDm.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing dmRemoveV1 returns error when authorised user isn\'t a member', () => {
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

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, firstId.token);

    const removeDm = deleteRequest(SERVER_URL + '/dm/remove/v2', {
      dmId: dmId.dmId
    }, secondId.token);

    expect(removeDm.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(removeDm.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing dmRemoveV1 returns error when token is invalid', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const removeDm = deleteRequest(SERVER_URL + '/dm/remove/v2', {
      dmId: dmId.dmId
    }, regId.token + 'NotAToken');

    expect(removeDm.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(removeDm.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
