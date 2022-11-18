import { getRequest, postRequest, deleteRequest, FORBIDDEN, BAD_REQUEST } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic dmCreateV1 functionality', () => {
  test('Test dmCreateV1 successfully creates a new dm and returns an integer dm Id', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    expect(dmId).toStrictEqual({ dmId: expect.any(Number) });
  });

  test('Test dmCreateV1 generates the correct dm name when the creator is the only member', () => {
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

    expect(dmDetails.name).toBe('curtisscully');
  });

  test('Test dmCreateV1 generates the correct dm name when there\'s multiple members', () => {
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

    expect(dmDetails.name).toBe('curtisscully, edwinngo, haydensmith');
  });

  test('Test dmCreateV1 has only the creator in the members list when no other users are in the dm', () => {
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

  test('Test dmCreateV1 adds everyone to the members list', () => {
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
      },
    ]);

    expect(new Set(dmDetails.members)).toStrictEqual(expectedMembers);
  });
});

describe('Testing dmCreateV1 error handling', () => {
  test('Testing dmCreateV1 returns error when a given uId is invalid', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: [regId.authUserId + 1]
    }, regId.token);

    expect(dmId.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(dmId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing dmCreateV1 returns error when uIds contains a duplicate', () => {
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
      uIds: [secondId.authUserId, secondId.authUserId]
    }, firstId.token);

    expect(dmId.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(dmId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing dmCreateV1 returns error when token is invalid', () => {
    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, 'NotAToken');

    expect(dmId.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(dmId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
