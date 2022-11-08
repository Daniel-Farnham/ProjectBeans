import { getRequest, postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

describe('Testing positive cases for messageSendV1', () => {
  beforeEach(() => {
    deleteRequest(SERVER_URL + '/clear/v1', {});
  });

  test('Successfully create messageId', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    const newMessageId = postRequest(SERVER_URL + '/message/send/v1', {
      channelId: channel.channelId,
      message: 'Hello this is a random test message'
    }, userId.token);

    expect(newMessageId).toStrictEqual({ messageId: expect.any(Number) });
  });

  test('Testing messageId uniqueness', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel1 = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: true
    }, userId.token);

    const channel2 = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'Boost',
      isPublic: true
    }, userId.token);

    const messageId1 = postRequest(SERVER_URL + '/message/send/v1', {
      channelId: channel1.channelId,
      message: 'Hello this is a random test message'
    }, userId.token);

    const messageId2 = postRequest(SERVER_URL + '/message/send/v1', {
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
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    const returnedMessageObject = postRequest(SERVER_URL + '/message/send/v1', {
      channelId: channel.channelId,
      message: 'Hello this is a random test message'
    }, userId.token + 1);

    expect(returnedMessageObject).toMatchObject({ error: expect.any(String) });
  });
  test('Test invalid channelId', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    const returnedMessageObject = postRequest(SERVER_URL + '/message/send/v1', {
      channelId: channel.channelId + 1,
      message: 'Hello this is a random test message'
    }, userId.token);

    expect(returnedMessageObject).toMatchObject({ error: expect.any(String) });
  });

  test('Authorised user is not a member of the channel', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'fake.mcfake@student.unsw.edu.au',
      password: 'AnEvenWorsePassword',
      nameFirst: 'Fake',
      nameLast: 'McFake',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'ChannelBoost',
      isPublic: true,
    }, user1.token);

    const ReturnedChannelObj = getRequest(SERVER_URL + '/channel/details/v2', {
      token: user2.token,
      channelId: channel.channelId
    });

    expect(ReturnedChannelObj).toMatchObject({ error: expect.any(String) });
  });

  describe('Message is an invalid length', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    const messageGreaterThan1000Char = 'a'.repeat(1001);
    const messageLessThan1Char = '';

    test.each([
      {
        token: userId.token,
        channelId: channel.channelId,
        message: messageGreaterThan1000Char,
        desc: 'Testing message too long'
      },
      {
        token: userId.token,
        channelId: channel.channelId,
        message: messageLessThan1Char,
        desc: 'Testing message too short '
      },
    ])('$desc', ({ token, channelId, message }) => {
      const newMessage = postRequest(SERVER_URL + '/message/send/v1', {
        channelId: channelId,
        message: message,
      }, token);

      expect(newMessage).toMatchObject({ error: expect.any(String) });
    });
  });
});
