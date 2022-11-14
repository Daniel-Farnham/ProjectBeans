import { postRequest, deleteRequest, getRequest } from './other';
import { port, url } from './config.json';
import HTTPError from 'http-errors';


const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing channelsListV3', () => {
  test('Test successful return of users channels', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
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

    const resultChannels = getRequest(SERVER_URL + '/channels/list/v2', {}, userId.token);

    expect(resultChannels).toMatchObject(expectedChannels);
  });

  test('Testing invalid authUserId', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const resultChannels = getRequest(SERVER_URL + '/channels/list/v2', {}, userId.token + 1);

    expect(resultChannels).toThrow(HTTPError);
  });

  test('Testing no channels', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });

    const expectedChannels =
    {
      channels: []
    };

    const resultChannels = getRequest(SERVER_URL + '/channels/list/v2', {}, userId.token);

    expect(resultChannels).toMatchObject(expectedChannels);
  });

  test('Testing single channel', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'edwin.ngo@ad.unsw.edu.au',
      password: 'ANicePassword',
      nameFirst: 'Edwin',
      nameLast: 'Ngo'
    });
    const channelId1 = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: true
    }, userId.token);

    const expectedChannels =
    {
      channels: [
        {
          channelId: channelId1.channelId,
          name: 'General',
        }
      ]
    };

    const resultChannels = getRequest(SERVER_URL + '/channels/list/v2', {}, userId.token);

    expect(resultChannels).toMatchObject(expectedChannels);
  });

  test('Testing many channels', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
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
      name: 'Terrys HELP Room',
      isPublic: true
    }, userId.token);
    const channelId3 = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'Boost',
      isPublic: false
    }, userId.token);
    const channelId4 = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'Aero',
      isPublic: false
    }, userId.token);
    const channelId5 = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'Egg',
      isPublic: false
    }, userId.token);

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

    const resultChannels = getRequest(SERVER_URL + '/channels/list/v2', {}, userId.token);

    expect(resultChannels).toMatchObject(expectedChannels);
  });
});
