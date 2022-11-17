import { getRequest, postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
import { messagesOutput } from './types';

const SERVER_URL = `${url}:${port}`;
const FORBIDDEN = 403;
const BAD_REQUEST = 400;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic functionality for messagesOutputV1', () => {
  test('Testing messagesOutputV1 returns the correct types', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: false,
    }, newId.token);

    const messages: messagesOutput = getRequest(SERVER_URL + '/channel/messages/v3', {
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
    const newId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: false,
    }, newId.token);

    const messages = getRequest(SERVER_URL + '/channel/messages/v3', {
      channelId: channel.channelId,
      start: 0,
    }, newId.token);

    const messagesObj: messagesOutput = {
      messages: [],
      start: 0,
      end: -1
    };

    expect(messages).toMatchObject(messagesObj);
  });

  test('Testing when start is 0 and messages is not empty', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: false,
    }, newId.token);

    const firstMsg = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId,
      message: 'Testing 1'
    }, newId.token);

    const secondMsg = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId,
      message: 'Testing 2'
    }, newId.token);

    const thirdMsg = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId,
      message: 'Testing 3'
    }, newId.token);

    const messages = getRequest(SERVER_URL + '/channel/messages/v3', {
      channelId: channel.channelId,
      start: 0,
    }, newId.token);

    const messagesObj: messagesOutput = {
      messages: [
        {
          messageId: thirdMsg.messageId,
          uId: newId.authUserId,
          message: 'Testing 3',
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false,
        },
        {
          messageId: secondMsg.messageId,
          uId: newId.authUserId,
          message: 'Testing 2',
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false,
        },
        {
          messageId: firstMsg.messageId,
          uId: newId.authUserId,
          message: 'Testing 1',
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1
    };
    expect(messages).toMatchObject(messagesObj);
  });

  test('Testing when start is not 0 and messages is not empty', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: false,
    }, newId.token);

    postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId,
      message: 'Testing 1'
    }, newId.token);

    const secondMsg = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId,
      message: 'Testing 2'
    }, newId.token);

    const thirdMsg = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId,
      message: 'Testing 3'
    }, newId.token);

    const messages = getRequest(SERVER_URL + '/channel/messages/v3', {
      channelId: channel.channelId,
      start: 1
    }, newId.token);

    const messagesObj: messagesOutput = {
      messages: [
        {
          messageId: thirdMsg.messageId,
          uId: newId.authUserId,
          message: 'Testing 3',
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false,
        },
        {
          messageId: secondMsg.messageId,
          uId: newId.authUserId,
          message: 'Testing 2',
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false,
        }
      ],
      start: 1,
      end: -1
    };

    expect(messages).toMatchObject(messagesObj);
  });

  test('Testing end isn\'t -1 when start is 0 and 51 messages exist', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: false,
    }, newId.token);

    for (let i = 0; i < 51; i++) {
      postRequest(SERVER_URL + '/message/send/v2', {
        channelId: channel.channelId,
        message: i.toString()
      }, newId.token);
    }

    const messages: messagesOutput = getRequest(SERVER_URL + '/channel/messages/v3', {
      channelId: channel.channelId,
      start: 0
    }, newId.token);

    expect(messages.start).toBe(0);
    expect(messages.end).toBe(49);
  });

  test('Testing end is -1 when start isn\'t 0 and 50 messages exist', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: false,
    }, newId.token);

    for (let i = 0; i < 50; i++) {
      postRequest(SERVER_URL + '/message/send/v2', {
        channelId: channel.channelId,
        message: i.toString()
      }, newId.token);
    }

    const messages: messagesOutput = getRequest(SERVER_URL + '/channel/messages/v3', {
      channelId: channel.channelId,
      start: 1
    }, newId.token);

    expect(messages.start).toBe(1);
    expect(messages.end).toBe(-1);
  });
});

describe('Testing messagesOutputV1 error handling', () => {
  test.each([
    {
      name: 'General',
      isPublic: true,
      tokenOffset: '',
      channelIdOffset: 1,
      start: 0,
      desc: 'Testing an invalid channelId',
      statusCode: BAD_REQUEST
    },
    {
      name: 'Test',
      isPublic: false,
      tokenOffset: '',
      channelIdOffset: 0,
      start: 1,
      desc: 'Testing when start is greater than number of messages',
      statusCode: BAD_REQUEST
    },
    {
      name: '1234',
      isPublic: true,
      tokenOffset: 'invalid token',
      channelIdOffset: 0,
      start: 0,
      desc: 'Testing an invalid authUserId',
      statusCode: FORBIDDEN
    },
  ])('$desc', ({ name, isPublic, tokenOffset, channelIdOffset, start, statusCode }) => {
    const newId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: false,
    }, newId.token);

    const messages = getRequest(SERVER_URL + '/channel/messages/v3', {
      channelId: channel.channelId + channelIdOffset,
      start: start,
    }, newId.token + tokenOffset);

    expect(messages.statusCode).toBe(statusCode);
    const bodyObj = JSON.parse(messages.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing a user that isn\'t a member of the channel', () => {
    const firstId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hayden.smith@unsw.edu.au',
      password: '123456',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });

    const secondId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ABD',
      isPublic: true,
    }, firstId.token);

    const messages = getRequest(SERVER_URL + '/channel/messages/v3', {
      channelId: channel.channelId,
      start: 0,
    }, secondId.token);

    expect(messages.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(messages.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
