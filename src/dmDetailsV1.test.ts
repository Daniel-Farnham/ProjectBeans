import { getRequest, postRequest, deleteRequest, FORBIDDEN, BAD_REQUEST } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic dmDetailsV1 functionality', () => {
  test('Testing dmDetailsV1 returns the correct datatypes', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const dmDetails = getRequest(SERVER_URL + '/dm/details/v2', {
      dmId: dmId.dmId
    }, regId.token);

    expect(dmDetails).toStrictEqual({ name: expect.any(String), members: expect.any(Array) });
  });

  test('Testing dmDetailsV1 returns the correct name', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const dmDetails = getRequest(SERVER_URL + '/dm/details/v2', {
      dmId: dmId.dmId
    }, regId.token);

    expect(dmDetails.name).toStrictEqual('curtisscully');
  });

  test('Testing dmDetailsV1 returns the correct members list when there\'s one member', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const dmDetails = getRequest(SERVER_URL + '/dm/details/v2', {
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

    expect(dmDetails.members).toStrictEqual(expectedMembers);
  });

  test('Testing dmDetailsV1 returns the correct members list when there\'s multiple members', () => {
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

    const thirdId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@student.unsw.edu.au',
      password: 'password',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: [secondId.authUserId, thirdId.authUserId]
    }, firstId.token);

    const dmDetails = getRequest(SERVER_URL + '/dm/details/v2', {
      dmId: dmId.dmId
    }, firstId.token);

    const expectedMembers = new Set([
      {
        uId: firstId.authUserId,
        email: 'z5361935@ad.unsw.edu.au',
        nameFirst: 'Curtis',
        nameLast: 'Scully',
        handleStr: 'curtisscully'
      },
      {
        uId: secondId.authUserId,
        email: 'hayden.smith@unsw.edu.au',
        nameFirst: 'Hayden',
        nameLast: 'Smith',
        handleStr: 'haydensmith'
      },
      {
        uId: thirdId.authUserId,
        email: 'edwin.ngo@student.unsw.edu.au',
        nameFirst: 'Edwin',
        nameLast: 'Ngo',
        handleStr: 'edwinngo'
      }
    ]);

    expect(new Set(dmDetails.members)).toStrictEqual(expectedMembers);
  });
});

describe('Testing dmDetailsV1 error handling', () => {
  test('Testing dmDetailsV1 returns error when dmId is invalid', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmDetails = getRequest(SERVER_URL + '/dm/details/v2', {
      dmId: 0
    }, regId.token);

    expect(dmDetails.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(dmDetails.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing dmDetailsV1 returns error when authorised user is not a member of the dm', () => {
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

    const dmDetails = getRequest(SERVER_URL + '/dm/details/v2', {
      dmId: dmId.dmId
    }, secondId.token);

    expect(dmDetails.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(dmDetails.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing dmDetailsV1 returns error when token is invalid', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const dmDetails = getRequest(SERVER_URL + '/dm/details/v2', {
      dmId: dmId.dmId
    }, regId.token + 'NotAToken');

    expect(dmDetails.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(dmDetails.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
