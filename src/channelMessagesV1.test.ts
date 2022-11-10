import { getRequest, postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic functionality for channelMessagesV1', () => {
  test('Testing channelMessagesV1 returns the correct types', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: false,
    }, newId.token);

    const messages = getRequest(SERVER_URL + '/channel/messages/v2', {
      channelId: channel.channelId,
      start: 0,
    }, newId.token);

    expect(messages).toStrictEqual({
      messages: expect.any(Array),
      start: expect.any(Number),
      end: expect.any(Number)
    });
  });

  test('Testing when start is 0 and messages is empty', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: false,
    }, newId.token);

    const messages = getRequest(SERVER_URL + '/channel/messages/v2', {
      channelId: channel.channelId,
      start: 0,
    }, newId.token);

    const messagesObj = {
      messages: [],
      start: 0,
      end: -1
    };

    expect(messages).toMatchObject(messagesObj);
  });

  test('Testing when start is 0 and messages is not empty', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: false,
    }, newId.token);

    const firstMsg = postRequest(SERVER_URL + '/message/send/v1', {
      channelId: channel.channelId,
      message: 'Testing 1'
    }, newId.token);

    const secondMsg = postRequest(SERVER_URL + '/message/send/v1', {
      channelId: channel.channelId,
      message: 'Testing 2'
    }, newId.token);

    const thirdMsg = postRequest(SERVER_URL + '/message/send/v1', {
      channelId: channel.channelId,
      message: 'Testing 3'
    }, newId.token);

    const messages = getRequest(SERVER_URL + '/channel/messages/v2', {
      channelId: channel.channelId,
      start: 0,
    }, newId.token);

    const messagesObj = {
      messages: [
        {
          messageId: thirdMsg.messageId,
          uId: newId.authUserId,
          message: 'Testing 3',
          timeSent: expect.any(Number)
        },
        {
          messageId: secondMsg.messageId,
          uId: newId.authUserId,
          message: 'Testing 2',
          timeSent: expect.any(Number)
        },
        {
          messageId: firstMsg.messageId,
          uId: newId.authUserId,
          message: 'Testing 1',
          timeSent: expect.any(Number)
        }
      ],
      start: 0,
      end: -1
    };

    expect(messages).toMatchObject(messagesObj);
  });

  test('Testing when start is not 0 and messages is not empty', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: false,
    }, newId.token);

    postRequest(SERVER_URL + '/message/send/v1', {
      channelId: channel.channelId,
      message: 'Testing 1'
    }, newId.token);

    const secondMsg = postRequest(SERVER_URL + '/message/send/v1', {
      channelId: channel.channelId,
      message: 'Testing 2'
    }, newId.token);

    const thirdMsg = postRequest(SERVER_URL + '/message/send/v1', {
      channelId: channel.channelId,
      message: 'Testing 3'
    }, newId.token);

    const messages = getRequest(SERVER_URL + '/channel/messages/v2', {
      channelId: channel.channelId,
      start: 1
    }, newId.token);

    const messagesObj = {
      messages: [
        {
          messageId: thirdMsg.messageId,
          uId: newId.authUserId,
          message: 'Testing 3',
          timeSent: expect.any(Number)
        },
        {
          messageId: secondMsg.messageId,
          uId: newId.authUserId,
          message: 'Testing 2',
          timeSent: expect.any(Number)
        }
      ],
      start: 1,
      end: -1
    };

    expect(messages).toMatchObject(messagesObj);
  });

  test('Testing end isn\'t -1 when start is 0 and 51 messages exist', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: false,
    }, newId.token);

    for (let i = 0; i < 51; i++) {
      postRequest(SERVER_URL + '/message/send/v1', {
        channelId: channel.channelId,
        message: i.toString()
      }, newId.token);
    }

    const messages = getRequest(SERVER_URL + '/channel/messages/v2', {
      channelId: channel.channelId,
      start: 0
    }, newId.token);

    expect(messages.start).toBe(0);
    expect(messages.end).toBe(49);
  });

  test('Testing end is -1 when start isn\'t 0 and 50 messages exist', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: false,
    }, newId.token);

    for (let i = 0; i < 50; i++) {
      postRequest(SERVER_URL + '/message/send/v1', {
        channelId: channel.channelId,
        message: i.toString()
      }, newId.token);
    }

    const messages = getRequest(SERVER_URL + '/channel/messages/v2', {
      channelId: channel.channelId,
      start: 1
    }, newId.token);

    expect(messages.start).toBe(1);
    expect(messages.end).toBe(-1);
  });
});

describe('Testing channelMessagesV1 error handling', () => {
  test.each([
    {
      name: 'General',
      isPublic: true,
      tokenOffset: '',
      channelIdOffset: 1,
      start: 0,
      desc: 'Testing an invalid channelId'
    },
    {
      name: 'Test',
      isPublic: false,
      tokenOffset: '',
      channelIdOffset: 0,
      start: 1,
      desc: 'Testing when start is greater than number of messages'
    },
    {
      name: '1234',
      isPublic: true,
      tokenOffset: 'invalid token',
      channelIdOffset: 0,
      start: 0,
      desc: 'Testing an invalid authUserId'
    },
  ])('$desc', ({ name, isPublic, tokenOffset, channelIdOffset, start }) => {
    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'General',
      isPublic: false,
    }, newId.token);

    const messages = getRequest(SERVER_URL + '/channel/messages/v2', {
      channelId: channel.channelId + channelIdOffset,
      start: start,
    }, newId.token + tokenOffset);

    expect(messages).toMatchObject({ error: expect.any(String) });
  });

  test('Testing a user that isn\'t a member of the channel', () => {
    const firstId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hayden.smith@unsw.edu.au',
      password: '123456',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });

    const secondId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      name: 'ABD',
      isPublic: true,
    }, firstId.token);

    const messages = getRequest(SERVER_URL + '/channel/messages/v2', {
      channelId: channel.channelId,
      start: 0,
    }, secondId.token);

    expect(messages).toMatchObject({ error: expect.any(String) });
  });
});
