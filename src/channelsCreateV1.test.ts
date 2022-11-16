import { postRequest, deleteRequest, FORBIDDEN, BAD_REQUEST } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing channelsCreateV1', () => {
  test('Test successful channel creation', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const newchannelId = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, userId.token);

    expect(newchannelId).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Testing Channel Uniqueness', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });
    const channelId1 = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, userId.token);
    const channelId2 = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'Boost',
      isPublic: false
    }, userId.token);

    expect(channelId1.channelId).not.toBe(channelId2.channelId);
  });

  test('Testing invalid authUserId', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const returnedChannelId = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, userId.token + 1);

    expect(returnedChannelId.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(returnedChannelId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  describe('Test if name length is valid', () => {
    test('Channel name is less than 1 character', () => {
      const userId = postRequest(SERVER_URL + '/auth/register/v3', {
        email: 'edwin.ngo@ad.unsw.edu.au',
        password: 'ANicePassword',
        nameFirst: 'Edwin',
        nameLast: 'Ngo'
      });

      const returnedChannelId = postRequest(SERVER_URL + '/channels/create/v3', {
        name: '',
        isPublic: true
      }, userId.token);

      expect(returnedChannelId.statusCode).toBe(BAD_REQUEST);
      const bodyObj = JSON.parse(returnedChannelId.body as string);
      expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
    });
    test('Channel name is more than 20 characters', () => {
      const userId = postRequest(SERVER_URL + '/auth/register/v3', {
        email: 'edwin.ngo@ad.unsw.edu.au',
        password: 'ANicePassword',
        nameFirst: 'Edwin',
        nameLast: 'Ngo'
      });

      const returnedChannelId = postRequest(SERVER_URL + '/channels/create/v3', {
        name: 'Verylongchannelname!!!!!!!!',
        isPublic: true
      }, userId.token);

      expect(returnedChannelId.statusCode).toBe(BAD_REQUEST);
      const bodyObj = JSON.parse(returnedChannelId.body as string);
      expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
    });
  });
});
