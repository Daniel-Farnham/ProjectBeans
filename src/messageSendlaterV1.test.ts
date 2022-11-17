import {
  getRequest, postRequest, putRequest, deleteRequest,
  BAD_REQUEST, FORBIDDEN, sleep
} from './other';
import { port, url } from './config.json';
import { messagesOutput } from './types';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic messageSendlaterV1 functionality', () => {
  test('Testing messageSendlaterV1 successfully returns an integer id', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'Test',
      isPublic: true,
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlater/v1', {
      channelId: channel.channelId,
      message: 'This is a test.',
      timeSent: timeSent + 1
    }, regId.token);

    sleep(2);
    expect(newMessageId).toStrictEqual({ messageId: expect.any(Number) });
  });

  test('Testing messageSendlaterV1 successfully sends a message in a channel', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'Testing',
      isPublic: true,
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlater/v1', {
      channelId: channel.channelId,
      message: 'This is also a test.',
      timeSent: timeSent + 1
    }, regId.token);

    sleep(2);
    const messages = getRequest(SERVER_URL + '/channel/messages/v3', {
      channelId: channel.channelId,
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

  test('Testing messageSendlaterV1 sends a message that can\'t be viewed until timeSent', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'Testing2',
      isPublic: true,
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlater/v1', {
      channelId: channel.channelId,
      message: 'This is also another test.',
      timeSent: timeSent + 10
    }, regId.token);

    // Expect there to be no messages in the channel for 10 seconds
    const firstMessages = getRequest(SERVER_URL + '/channel/messages/v3', {
      channelId: channel.channelId,
      start: 0,
    }, regId.token);

    expect(firstMessages.messages).toStrictEqual([]);

    sleep(11);
    const messages = getRequest(SERVER_URL + '/channel/messages/v3', {
      channelId: channel.channelId,
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

  test('Testing messageSendlaterV1 sends a message that can\'t be edited until timeSent', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'Testing3',
      isPublic: true,
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlater/v1', {
      channelId: channel.channelId,
      message: 'This is also another test!',
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

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'Testing4',
      isPublic: true,
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlater/v1', {
      channelId: channel.channelId,
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
});

describe('Testing messageSendlaterV1 error handling', () => {
  test('Testing messageSendlaterV1 returns error when channelId is invalid', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlater/v1', {
      channelId: 1,
      message: 'This is a test.',
      timeSent: timeSent + 1
    }, regId.token);

    expect(newMessageId.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(newMessageId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing messageSendlaterV1 returns error when message length < 1', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ErrorTest',
      isPublic: true,
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlater/v1', {
      channelId: channel.channelId,
      message: '',
      timeSent: timeSent + 1
    }, regId.token);

    expect(newMessageId.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(newMessageId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing messageSendlaterV1 returns error when message length > 1000', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ErrorTest2',
      isPublic: true,
    }, regId.token);

    let longMessage = 'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop';
    while (longMessage.length <= 1000) {
      longMessage += longMessage;
    }

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlater/v1', {
      channelId: channel.channelId,
      message: longMessage,
      timeSent: timeSent + 1
    }, regId.token);

    expect(newMessageId.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(newMessageId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing messageSendlaterV1 returns error when timeSent is in the past', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ErrorTest3',
      isPublic: true,
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlater/v1', {
      channelId: channel.channelId,
      message: 'timeSent is in the past!',
      timeSent: timeSent - 10
    }, regId.token);

    expect(newMessageId.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(newMessageId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing messageSendlaterV1 returns error when user is not a channel member', () => {
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

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ErrorTest3',
      isPublic: true,
    }, firstId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlater/v1', {
      channelId: channel.channelId,
      message: 'Second user is not a member!',
      timeSent: timeSent + 1
    }, secondId.token);

    expect(newMessageId.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(newMessageId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing messageSendlaterV1 returns error when token is invalid', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ErrorTest3',
      isPublic: true,
    }, regId.token);

    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const newMessageId = postRequest(SERVER_URL + '/message/sendlater/v1', {
      channelId: channel.channelId,
      message: 'timeSent is in the past!',
      timeSent: timeSent + 1
    }, regId.token + 'NotAToken');

    expect(newMessageId.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(newMessageId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
