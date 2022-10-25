import { postRequest, deleteRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
// const OK = 200;

beforeEach(() => {
  // clearV1()
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing channelsCreateV1', () => {
  test('Test successful channel creation', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const newchannelId = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token,
      name: 'General',
      isPublic: true
    });

    // expect(newchannelId.status).toStrictEqual(OK);
    expect(newchannelId).toStrictEqual({ token: expect.any(String) });
  });

  test('Testing Channel Uniqueness', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });
    const channelId1 = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token,
      name: 'General',
      isPublic: true
    });
    const channelId2 = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token,
      name: 'Boost',
      isPublic: false
    });
    // expect(channelId1.status).toStrictEqual(OK);
    // expect(channelId2.status).toStrictEqual(OK);
    expect(channelId1.channelId).not.toBe(channelId2.channelId);
  });

  test('Testing invalid authUserId', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const returnedChannelId = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token + 1,
      name: 'General',
      isPublic: true
    });
    expect(returnedChannelId).toStrictEqual({ error: expect.any(String) });
  });

  describe('Test if name length is valid', () => {
    test.each([
      {
        userId: '1',
        token: '1',
        channelName: '',
        isPublic: 'true',
        desc: 'Testing if name is less than 1 character'
      },
      {
        userId: '1',
        token: '1',
        channelName: 'ThisNameIsNotAllowedBecauseItIsTooLong',
        isPublic: 'true',
        desc: 'Testing if name is over 20 characters'
      },
    ])('$desc', ({ token, channelName, isPublic }) => {
      const newChannelId = postRequest(SERVER_URL + '/channels/create/v2', {
        token: token,
        name: channelName,
        isPublic: isPublic
      });
      expect(newChannelId).toMatchObject({ error: expect.any(String) });
    });
  });
});
