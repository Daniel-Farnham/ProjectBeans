import { postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const FORBIDDEN = 403;
const BAD_REQUEST = 400;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing positive cases for standupStartV1', () => {
  test('Testing successful return of timeFinish', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    const standupStart = postRequest(SERVER_URL + '/standup/start/v1', {
      channelId: channel.channelId,
      length: 1,
    }, userId.token);

    expect(standupStart).toStrictEqual({ timeFinish: expect.any(Number) });
  });

  test('Testing start standup immediately after the end of a prior standup', () => {
    const length = 3;
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    postRequest(SERVER_URL + '/standup/start/v1', {
      channelId: channel.channelId,
      length: length,
    }, userId.token);

    // Es Lint does not allow empty loops. Hence the existence of the dummyvariable.
    let currentTime = new Date().getTime();
    const expire = currentTime + length * 1000;
    while (currentTime < expire) {
      currentTime = new Date().getTime();
    }

    const standupStartAgain = postRequest(SERVER_URL + '/standup/start/v1', {
      channelId: channel.channelId,
      length: length,
    }, userId.token);

    expect(standupStartAgain).toStrictEqual({ timeFinish: expect.any(Number) });
  });
});

describe('Testing negative cases for standupStartV1', () => {
  test('Testing invalid token', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    const returnedChannelObject = postRequest(SERVER_URL + '/standup/start/v1', {
      channelId: channel.channelId,
      length: 1,
    }, userId.token + 1);

    expect(returnedChannelObject.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(returnedChannelObject.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing invalid channelId', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    const returnedChannelObject = postRequest(SERVER_URL + '/standup/start/v1', {
      channelId: channel.channelId + 1,
      length: 1,
    }, userId.token);

    expect(returnedChannelObject.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(returnedChannelObject.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Length is a negative integer', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    const returnedChannelObject = postRequest(SERVER_URL + '/standup/start/v1', {
      channelId: channel.channelId,
      length: -1,
    }, userId.token);

    expect(returnedChannelObject.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(returnedChannelObject.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('An active standup is already running', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    postRequest(SERVER_URL + '/standup/start/v1', {
      channelId: channel.channelId,
      length: 1,
    }, userId.token);

    const standupStartAgain = postRequest(SERVER_URL + '/standup/start/v1', {
      channelId: channel.channelId,
      length: 1,
    }, userId.token);

    expect(standupStartAgain.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(standupStartAgain.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Authorised user is not a member of the channel', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const user2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'fake.mcfake@student.unsw.edu.au',
      password: 'AnEvenWorsePassword',
      nameFirst: 'Fake',
      nameLast: 'McFake',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, user1.token);

    const ReturnedChannelObj = postRequest(SERVER_URL + '/standup/start/v1', {
      channelId: channel.channelId
    }, user2.token);

    expect(ReturnedChannelObj.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(ReturnedChannelObj.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
