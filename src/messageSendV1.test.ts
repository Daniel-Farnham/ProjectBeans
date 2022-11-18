import { postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

describe('Testing positive cases for messageSendV1', () => {
  beforeEach(() => {
    deleteRequest(SERVER_URL + '/clear/v1', {});
  });

  test('Successfully create messageId', () => {
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

    const newMessageId = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId,
      message: 'Hello this is a random test message'
    }, userId.token);

    expect(newMessageId).toStrictEqual({ messageId: expect.any(Number) });
  });

  test('Testing messageId uniqueness', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel1 = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, userId.token);

    const channel2 = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'Boost',
      isPublic: true
    }, userId.token);

    const messageId1 = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel1.channelId,
      message: 'Hello this is a random test message'
    }, userId.token);

    const messageId2 = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel2.channelId,
      message: 'Hello this is a random test message'
    }, userId.token);

    expect(messageId1.messageId).not.toBe(messageId2.messageId);
  });
});

describe('Testing negative cases for messageSendV1', () => {
  beforeEach(() => {
    deleteRequest(SERVER_URL + '/clear/v1', {});
  });

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

    const returnedMessageObject = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId,
      message: 'Hello this is a random test message'
    }, userId.token + 1);

    expect(returnedMessageObject.statusCode).toBe(403);
    const bodyObj = JSON.parse(returnedMessageObject.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Test invalid channelId', () => {
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

    const returnedMessageObject = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId + 1,
      message: 'Hello this is a random test message'
    }, userId.token);

    expect(returnedMessageObject.statusCode).toBe(400);
    const bodyObj = JSON.parse(returnedMessageObject.body as string);
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

    const returnedMessageObject = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId,
      message: 'Hello this is a random test message'
    }, user2.token);

    expect(returnedMessageObject.statusCode).toBe(403);
    const bodyObj = JSON.parse(returnedMessageObject.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  describe('Message is an invalid length', () => {
    test.each([
      {
        message: 'a'.repeat(1001),
        desc: 'Testing message too long'
      },
      {
        message: '',
        desc: 'Testing message too short'
      },
    ])('$desc', ({ message }) => {
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

      const newMessage = postRequest(SERVER_URL + '/message/send/v2', {
        channelId: channel.channelId,
        message: message,
      }, userId.token);
      expect(newMessage.statusCode).toBe(400);
      const bodyObj = JSON.parse(newMessage.body as string);
      expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
    });
  });
});
