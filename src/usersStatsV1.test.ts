import { getRequest, postRequest, deleteRequest, FORBIDDEN } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic usersStatsV1 functionality', () => {
  test('Testing usersStatsV1 returns the correct information when nothing has been made', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const stats = getRequest(SERVER_URL + '/users/stats/v1', {
    }, regId.token);

    const expectedStats = {
      channelsExist: [{ numChannelsExist: 0, timeStamp: expect.any(Number) }],
      dmsExist: [{ numDmsExist: 0, timeStamp: expect.any(Number) }],
      messagesExist: [{ numMessagesExist: 0, timeStamp: expect.any(Number) }],
      utilizationRate: 0
    };

    expect(stats).toMatchObject({ workspaceStats: expectedStats });
  });

  test('Testing usersStatsV1 returns the correct information when channels, dms and message are made', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const channelId = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, regId.token);

    postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channelId.channelId,
      message: 'Hello this is a random test message'
    }, regId.token);

    const stats = getRequest(SERVER_URL + '/users/stats/v1', {
    }, regId.token);

    const expectedStats = {
      channelsExist: [
        { numChannelsExist: 0, timeStamp: expect.any(Number) },
        { numChannelsExist: 1, timeStamp: expect.any(Number) }
      ],
      dmsExist: [
        { numDmsExist: 0, timeStamp: expect.any(Number) },
        { numDmsExist: 1, timeStamp: expect.any(Number) }
      ],
      messagesExist: [
        { numMessagesExist: 0, timeStamp: expect.any(Number) },
        { numMessagesExist: 1, timeStamp: expect.any(Number) }
      ],
      utilizationRate: 1
    };

    expect(stats).toMatchObject({ workspaceStats: expectedStats });
  });

  test('Testing usersStatsV1 returns the correct information when channels/dms are removed', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const secondId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });

    const channelId = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, regId.token);

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: [secondId.authUserId]
    }, regId.token);

    const message = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channelId.channelId,
      message: 'Hello this is a another random test message'
    }, regId.token);

    deleteRequest(SERVER_URL + '/message/remove/v2', {
      messageId: message.messageId,
    }, regId.token);

    postRequest(SERVER_URL + '/message/senddm/v2', {
      dmId: dmId.dmId,
      message: 'This is my first message'
    }, secondId.token);

    deleteRequest(SERVER_URL + '/dm/remove/v2', {
      dmId: dmId.dmId
    }, regId.token);

    const stats = getRequest(SERVER_URL + '/users/stats/v1', {
    }, regId.token);

    const expectedStats = {
      channelsExist: [
        { numChannelsExist: 0, timeStamp: expect.any(Number) },
        { numChannelsExist: 1, timeStamp: expect.any(Number) }
      ],
      dmsExist: [
        { numDmsExist: 0, timeStamp: expect.any(Number) },
        { numDmsExist: 1, timeStamp: expect.any(Number) },
        { numDmsExist: 0, timeStamp: expect.any(Number) }
      ],
      messagesExist: [
        { numMessagesExist: 0, timeStamp: expect.any(Number) },
        { numMessagesExist: 1, timeStamp: expect.any(Number) },
        { numMessagesExist: 0, timeStamp: expect.any(Number) },
        { numMessagesExist: 1, timeStamp: expect.any(Number) },
        { numMessagesExist: 0, timeStamp: expect.any(Number) }
      ],
      utilizationRate: 0.5
    };

    expect(stats).toMatchObject({ workspaceStats: expectedStats });
  });
});

describe('Testing usersStatsV1 error handling', () => {
  test('Testing usersStatsV1 returns error when token is invalid', () => {
    const stats = getRequest(SERVER_URL + '/users/stats/v1', {
    }, 'NotAToken');

    expect(stats.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(stats.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
