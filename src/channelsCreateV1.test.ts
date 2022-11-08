import { postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
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
      name: 'General',
      isPublic: true
    }, userId.token);

    expect(newchannelId).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Testing Channel Uniqueness', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });
    const channelId1 = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: true
    }, userId.token);
    const channelId2 = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'Boost',
      isPublic: false
    }, userId.token);

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
      name: 'General',
      isPublic: true
    }, userId.token + 1);
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
        name: channelName,
        isPublic: isPublic
      }, token);
      expect(newChannelId).toMatchObject({ error: expect.any(String) });
    });
  });
});
