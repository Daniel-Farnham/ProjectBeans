import { postRequest, deleteRequest, getRequest, FORBIDDEN, BAD_REQUEST } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing channelLeaveV1', () => {
  test('Testing successful return of empty object', () => {
    const userId1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const userId2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'john.smith@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'John',
      nameLast: 'Smith'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: true
    }, userId1.token);

    postRequest(SERVER_URL + '/channel/join/v2', {
      channelId: channel.channelId
    }, userId2.token);

    const expectedResult = postRequest(SERVER_URL + '/channel/leave/v2', {
      channelId: channel.channelId
    }, userId2.token);

    expect(expectedResult).toStrictEqual({});
  });

  test('Testing successful leaving of channel', () => {
    const userId1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const userId2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'john.smith@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'John',
      nameLast: 'Smith'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: true
    }, userId1.token);

    postRequest(SERVER_URL + '/channel/join/v2', {
      channelId: channel.channelId
    }, userId2.token);

    const detailsBefore = getRequest(SERVER_URL + '/channel/details/v2', {
      channelId: channel.channelId
    }, userId1.token);

    const membersBefore = new Set([
      {
        uId: userId1.authUserId,
        email: 'edwin.ngo@ad.unsw.edu.au',
        nameFirst: 'Edwin',
        nameLast: 'Ngo',
        handleStr: 'edwinngo'
      },
      {
        uId: userId2.authUserId,
        email: 'john.smith@ad.unsw.edu.au',
        nameFirst: 'John',
        nameLast: 'Smith',
        handleStr: 'johnsmith'
      }
    ]);

    postRequest(SERVER_URL + '/channel/leave/v2', {
      channelId: channel.channelId
    }, userId2.token);

    const detailsAfter = getRequest(SERVER_URL + '/channel/details/v2', {
      channelId: channel.channelId
    }, userId1.token);

    const membersAfter = new Set([
      {
        uId: userId1.authUserId,
        email: 'edwin.ngo@ad.unsw.edu.au',
        nameFirst: 'Edwin',
        nameLast: 'Ngo',
        handleStr: 'edwinngo'
      }
    ]);

    expect(membersBefore).toStrictEqual(new Set(detailsBefore.allMembers));
    expect(membersAfter).toStrictEqual(new Set(detailsAfter.allMembers));
  });

  test('Testing successful leaving of channel as owner', () => {
    const userId1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const userId2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'john.smith@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'John',
      nameLast: 'Smith'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: true
    }, userId1.token);

    postRequest(SERVER_URL + '/channel/join/v2', {
      channelId: channel.channelId
    }, userId2.token);

    postRequest(SERVER_URL + '/channel/addowner/v1', {
      channelId: channel.channelId,
      uId: userId2.authUserId
    }, userId1.token);

    const detailsBefore = getRequest(SERVER_URL + '/channel/details/v2', {
      channelId: channel.channelId
    }, userId1.token);

    const ownersBefore = new Set([
      {
        uId: userId1.authUserId,
        email: 'edwin.ngo@ad.unsw.edu.au',
        nameFirst: 'Edwin',
        nameLast: 'Ngo',
        handleStr: 'edwinngo'
      },
      {
        uId: userId2.authUserId,
        email: 'john.smith@ad.unsw.edu.au',
        nameFirst: 'John',
        nameLast: 'Smith',
        handleStr: 'johnsmith'
      }
    ]);

    postRequest(SERVER_URL + '/channel/leave/v2', {
      channelId: channel.channelId
    }, userId2.token);

    const detailsAfter = getRequest(SERVER_URL + '/channel/details/v2', {
      channelId: channel.channelId
    }, userId1.token);

    const ownersAfter = new Set([
      {
        uId: userId1.authUserId,
        email: 'edwin.ngo@ad.unsw.edu.au',
        nameFirst: 'Edwin',
        nameLast: 'Ngo',
        handleStr: 'edwinngo'
      }
    ]);

    expect(ownersBefore).toStrictEqual(new Set(detailsBefore.ownerMembers));
    expect(ownersAfter).toStrictEqual(new Set(detailsAfter.ownerMembers));
  });

  test('Testing invalid channelId', () => {
    const userId1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const userId2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'john.smith@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'John',
      nameLast: 'Smith'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: true
    }, userId1.token);

    postRequest(SERVER_URL + '/channel/join/v2', {
      channelId: channel.channelId
    }, userId2.token);

    const result = postRequest(SERVER_URL + '/channel/leave/v2', {
      channelId: channel.channelId + 10
    }, userId2.token);

    expect(result.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing invalid token', () => {
    const userId1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const userId2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'john.smith@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'John',
      nameLast: 'Smith'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: true
    }, userId1.token);

    postRequest(SERVER_URL + '/channel/join/v2', {
      channelId: channel.channelId
    }, userId2.token);

    const result = postRequest(SERVER_URL + '/channel/leave/v2', {
      channelId: channel.channelId
    }, userId2.token + 10);

    expect(result.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing valid channelId, but user is not a member', () => {
    const userId1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const userId2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'john.smith@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'John',
      nameLast: 'Smith'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: true
    }, userId1.token);

    const result = postRequest(SERVER_URL + '/channel/leave/v2', {
      channelId: channel.channelId
    }, userId2.token);

    expect(result.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
