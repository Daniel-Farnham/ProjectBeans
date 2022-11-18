import { postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const FORBIDDEN = 403;
const BAD_REQUEST = 400;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

// not sure but might need to start each standup before testing or may not?
describe('Testing positive cases for standupSendV1', () => {
  test('Testing successful run of standup send', () => {
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
      length: 2,
    }, userId.token);

    postRequest(SERVER_URL + '/standup/send/v1', {
      channelId: channel.channelId,
      message: 'the first randomtest',
    }, userId.token);

    const standupSend = postRequest(SERVER_URL + '/standup/send/v1', {
      channelId: channel.channelId,
      message: 'another randomtest',
    }, userId.token);

    expect(standupSend).toMatchObject({});
  });
});

describe('Testing negative cases for standupSendV1', () => {
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

    const returnedChannelObject = postRequest(SERVER_URL + '/standup/send/v1', {
      channelId: channel.channelId,
      message: 'randomtest',
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

    const returnedChannelObject = postRequest(SERVER_URL + '/standup/send/v1', {
      channelId: channel.channelId + 1,
      message: 'randomtest',
    }, userId.token);

    expect(returnedChannelObject.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(returnedChannelObject.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Message length is over 1000 characters', () => {
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

    const returnedChannelObject = postRequest(SERVER_URL + '/standup/send/v1', {
      channelId: channel.channelId,
      message: 'a'.repeat(1001),
    }, userId.token);

    expect(returnedChannelObject.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(returnedChannelObject.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('An active standup is not current running in the channel', () => {
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

    const standupSend = postRequest(SERVER_URL + '/standup/send/v1', {
      channelId: channel.channelId,
      message: 'randomtest',
    }, userId.token);

    // need to add in /standup/send
    expect(standupSend.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(standupSend.body as string);
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

    const ReturnedChannelObj = postRequest(SERVER_URL + '/standup/send/v1', {
      channelId: channel.channelId,
      message: 'randomtest'
    }, user2.token);

    expect(ReturnedChannelObj.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(ReturnedChannelObj.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});

/*

400 Error:
    channelId does not refer to a valid channel
    length is a negative integer
    an active standup is currently running in the channel

403 Error:

    channelId is valid and the authorised user is not a member of the channel
*/
