import { postRequest, deleteRequest, getRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;


beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

// Working cases
test('Testing successful return of all channels', () => {
  const user = postRequest(SERVER_URL + '/auth/register/v2', {
    email: 'hang.pham1@student.unsw.edu.au',
    password: 'AP@ssW0rd!',
    nameFirst: 'Hang',
    nameLast: 'Pham'
  });

  const channelId1 = postRequest(SERVER_URL + '/channels/create/v2', {
    token: user.token,
    name: 'General',
    isPublic: true
  });

  const channelId2 = postRequest(SERVER_URL + '/channels/create/v2', {
    token: user.token,
    name: 'Boost',
    isPublic: false
  });

  const channelId3 = postRequest(SERVER_URL + '/channels/create/v2', {
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

  const resultChannels = getRequest(SERVER_URL + '/channels/listAll/v2', {
    token: user.token,
  });

  expect(resultChannels).toMatchObject(expectedChannels);
});

test('Testing invalid token', () => {
  const user = postRequest(SERVER_URL + '/auth/register/v2', {
    email: 'hang.pham1@student.unsw.edu.au',
    password: 'AP@ssW0rd!',
    nameFirst: 'Hang',
    nameLast: 'Pham'
  });

  postRequest(SERVER_URL + '/channels/create/v2', {
    token: user.token,
    name: 'General',
    isPublic: true
  });

  const resultChannels = getRequest(SERVER_URL + '/channels/listAll/v2', {
    token: user.token + 'InvalidToken',
  });
  expect(resultChannels).toStrictEqual(
  {
    error: expect.any(String),
  });
});
