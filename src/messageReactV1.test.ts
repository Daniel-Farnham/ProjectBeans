import { FORBIDDEN, BAD_REQUEST } from './other';
import {
  clearV1, authRegisterV1, notificationsGetV1, dmCreateV1, channelMessagesV1,
  channelsCreateV1, messageSendV1, messageReactV1, channelJoinV1, messageSendDmV1,
  dmMessagesV1
} from './wrapperFunctions';

beforeEach(() => {
  clearV1();
});

describe('Testing message/react/v1 success handling', () => {
  test('correct return type after reacting', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');

    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    const msg = messageSendDmV1(user1.token, dm.dmId, 'hello!');
    const result = messageReactV1(user2.token, msg.messageId, 1);
    expect(result).toMatchObject({});
  });

  test('react notification displayed for channel', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');

    const channel = channelsCreateV1(user1.token, 'Boost', true);
    channelJoinV1(user2.token, channel.channelId);
    const msg = messageSendV1(user1.token, channel.channelId, 'hello!');
    messageReactV1(user2.token, msg.messageId, 1);
    const result = notificationsGetV1(user1.token);
    expect(result).toMatchObject({
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: 'janedoe reacted to your message in Boost',
        }
      ]
    });
  });

  test('react notification displayed for dm', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');

    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    const msg = messageSendDmV1(user1.token, dm.dmId, 'hello!');
    messageReactV1(user2.token, msg.messageId, 1);
    const result = notificationsGetV1(user1.token);
    expect(result).toMatchObject({
      notifications: [
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'janedoe reacted to your message in hangpham, janedoe',
        }
      ]
    });
  });
  test('reacts display correctly', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');

    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    const msg = messageSendDmV1(user1.token, dm.dmId, 'hello!');
    messageReactV1(user2.token, msg.messageId, 1);
    const result = notificationsGetV1(user1.token);
    expect(result).toMatchObject({
      notifications: [
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'janedoe reacted to your message in hangpham, janedoe',
        }
      ]
    });
  });

  test('dm/messages/v2 - display active user voted and user who has not voted', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');

    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    const msg = messageSendDmV1(user1.token, dm.dmId, 'hello!');
    messageReactV1(user2.token, msg.messageId, 1);

    let result = dmMessagesV1(user2.token, dm.dmId, 0);
    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reacts: expect.arrayContaining([
            expect.objectContaining({
              isThisUserReacted: true
            })
          ])
        })
      ])
    );
    result = dmMessagesV1(user1.token, dm.dmId, 0);
    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reacts: expect.arrayContaining([
            expect.objectContaining({
              isThisUserReacted: false
            })
          ])
        })
      ])
    );
  });
  test('channel/messages/v3 - display active user voted and user who has not voted', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');

    const channel = channelsCreateV1(user1.token, 'Boost', true);
    channelJoinV1(user2.token, channel.channelId);
    const msg = messageSendV1(user1.token, channel.channelId, 'hello!');
    messageReactV1(user2.token, msg.messageId, 1);

    let result = channelMessagesV1(user2.token, channel.channelId, 0);

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reacts: expect.arrayContaining([
            expect.objectContaining({
              isThisUserReacted: true
            })
          ])
        })
      ])
    );
    result = channelMessagesV1(user1.token, channel.channelId, 0);
    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reacts: expect.arrayContaining([
            expect.objectContaining({
              isThisUserReacted: false
            })
          ])
        })
      ])
    );
  });
});

describe('Testing message/react/v1 error handling', () => {
  test('messageId is not a valid message within a channel or DM that the authorised user is part of', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');
    const user3 = authRegisterV1('bobdoe@gmail.com', 'password', 'Bob', 'Doe');

    const channel = channelsCreateV1(user1.token, 'Boost', true);
    channelJoinV1(user2.token, channel.channelId);
    const msg = messageSendV1(user1.token, channel.channelId, 'hello!');
    let result = messageReactV1(user3.token, msg.messageId, 1);
    expect(result.statusCode).toBe(BAD_REQUEST);
    let bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });

    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    const dmMsg = messageSendDmV1(user1.token, dm.dmId, 'hello!');

    result = messageReactV1(user3.token, dmMsg.messageId, 1);
    expect(result.statusCode).toBe(BAD_REQUEST);
    bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('channel: the message already contains a react with ID reactId from the authorised user', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');

    const channel = channelsCreateV1(user1.token, 'Boost', true);
    channelJoinV1(user2.token, channel.channelId);

    const msg = messageSendV1(user1.token, channel.channelId, 'hello!');
    messageReactV1(user2.token, msg.messageId, 1);
    const result = messageReactV1(user2.token, msg.messageId, 1);

    expect(result.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('dm: the message already contains a react with ID reactId from the authorised user', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');

    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    const msg = messageSendDmV1(user1.token, dm.dmId, 'hello!');

    messageReactV1(user2.token, msg.messageId, 1);
    const result = messageReactV1(user2.token, msg.messageId, 1);
    expect(result.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test.each([
    {
      desc: 'Token is invalid',
      statusCode: FORBIDDEN,
      token: 'InvalidToken',
      messageId: 0,
      reactId: 1
    },
    {
      desc: 'DM: messageId is not a valid message within a dm',
      statusCode: BAD_REQUEST,
      token: '',
      messageId: 1000,
      reactId: 1
    },
    {
      desc: 'DM: reactId is invalid',
      statusCode: BAD_REQUEST,
      token: '',
      messageId: 0,
      reactId: 1000
    },

  ])('$desc', ({ statusCode, token, messageId, reactId }) => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');

    const dm = dmCreateV1(user1.token, [user2.authUserId]);

    const msg = messageSendDmV1(user1.token, dm.dmId, 'hello!');

    const result = messageReactV1(user2.token + token, msg.messageId + messageId, reactId);

    expect(result.statusCode).toBe(statusCode);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test.each([
    {
      desc: 'Channel: messageId is not a valid message within a Channel',
      statusCode: BAD_REQUEST,
      token: '',
      messageId: 1000,
      reactId: 1
    },
    {
      desc: 'Channel: reactId is invalid',
      statusCode: BAD_REQUEST,
      token: '',
      messageId: 0,
      reactId: 1000
    },

  ])('$desc', ({ statusCode, token, messageId, reactId }) => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');

    const channel = channelsCreateV1(user1.token, 'Boost', true);
    const msg = messageSendV1(user1.token, channel.channelId, 'hello!');

    const result = messageReactV1(user2.token + token, msg.messageId + messageId, reactId);

    expect(result.statusCode).toBe(statusCode);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
