import { postRequest, deleteRequest, getRequest } from './other';

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
      token: userId1.token,
      name: 'General',
      isPublic: true
    });

    postRequest(SERVER_URL + '/channel/join/v2', {
      token: userId2.token,
      channelId: channel.channelId
    });

    const expectedResult = postRequest(SERVER_URL + '/channel/leave/v1', {
      token: userId2.token,
      channelId: channel.channelId
    })

    expect(expectedResult).toStrictEqual({});
  })

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
      token: userId1.token,
      name: 'General',
      isPublic: true
    });

    postRequest(SERVER_URL + '/channel/join/v2', {
      token: userId2.token,
      channelId: channel.channelId
    });

    const detailsBefore = getRequest(SERVER_URL + '/channel/details/v2', {
      token: userId1.token,
      channelId: channel.channelId
    });

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

    postRequest(SERVER_URL + '/channel/leave/v1', {
      token: userId2.token,
      channelId: channel.channelId
    });

    const detailsAfter = getRequest(SERVER_URL + '/channel/details/v2', {
      token: userId1.token,
      channelId: channel.channelId
    });

    const membersAfter = new Set([
      {
        uId: userId1.authUserId,
        email: 'edwin.ngo@ad.unsw.edu.au',
        nameFirst: 'Edwin',
        nameLast: 'Ngo',
        handleStr: 'edwinngo'
      }
    ]);

    expect(membersBefore).toStrictEqual(new Set(detailsBefore.ownerMembers));
    expect(membersAfter).toStrictEqual(new Set(detailsAfter.ownerMembers));
  })
  
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
      token: userId1.token,
      name: 'General',
      isPublic: true
    });

    postRequest(SERVER_URL + '/channel/join/v2', {
      token: userId2.token,
      channelId: channel.channelId
    });

    const expectedResult = postRequest(SERVER_URL + 'channel/leave/v1', {
      token: userId2.token,
      channelId: channel.channelId + 10
    });

    expect(expectedResult).toStrictEqual({ error: expect.any(String) });
  })

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
      token: userId1.token,
      name: 'General',
      isPublic: true
    });

    postRequest(SERVER_URL + '/channel/join/v2', {
      token: userId2.token,
      channelId: channel.channelId
    });

    const expectedResult = postRequest(SERVER_URL + 'channel/leave/v1', {
      token: userId2.token + 10,
      channelId: channel.channelId
    });

    expect(expectedResult).toStrictEqual({ error: expect.any(String) });
  })

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
      token: userId1.token,
      name: 'General',
      isPublic: true
    });

    const expectedResult = postRequest(SERVER_URL + 'channel/leave/v1', {
      token: userId2.token,
      channelId: channel.channelId,
    });

    expect(expectedResult).toStrictEqual({ error: expect.any(String) });
  })

});