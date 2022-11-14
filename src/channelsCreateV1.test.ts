import { postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
import HTTPError from 'http-errors';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing channelsCreateV3', () => {
  test('Test successful channel creation', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const newchannelId = postRequest(SERVER_URL + '/channels/create/v3', {
      token: userId.token,
      name: 'General',
      isPublic: true
    });

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
      token: userId.token,
      name: 'General',
      isPublic: true
    });
    const channelId2 = postRequest(SERVER_URL + '/channels/create/v3', {
      token: userId.token,
      name: 'Boost',
      isPublic: false
    });

    expect(channelId1.channelId).toThrow(HTTPError);
  });

  test('Testing invalid authUserId', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const returnedChannelId = postRequest(SERVER_URL + '/channels/create/v3', {
      token: userId.token + 1,
      name: 'General',
      isPublic: true
    });
    expect(returnedChannelId).toThrow(HTTPError);
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
      const newChannelId = postRequest(SERVER_URL + '/channels/create/v3', {
        token: token,
        name: channelName,
        isPublic: isPublic
      });
      expect(newChannelId).toThrow(HTTPError);
    });
  });
});


//toMatchObject({ error: expect.any(String) })