import { postRequest, deleteRequest, getRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing channelAddOwnerV1', () => {
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
      token: userId1.token,
      name: 'General',
      isPublic: true
    });

    postRequest(SERVER_URL + '/channel/join/v2', {
      token: userId2.token,
      channelId: channel.channelId
    });

    const newOwner = postRequest(SERVER_URL + '/channel/addowner/v1', {
      token: userId1.token,
      channelId: channel.channelId,
      uId: userId2.authUserId
    });

    expect(newOwner).toStrictEqual({});
  });

  test('Testing successful adding of owner', () => {
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

    postRequest(SERVER_URL + '/channel/addowner/v1', {
      token: userId1.token,
      channelId: channel.channelId,
      uId: userId2.authUserId
    });

    const channelDetails = getRequest(SERVER_URL + '/channel/details/v2', {
      token: userId1.token,
      channelId: channel.channelId
    });

    const expectedOwners = new Set([
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

    expect(expectedOwners).toStrictEqual(new Set(channelDetails.ownerMembers));
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
      token: userId1.token,
      name: 'General',
      isPublic: true
    });

    postRequest(SERVER_URL + '/channel/join/v2', {
      token: userId2.token,
      channelId: channel.channelId
    });

    const expectedResult = postRequest(SERVER_URL + '/channel/addowner/v1', {
      token: userId1.token,
      channelId: channel.channelId + 5,
      uId: userId2.authUserId
    });

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
      token: userId1.token,
      name: 'General',
      isPublic: true
    });

    postRequest(SERVER_URL + '/channel/join/v2', {
      token: userId2.token,
      channelId: channel.channelId
    });

    const expectedResult = postRequest(SERVER_URL + '/channel/addowner/v1', {
      token: userId1.token,
      channelId: channel.channelId,
      uId: userId2.authUserId + 10
    });

    expect(expectedResult).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing user is not member of channel', () => {
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

    const expectedResult = postRequest(SERVER_URL + '/channel/addowner/v1', {
      token: userId1.token,
      channelId: channel.channelId,
      uId: userId2.authUserId
    });

    expect(expectedResult).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing user is already an owner of channel', () => {
    const userId1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId1.token,
      name: 'General',
      isPublic: true
    });

    const expectedResult = postRequest(SERVER_URL + '/channel/addowner/v1', {
      token: userId1.token,
      channelId: channel.channelId,
      uId: userId1.authUserId
    });

    expect(expectedResult).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing valid channelId, but user has no owner permissions', () => {
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

    const expectedResult = postRequest(SERVER_URL + '/channel/addowner/v1', {
      token: userId2.token,
      channelId: channel.channelId,
      uId: userId1.authUserId
    });

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
      token: userId1.token,
      name: 'General',
      isPublic: true
    });

    postRequest(SERVER_URL + '/channel/join/v2', {
      token: userId2.token,
      channelId: channel.channelId
    });

    const expectedResult = postRequest(SERVER_URL + '/channel/addowner/v1', {
      token: userId1.token + 10,
      channelId: channel.channelId,
      uId: userId2.authUserId
    });

    expect(expectedResult).toStrictEqual({ error: expect.any(String) });
  });
});
