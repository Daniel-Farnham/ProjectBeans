import { getRequest, postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic functionality for dmMessagesV1', () => {
  test('Testing dmMessagesV1 returns the correct types', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      token: newId.token,
      uIds: []
    });

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      token: newId.token,
      dmId: dmId.dmId,
      start: 0,
    });

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

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      token: newId.token,
      uIds: []
    });

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      token: newId.token,
      dmId: dmId.dmId,
      start: 0,
    });

    const messagesObj = {
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

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      token: newId.token,
      uIds: []
    });

    const firstMsg = postRequest(SERVER_URL + '/message/senddm/v2', {
      token: newId.token,
      dmId: dmId.dmId,
      message: 'Testing 1'
    });

    const secondMsg = postRequest(SERVER_URL + '/message/senddm/v2', {
      token: newId.token,
      dmId: dmId.dmId,
      message: 'Testing 2'
    });

    const thirdMsg = postRequest(SERVER_URL + '/message/senddm/v2', {
      token: newId.token,
      dmId: dmId.dmId,
      message: 'Testing 3'
    });

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      token: newId.token,
      dmId: dmId.dmId,
      start: 0,
    });

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
    const newId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      token: newId.token,
      uIds: []
    });

    postRequest(SERVER_URL + '/message/senddm/v2', {
      token: newId.token,
      dmId: dmId.dmId,
      message: 'Testing 1'
    });

    const secondMsg = postRequest(SERVER_URL + '/message/senddm/v2', {
      token: newId.token,
      dmId: dmId.dmId,
      message: 'Testing 2'
    });

    const thirdMsg = postRequest(SERVER_URL + '/message/senddm/v2', {
      token: newId.token,
      dmId: dmId.dmId,
      message: 'Testing 3'
    });

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      token: newId.token,
      dmId: dmId.dmId,
      start: 1,
    });

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
    const newId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      token: newId.token,
      uIds: []
    });

    for (let i = 0; i < 51; i++) {
      postRequest(SERVER_URL + '/message/senddm/v2', {
        token: newId.token,
        dmId: dmId.dmId,
        message: i.toString()
      });
    }

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      token: newId.token,
      dmId: dmId.dmId,
      start: 0,
    });

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

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      token: newId.token,
      uIds: []
    });

    for (let i = 0; i < 50; i++) {
      postRequest(SERVER_URL + '/message/senddm/v2', {
        token: newId.token,
        dmId: dmId.dmId,
        message: i.toString()
      });
    }

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      token: newId.token,
      dmId: dmId.dmId,
      start: 1,
    });

    expect(messages.start).toBe(1);
    expect(messages.end).toBe(-1);
  });
});

describe('Testing dmMessagesV1 error handling', () => {
  test('Testing dmMessagesV1 returns error when dmId is invalid', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      token: newId.token,
      dmId: 0,
      start: 0,
    });

    expect(messages).toEqual(400);
  });

  test('Testing dmMessagesV1 returns error when user is not a member', () => {
    const firstId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const secondId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hayden.smith@unsw.edu.au',
      password: '123456',
      nameFirst: 'Hayden',
      nameLast: 'Smith'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      token: firstId.token,
      uIds: []
    });

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      token: secondId.token,
      dmId: dmId.dmId,
      start: 0,
    });

    expect(messages).toEqual(403);
  });

  test('Test dmMessagesV1 error for start greater than message count', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      token: newId.token,
      uIds: []
    });

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      token: newId.token,
      dmId: dmId.dmId,
      start: 1,
    });

    expect(messages).toEqual(400);
  });
});
