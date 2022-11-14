import { postRequest, deleteRequest, getRequest } from './other';
import { port, url } from './config.json';
import HTTPError from 'http-errors';


const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing successful cases for channels/listAll/v3', () => {
  test('Testing successful return of empty channels array', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham'
    });
    const resultChannels = getRequest(SERVER_URL + '/channels/listAll/v3', {
      token: user.token,
    });

    expect(resultChannels).toMatchObject({ channels: [] });
  });

  test('Testing successful return of all channels', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham'
    });

    const channelId1 = postRequest(SERVER_URL + '/channels/create/v3', {
      token: user.token,
      name: 'General',
      isPublic: true
    });

    const channelId2 = postRequest(SERVER_URL + '/channels/create/v3', {
      token: user.token,
      name: 'Boost',
      isPublic: false
    });

    const channelId3 = postRequest(SERVER_URL + '/channels/create/v3', {
      token: user.token,
      name: 'Random',
      isPublic: true
    });

    const expectedChannels = {
      channels: [
        {
          channelId: channelId1.channelId,
          name: 'General',
        },
        {
          channelId: channelId2.channelId,
          name: 'Boost',
        },
        {
          channelId: channelId3.channelId,
          name: 'Random',
        },
      ],
    };

    const resultChannels = getRequest(SERVER_URL + '/channels/listAll/v3', {
      token: user.token,
    });

    expect(resultChannels).toMatchObject(expectedChannels);
  });
});

test('Testing invalid token', () => {
  const user = postRequest(SERVER_URL + '/auth/register/v3', {
    email: 'hang.pham1@student.unsw.edu.au',
    password: 'AP@ssW0rd!',
    nameFirst: 'Hang',
    nameLast: 'Pham'
  });

  postRequest(SERVER_URL + '/channels/create/v3', {
    token: user.token,
    name: 'General',
    isPublic: true
  });

  const resultChannels = getRequest(SERVER_URL + '/channels/listAll/v3', {
    token: user.token + 'InvalidToken',
  });
  expect(resultChannels).toThrow(HTTPError)
});
