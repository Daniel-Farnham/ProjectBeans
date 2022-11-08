import { postRequest, deleteRequest, getRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing channelRemoveOwnerV1', () => {
  test('Testing successful return of empty object after executing', () => {
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

    const removeOwner = postRequest(SERVER_URL + '/channel/removeowner/v1', {
      channelId: channel.channelId,
      uId: userId2.authUserId
    }, userId1.token);

    expect(removeOwner).toStrictEqual({});
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
    },  userId1.token);

    postRequest(SERVER_URL + '/channel/join/v2', {
      channelId: channel.channelId
    }, userId2.token);

    postRequest(SERVER_URL + '/channel/addowner/v1', {
      channelId: channel.channelId,
      uId: userId2.authUserId
    },  userId1.token);

    const expectedResult = postRequest(SERVER_URL + '/channel/removeowner/v1', {
      channelId: channel.channelId + 10,
      uId: userId2.authUserId
    }, userId1.token);

    expect(expectedResult).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing invalid uId', () => {
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

    const expectedResult = postRequest(SERVER_URL + '/channel/removeowner/v1', {
      channelId: channel.channelId,
      uId: userId2.authUserId + 10
    }, userId1.token);

    expect(expectedResult).toStrictEqual({ error: expect.any(String) });
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

    postRequest(SERVER_URL + '/channel/addowner/v1', {
      channelId: channel.channelId,
      uId: userId2.authUserId
    }, userId1.token);

    const expectedResult = postRequest(SERVER_URL + '/channel/removeowner/v1', {
      channelId: channel.channelId,
      uId: userId1.authUserId
    }, userId1.token + 10);

    expect(expectedResult).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing channelRemoveOwnerV1 removes the owner successfully', () => {
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

    const expectedOwnersBefore = new Set([
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

    postRequest(SERVER_URL + '/channel/removeowner/v1', {
      channelId: channel.channelId,
      uId: userId2.authUserId
    }, userId1.token);

    const detailsAfter = getRequest(SERVER_URL + '/channel/details/v2', {
      channelId: channel.channelId
    }, userId1.token);

    const expectedOwnersAfter = new Set([
      {
        uId: userId1.authUserId,
        email: 'edwin.ngo@ad.unsw.edu.au',
        nameFirst: 'Edwin',
        nameLast: 'Ngo',
        handleStr: 'edwinngo'
      }
    ]);

    expect(expectedOwnersBefore).toStrictEqual(new Set(detailsBefore.ownerMembers));
    expect(expectedOwnersAfter).toStrictEqual(new Set(detailsAfter.ownerMembers));
  });

  test('Testing user is not an owner of channel', () => {
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

    const expectedResult = postRequest(SERVER_URL + '/channel/removeowner/v1', {
      channelId: channel.channelId,
      uId: userId2.authUserId
    }, userId1.token);

    expect(expectedResult).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing user is only owner of channel', () => {
    const userId1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: true
    }, userId1.token);

    const expectedResult = postRequest(SERVER_URL + '/channel/removeowner/v1', {
      channelId: channel.channelId,
      uId: userId1.authUserId
    }, userId1.token);

    expect(expectedResult).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing valid channelId but user has no owner permissions', () => {
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

    const expectedResult = postRequest(SERVER_URL + '/channel/removeowner/v1', {
      channelId: channel.channelId,
      uId: userId1.authUserId
    }, userId2.token);

    expect(expectedResult).toStrictEqual({ error: expect.any(String) });
  });
});
