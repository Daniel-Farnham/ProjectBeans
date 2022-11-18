import { getRequest, postRequest, deleteRequest, FORBIDDEN, BAD_REQUEST } from './other';
import { port, url } from './config.json';
import { messagesOutput } from './types';

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
      uIds: []
    }, newId.token);

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      dmId: dmId.dmId,
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

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, newId.token);

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      dmId: dmId.dmId,
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

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, newId.token);

    const firstMsg = postRequest(SERVER_URL + '/message/senddm/v2', {
      dmId: dmId.dmId,
      message: 'Testing 1'
    }, newId.token);

    const secondMsg = postRequest(SERVER_URL + '/message/senddm/v2', {
      dmId: dmId.dmId,
      message: 'Testing 2'
    }, newId.token);

    const thirdMsg = postRequest(SERVER_URL + '/message/senddm/v2', {
      dmId: dmId.dmId,
      message: 'Testing 3'
    }, newId.token);

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      dmId: dmId.dmId,
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

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, newId.token);

    postRequest(SERVER_URL + '/message/senddm/v2', {
      dmId: dmId.dmId,
      message: 'Testing 1'
    }, newId.token);

    const secondMsg = postRequest(SERVER_URL + '/message/senddm/v2', {
      dmId: dmId.dmId,
      message: 'Testing 2'
    }, newId.token);

    const thirdMsg = postRequest(SERVER_URL + '/message/senddm/v2', {
      dmId: dmId.dmId,
      message: 'Testing 3'
    }, newId.token);

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      dmId: dmId.dmId,
      start: 1,
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

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, newId.token);

    for (let i = 0; i < 51; i++) {
      postRequest(SERVER_URL + '/message/senddm/v2', {
        dmId: dmId.dmId,
        message: i.toString()
      }, newId.token);
    }

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      dmId: dmId.dmId,
      start: 0,
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

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, newId.token);

    for (let i = 0; i < 50; i++) {
      postRequest(SERVER_URL + '/message/senddm/v2', {
        dmId: dmId.dmId,
        message: i.toString()
      }, newId.token);
    }

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      dmId: dmId.dmId,
      start: 1,
    }, newId.token);

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
      dmId: 0,
      start: 0,
    }, newId.token);

    expect(messages.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(messages.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
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
      uIds: []
    }, firstId.token);

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      dmId: dmId.dmId,
      start: 0,
    }, secondId.token);

    expect(messages.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(messages.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Test dmMessagesV1 error for start greater than message count', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, newId.token);

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      dmId: dmId.dmId,
      start: 1,
    }, newId.token);

    expect(messages.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(messages.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Test dmMessagesV1 error when token is invalid', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, newId.token);

    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      dmId: dmId.dmId,
      start: 1,
    }, newId.token + 'NotAToken');

    expect(messages.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(messages.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
