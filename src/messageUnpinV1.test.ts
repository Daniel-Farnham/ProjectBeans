import { FORBIDDEN, BAD_REQUEST } from './other';
import {
  clearV1, authRegisterV1, dmCreateV1, channelMessagesV1,
  channelsCreateV1, messageSendV1, messagePinV1, channelJoinV1, messageSendDmV1,
  dmMessagesV1, messageUnpinV1
} from './wrapperFunctions';

beforeEach(() => {
  clearV1();
});

describe('Testing message/unpin/v1 success handling', () => {
  test('correct return type after unpin', () => {
    const user1 = authRegisterV1('jackblack@gmail.com', 'password', 'Jack', 'Black');
    const user2 = authRegisterV1('jeffbrown@gmail.com', 'password', 'Jeff', 'Brown');

    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    const msg = messageSendDmV1(user2.token, dm.dmId, 'hello!');
    messagePinV1(user1.token, msg.messageId);
    const unpin = messageUnpinV1(user1.token, msg.messageId);
    expect(unpin).toMatchObject({});
  });

  test('dm/messages/v2 - unpinned message', () => {
    const user1 = authRegisterV1('jackblack@gmail.com', 'password', 'Jack', 'Black');
    const user2 = authRegisterV1('jeffbrown@gmail.com', 'password', 'Jeff', 'Brown');
    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    const msg = messageSendDmV1(user1.token, dm.dmId, 'hello!');
    messagePinV1(user1.token, msg.messageId);
    messageUnpinV1(user1.token, msg.messageId);

    const result = dmMessagesV1(user1.token, dm.dmId, 0);
    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          isPinned: false,
        })
      ])
    );
  });

  test('channel/messages/v3 - two pinned messages, one becomes unpinned', () => {
    const user1 = authRegisterV1('jackblack@gmail.com', 'password', 'Jack', 'Black');
    const user2 = authRegisterV1('jeffbrown@gmail.com', 'password', 'Jeff', 'Brown');

    const channel = channelsCreateV1(user1.token, 'Boost', true);
    channelJoinV1(user2.token, channel.channelId);
    const msg = messageSendV1(user1.token, channel.channelId, 'hello!');
    const msg2 = messageSendV1(user2.token, channel.channelId, 'Hey!');

    messagePinV1(user1.token, msg.messageId);
    messagePinV1(user1.token, msg2.messageId);

    messageUnpinV1(user1.token, msg.messageId);

    const result = channelMessagesV1(user1.token, channel.channelId, 0);
    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          isPinned: false,
        }),
        expect.objectContaining({
          isPinned: true,
        })
      ])
    );
  });
});

describe('Testing message/unpin/v1 error handling', () => {
  test('messageId is not a valid message within a channel or DM that the authorised user is part of', () => {
    const user1 = authRegisterV1('jackblack@gmail.com', 'password', 'Jack', 'Black');
    const user2 = authRegisterV1('jeffbrown@gmail.com', 'password', 'Jeff', 'Brown');
    const user3 = authRegisterV1('bobdoe@gmail.com', 'password', 'Bob', 'Doe');

    const channel = channelsCreateV1(user1.token, 'Boost', true);
    channelJoinV1(user2.token, channel.channelId);
    const msg = messageSendV1(user1.token, channel.channelId, 'hello!');
    messagePinV1(user3.token, msg.messageId);

    let result = messageUnpinV1(user3.token, msg.messageId);

    expect(result.statusCode).toBe(BAD_REQUEST);
    let bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });

    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    const dmMsg = messageSendDmV1(user1.token, dm.dmId, 'hello!');

    messagePinV1(user3.token, dmMsg.messageId);
    result = messageUnpinV1(user3.token, dmMsg.messageId);

    expect(result.statusCode).toBe(BAD_REQUEST);
    bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('channel: the message is not pinned', () => {
    const user1 = authRegisterV1('jackblack@gmail.com', 'password', 'Jack', 'Black');
    const user2 = authRegisterV1('jeffbrown@gmail.com', 'password', 'Jeff', 'Brown');

    const channel = channelsCreateV1(user1.token, 'Boost', true);
    channelJoinV1(user2.token, channel.channelId);

    const msg = messageSendV1(user2.token, channel.channelId, 'hello!');
    const result = messageUnpinV1(user1.token, msg.messageId);

    expect(result.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Authorised user does not have owner permissions', () => {
    const user1 = authRegisterV1('jackblack@gmail.com', 'password', 'Jack', 'Black');
    const user2 = authRegisterV1('jeffbrown@gmail.com', 'password', 'Jeff', 'Brown');

    const chan = channelsCreateV1(user1.token, 'channel1', true);
    channelJoinV1(user2.token, chan.channelId);
    const msg = messageSendV1(user2.token, chan.channelId, 'hello!');

    messagePinV1(user1.token, msg.messageId);
    const result = messageUnpinV1(user2.token, msg.messageId);

    expect(result.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('dm: the message is not pinned', () => {
    const user1 = authRegisterV1('jackblack@gmail.com', 'password', 'Jack', 'Black');
    const user2 = authRegisterV1('jeffbrown@gmail.com', 'password', 'Jeff', 'Brown');

    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    const msg = messageSendDmV1(user2.token, dm.dmId, 'hello!');

    const result = messageUnpinV1(user1.token, msg.messageId);

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
    },
    {
      desc: 'DM: messageId is not a valid message within a dm',
      statusCode: BAD_REQUEST,
      token: '',
      messageId: 1000,
    },

  ])('$desc', ({ statusCode, token, messageId }) => {
    const user1 = authRegisterV1('jackblack@gmail.com', 'password', 'Jack', 'Black');
    const user2 = authRegisterV1('jeffbrown@gmail.com', 'password', 'Jeff', 'Brown');

    const dm = dmCreateV1(user1.token, [user2.authUserId]);

    const msg = messageSendDmV1(user2.token, dm.dmId, 'hello!');

    const result = messagePinV1(user1.token + token, msg.messageId + messageId);

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
      PinId: 1
    },

  ])('$desc', ({ statusCode, token, messageId }) => {
    const user1 = authRegisterV1('jackblack@gmail.com', 'password', 'Jack', 'Black');
    const user2 = authRegisterV1('jeffbrown@gmail.com', 'password', 'Jeff', 'Brown');

    const channel = channelsCreateV1(user1.token, 'Boost', true);
    const msg = messageSendV1(user1.token, channel.channelId, 'hello!');

    const result = messagePinV1(user2.token + token, msg.messageId + messageId);

    expect(result.statusCode).toBe(statusCode);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
