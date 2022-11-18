import { getRequest, postRequest, deleteRequest, FORBIDDEN, BAD_REQUEST } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic dmLeaveV1 functionality', () => {
  test('Testing dmLeaveV1 returns an empty object on success', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const dmLeave = postRequest(SERVER_URL + '/dm/leave/v2', {
      dmId: dmId.dmId
    }, regId.token);

    expect(dmLeave).toStrictEqual({});
  });

  test('Testing dmLeaveV1 makes a dm inaccessible if the only member leaves', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    postRequest(SERVER_URL + '/dm/leave/v2', {
      dmId: dmId.dmId
    }, regId.token);

    const dmDetails = getRequest(SERVER_URL + '/dm/details/v2', {
      dmId: dmId.dmId
    }, regId.token);

    expect(dmDetails.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(dmDetails.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing dmLeaveV1 successfully removes a regular member', () => {
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

    postRequest(SERVER_URL + '/dm/leave/v2', {
      dmId: dmId.dmId
    }, secondId.token);

    const dmDetails = getRequest(SERVER_URL + '/dm/details/v2', {
      dmId: dmId.dmId
    }, firstId.token);

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

    postRequest(SERVER_URL + '/dm/leave/v2', {
      dmId: dmId.dmId
    }, firstId.token);

    const dmDetails = getRequest(SERVER_URL + '/dm/details/v2', {
      dmId: dmId.dmId
    }, secondId.token);

    const expectedMembers = [
      {
        uId: secondId.authUserId,
        email: 'hayden.smith@unsw.edu.au',
        nameFirst: 'Hayden',
        nameLast: 'Smith',
        handleStr: 'haydensmith'
      }
    ];

    expect(dmDetails.members).toStrictEqual(expectedMembers);
  });

  test('Testing dmLeaveV1 removes a user and they can no longer access the dm', () => {
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

    postRequest(SERVER_URL + '/dm/leave/v2', {
      dmId: dmId.dmId
    }, firstId.token);

    const dmDetails = getRequest(SERVER_URL + '/dm/details/v2', {
      dmId: dmId.dmId
    }, firstId.token);

    expect(dmDetails.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(dmDetails.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('Testing dmLeaveV1 error handling', () => {
  test('Testing dmLeaveV1 returns error when dmId is invalid', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmLeave = postRequest(SERVER_URL + '/dm/leave/v2', {
      dmId: 0
    }, regId.token);

    expect(dmLeave.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(dmLeave.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing dmLeaveV1 returns error when authorised user isn\'t a member', () => {
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

    const dmLeave = postRequest(SERVER_URL + '/dm/leave/v2', {
      dmId: dmId.dmId
    }, secondId.token);

    expect(dmLeave.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(dmLeave.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing dmLeaveV1 returns error when token is invalid', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const dmLeave = postRequest(SERVER_URL + '/dm/leave/v2', {
      dmId: dmId.dmId
    }, regId.token + 'NotAToken');

    expect(dmLeave.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(dmLeave.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
