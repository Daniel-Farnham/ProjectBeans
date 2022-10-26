import { postRequest, deleteRequest, getRequest } from './other';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  // clearV1();
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing channelsListV1', () => {
  test('Test successful return of users channels', () => {
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

    const expectedChannels =
    {
      channels: [
        {
          channelId: channelId1.channelId,
          name: 'General',
        },
        {
          channelId: channelId2.channelId,
          name: 'Boost',
        },
      ]
    };

    const resultChannels = getRequest(SERVER_URL + '/channels/list/v2', {
      token: userId.token
    });

    expect(resultChannels).toMatchObject(expectedChannels);
  });

  test('Testing invalid authUserId', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const resultChannels = getRequest(SERVER_URL + '/channels/list/v2', {
      token: userId.token + 1
    });

    expect(resultChannels).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing no channels', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const expectedChannels =
    {
      channels: []
    };

    const resultChannels = getRequest(SERVER_URL + '/channels/list/v2', {
      token: userId.token
    });

    expect(resultChannels).toMatchObject(expectedChannels);
  });

  test('Testing single channel', () => {
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

    const expectedChannels =
    {
      channels: [
        {
          channelId: channelId1.channelId,
          name: 'General',
        }
      ]
    };

    const resultChannels = getRequest(SERVER_URL + '/channels/list/v2', {
      token: userId.token
    });

    expect(resultChannels).toMatchObject(expectedChannels);
  });

  test('Testing many channels', () => {
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
      name: 'Terrys HELP Room',
      isPublic: true
    });
    const channelId3 = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token,
      name: 'Boost',
      isPublic: false
    });
    const channelId4 = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token,
      name: 'Aero',
      isPublic: false
    });
    const channelId5 = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token,
      name: 'Egg',
      isPublic: false
    });

    const expectedChannels =
    {
      channels: [
        {
          channelId: channelId1.channelId,
          name: 'General',
        },
        {
          channelId: channelId2.channelId,
          name: 'Terrys HELP Room',
        },
        {
          channelId: channelId3.channelId,
          name: 'Boost',
        },
        {
          channelId: channelId4.channelId,
          name: 'Aero',
        },
        {
          channelId: channelId5.channelId,
          name: 'Egg',
        },
      ]
    };

    const resultChannels = getRequest(SERVER_URL + '/channels/list/v2', {
      token: userId.token
    });

    expect(resultChannels).toMatchObject(expectedChannels);
  });
});
