
import { getRequest, postRequest, putRequest, deleteRequest, BAD_REQUEST, FORBIDDEN, sleep } from './other';
import { port, url } from './config.json';
import { messagesOutput } from './types';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic messageSendlaterdmV1 functionality', () => {
  test('Testing messageSendlaterdmV1 successfully returns an integer id', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlaterdm/v1', {
      dmId: dmId.dmId,
      message: 'This is a test.',
      timeSent: timeSent + 1
    }, regId.token);

    sleep(2);
    expect(newMessageId).toStrictEqual({ messageId: expect.any(Number) });
  });

  test('Testing messageSendlaterdmV1 successfully sends a message in a dm', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlaterdm/v1', {
      dmId: dmId.dmId,
      message: 'This is also a test.',
      timeSent: timeSent + 1
    }, regId.token);

    sleep(2);
    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      dmId: dmId.dmId,
      start: 0,
    }, regId.token);

    const expectedMessages: messagesOutput = {
      messages: [
        {
          messageId: newMessageId.messageId,
          uId: regId.authUserId,
          message: 'This is also a test.',
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

    expect(messages).toStrictEqual(expectedMessages);
  });

  test('Testing messageSendlaterdmV1 sends a message that can\'t be viewed until timeSent', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlaterdm/v1', {
      dmId: dmId.dmId,
      message: 'This is also another test.',
      timeSent: timeSent + 10
    }, regId.token);

    // Expect there to be no messages in the dm for 10 seconds
    const firstMessages = getRequest(SERVER_URL + '/dm/messages/v2', {
      dmId: dmId.dmId,
      start: 0,
    }, regId.token);

    expect(firstMessages.messages).toStrictEqual([]);

    sleep(11);
    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      dmId: dmId.dmId,
      start: 0,
    }, regId.token);

    const expectedMessages: messagesOutput = {
      messages: [
        {
          messageId: newMessageId.messageId,
          uId: regId.authUserId,
          message: 'This is also another test.',
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

    expect(messages).toStrictEqual(expectedMessages);
  });

  test('Testing messageSendlaterdmV1 sends a message that can\'t be edited until timeSent', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlaterdm/v1', {
      dmId: dmId.dmId,
      message: 'This is also another test.',
      timeSent: timeSent + 1
    }, regId.token);

    // Expect not to be able to edit the message for 1 second
    const failedEdit = putRequest(SERVER_URL + '/message/edit/v2', {
      messageId: newMessageId.messageId,
      message: 'This is an edited message'
    }, regId.token);

    expect(failedEdit.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(failedEdit.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });

    sleep(2);
    const editedMessage = putRequest(SERVER_URL + '/message/edit/v2', {
      messageId: newMessageId.messageId,
      message: 'This is an edited message'
    }, regId.token);

    expect(editedMessage).toStrictEqual({});
  });

  test('Testing messageSendlaterV1 sends a message that can\'t be deleted until timeSent', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlaterdm/v1', {
      dmId: dmId.dmId,
      message: 'This is another test.',
      timeSent: timeSent + 1
    }, regId.token);

    // Expect not to be able to remove the message for 1 second
    const failedRemove = deleteRequest(SERVER_URL + '/message/remove/v2', {
      messageId: newMessageId.messageId,
    }, regId.token);

    expect(failedRemove.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(failedRemove.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });

    sleep(2);
    const removedMessage = deleteRequest(SERVER_URL + '/message/remove/v2', {
      messageId: newMessageId.messageId,
    }, regId.token);

    expect(removedMessage).toStrictEqual({});
  });

  test('Testing message/sendlaterdm/v1 is cancelled once dm/remove is called', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    postRequest(SERVER_URL + '/message/sendlaterdm/v1', {
      dmId: dmId.dmId,
      message: 'This is another test!!!',
      timeSent: timeSent + 5
    }, regId.token);

    deleteRequest(SERVER_URL + '/dm/remove/v2', {
      dmId: dmId.dmId
    }, regId.token);

    sleep(6);
    const messages = getRequest(SERVER_URL + '/dm/messages/v2', {
      dmId: dmId.dmId,
      start: 0,
    }, regId.token);

    expect(messages.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(messages.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('Testing messageSendlaterdmV1 error handling', () => {
  test('Testing messageSendlaterdmV1 returns error when dmId is invalid', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlaterdm/v1', {
      dmId: 1,
      message: 'This is a test.',
      timeSent: timeSent + 1
    }, regId.token);

    expect(newMessageId.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(newMessageId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing messageSendlaterdmV1 returns error when message length < 1', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlaterdm/v1', {
      dmId: dmId.dmId,
      message: '',
      timeSent: timeSent + 1
    }, regId.token);

    expect(newMessageId.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(newMessageId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing messageSendlaterdmV1 returns error when message length > 1000', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    let longMessage = 'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop';
    while (longMessage.length <= 1000) {
      longMessage += longMessage;
    }

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlaterdm/v1', {
      dmId: dmId.dmId,
      message: longMessage,
      timeSent: timeSent + 1
    }, regId.token);

    expect(newMessageId.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(newMessageId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing messageSendlaterdmV1 returns error when timeSent is in the past', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlaterdm/v1', {
      dmId: dmId.dmId,
      message: 'Test',
      timeSent: timeSent - 10
    }, regId.token);

    expect(newMessageId.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(newMessageId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing messageSendlaterdmV1 returns error when user is not a dm member', () => {
    const firstId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const secondId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, firstId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlaterdm/v1', {
      dmId: dmId.dmId,
      message: 'Second user is not a member!',
      timeSent: timeSent + 1
    }, secondId.token);

    expect(newMessageId.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(newMessageId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing messageSendlaterdmV1 returns error when token is invalid', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: []
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlaterdm/v1', {
      dmId: dmId.dmId,
      message: 'token test',
      timeSent: timeSent + 1
    }, regId.token + 'NotAToken');

    expect(newMessageId.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(newMessageId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
