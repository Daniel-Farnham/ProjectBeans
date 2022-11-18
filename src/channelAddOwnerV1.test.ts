import { postRequest, deleteRequest, getRequest, BAD_REQUEST, FORBIDDEN } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing channelAddOwnerV1', () => {
  test('Testing successful return of empty object after executing', () => {
    const userId1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const userId2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'john.smith@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'John',
      nameLast: 'Smith'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, userId1.token);

    postRequest(SERVER_URL + '/channel/join/v3', {
      channelId: channel.channelId
    }, userId2.token);

    const newOwner = postRequest(SERVER_URL + '/channel/addowner/v2', {
      channelId: channel.channelId,
      uId: userId2.authUserId
    }, userId1.token);

    expect(newOwner).toStrictEqual({});
  });

  test('Testing successful adding of owner', () => {
    const userId1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const userId2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'john.smith@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'John',
      nameLast: 'Smith'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, userId1.token);

    postRequest(SERVER_URL + '/channel/join/v3', {
      channelId: channel.channelId
    }, userId2.token);

    postRequest(SERVER_URL + '/channel/addowner/v2', {
      channelId: channel.channelId,
      uId: userId2.authUserId
    }, userId1.token);

    const channelDetails = getRequest(SERVER_URL + '/channel/details/v3', {
      channelId: channel.channelId
    }, userId1.token);

    const expectedOwners = new Set([
      {
        uId: userId1.authUserId,
        email: 'edwin.ngo@ad.unsw.edu.au',
        nameFirst: 'Edwin',
        nameLast: 'Ngo',
        handleStr: 'edwinngo',
        profileImgUrl: channelDetails.ownerMembers[0].profileImgUrl,
      },
      {
        uId: userId2.authUserId,
        email: 'john.smith@ad.unsw.edu.au',
        nameFirst: 'John',
        nameLast: 'Smith',
        handleStr: 'johnsmith',
        profileImgUrl: channelDetails.ownerMembers[1].profileImgUrl,
      }
    ]);

    expect(expectedOwners).toStrictEqual(new Set(channelDetails.ownerMembers));
  });

  test('Testing invalid channelId', () => {
    const userId1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const userId2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'john.smith@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'John',
      nameLast: 'Smith'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, userId1.token);

    postRequest(SERVER_URL + '/channel/join/v3', {
      token: userId2.token,
      channelId: channel.channelId
    });

    const expectedResult = postRequest(SERVER_URL + '/channel/addowner/v2', {
      channelId: channel.channelId + 5,
      uId: userId2.authUserId
    }, userId1.token);

    expect(expectedResult.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(expectedResult.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing invalid uId', () => {
    const userId1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const userId2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'john.smith@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'John',
      nameLast: 'Smith'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, userId1.token);

    postRequest(SERVER_URL + '/channel/join/v3', {
      channelId: channel.channelId
    }, userId2.token);

    const expectedResult = postRequest(SERVER_URL + '/channel/addowner/v2', {
      channelId: channel.channelId,
      uId: userId2.authUserId + 10
    }, userId1.token);

    expect(expectedResult.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(expectedResult.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing user is not member of channel', () => {
    const userId1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const userId2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'john.smith@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'John',
      nameLast: 'Smith'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, userId1.token);

    const expectedResult = postRequest(SERVER_URL + '/channel/addowner/v2', {
      channelId: channel.channelId,
      uId: userId2.authUserId
    }, userId1.token);

    expect(expectedResult.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(expectedResult.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing user is already an owner of channel', () => {
    const userId1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, userId1.token);

    const expectedResult = postRequest(SERVER_URL + '/channel/addowner/v2', {
      channelId: channel.channelId,
      uId: userId1.authUserId
    }, userId1.token);

    expect(expectedResult.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(expectedResult.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing valid channelId, but user has no owner permissions', () => {
    const userId1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const userId2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'john.smith@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'John',
      nameLast: 'Smith'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, userId1.token);

    postRequest(SERVER_URL + '/channel/join/v3', {
      channelId: channel.channelId
    }, userId2.token);

    const expectedResult = postRequest(SERVER_URL + '/channel/addowner/v2', {
      channelId: channel.channelId,
      uId: userId1.authUserId
    }, userId2.token);

    expect(expectedResult.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(expectedResult.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing invalid token', () => {
    const userId1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const userId2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'john.smith@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'John',
      nameLast: 'Smith'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, userId1.token);

    postRequest(SERVER_URL + '/channel/join/v3', {
      channelId: channel.channelId
    }, userId2.token);

    const expectedResult = postRequest(SERVER_URL + '/channel/addowner/v2', {
      channelId: channel.channelId,
      uId: userId2.authUserId
    }, userId1.token + 10);

    expect(expectedResult.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(expectedResult.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
