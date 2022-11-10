import { postRequest, deleteRequest, getRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing successful cases for channels/listAll/v2', () => {
  test('Testing successful return of empty channels array', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham'
    });
    const resultChannels = getRequest(SERVER_URL + '/channels/listAll/v2', {}, user.token);

    expect(resultChannels).toMatchObject({ channels: [] });
  });

  test('Testing successful return of all channels', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham'
    });

    const channelId1 = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: true
    }, user.token);

    const channelId2 = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'Boost',
      isPublic: false
    }, user.token);

    const channelId3 = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'Random',
      isPublic: true
    }, user.token);

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

    const resultChannels = getRequest(SERVER_URL + '/channels/listAll/v2', {}, user.token);

    expect(resultChannels).toMatchObject(expectedChannels);
  });
});

test('Testing invalid token', () => {
  const user = postRequest(SERVER_URL + '/auth/register/v2', {
    email: 'hang.pham1@student.unsw.edu.au',
    password: 'AP@ssW0rd!',
    nameFirst: 'Hang',
    nameLast: 'Pham'
  });

  postRequest(SERVER_URL + '/channels/create/v2', {
    name: 'General',
    isPublic: true
  }, user.token);

  const resultChannels = getRequest(SERVER_URL + '/channels/listAll/v2', {}, user.token + 'InvalidToken');
  expect(resultChannels).toStrictEqual(
    {
      error: expect.any(String),
    });
});
