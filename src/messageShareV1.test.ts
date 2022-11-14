import { FORBIDDEN, BAD_REQUEST } from './other';
import {
  clearV1, authRegisterV1, notificationsGetV1, dmCreateV1, channelMessagesV1,
  channelsCreateV1, messageSendV1, messageReactV1, channelJoinV1, messageSendDmV1,
  dmMessagesV1, messageShareV1
} from './wrapperFunctions';

beforeEach(() => {
  clearV1();
});

describe('Testing message/share/v1 success handling', () => {
  test('correct return type after reacting', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');

    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    const msg = messageSendDmV1(user1.token, dm.dmId, 'original message!');
    const result = messageShareV1(user1.token, msg.messageId, 'sharing this message', -1, dm.dmId );
    expect(result).toMatchObject({sharedMessageId : expect.any(Number)});
  });
});

describe('Testing message/share/v1 error handling', () => {

  const largerThan1000Characters = 'a'.repeat(1005);
  test.each([
    {
      desc: 'token invalid',
      token: 'InvalidTokeN!',
      ogMessageId: 0,
      message: 'Shared message',
      channelId: 0,
      dmId: -1,
      statusCode: FORBIDDEN,
    },
    {
      desc: 'channelId invalid',
      token: '',
      ogMessageId: 0,
      message: 'Shared message',
      channelId: 1000,
      dmId: -1,
      statusCode: BAD_REQUEST,
    },
    {
      desc: 'ogMessageId doesn\'t exist',
      token: '',
      ogMessageId: 1000,
      message: 'Shared message',
      channelId: 0,
      dmId: -1,
      statusCode: BAD_REQUEST,
    },
    {
      desc: 'message length is more than 1000 characters',
      token: '',
      ogMessageId: 0,
      message: largerThan1000Characters,
      channelId: 0,
      dmId: -1,
      statusCode: BAD_REQUEST,
    },
  ])('$desc', ({ token, ogMessageId, message, channelId, dmId, statusCode }) => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');

    const channel = channelsCreateV1(user1.token, 'Boost', true);
    channelJoinV1(user2.token, channel.channelId);
    const msg = messageSendV1(user1.token, channel.channelId, 'og message');
    
    const result = messageShareV1(user2.token + token, msg.messageId + ogMessageId, message, channel.channelId + channelId, dmId);

    expect(result.statusCode).toBe(statusCode);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test.each([
    {
      desc: 'dmId invalid',
      token: '',
      ogMessageId: 0,
      message: 'Shared message',
      channelId: -1,
      dmId: 1000,
      statusCode: BAD_REQUEST,
    },
  ])('$desc', ({ token, ogMessageId, message, channelId, dmId, statusCode }) => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');

    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    const msg = messageSendDmV1(user1.token, dm.dmId, 'og message');
    
    const result = messageShareV1(user2.token + token, msg.messageId + ogMessageId, message, channelId, dmId + dm.dmId);

    expect(result.statusCode).toBe(statusCode);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('both channel and dm are valid', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');

    const channel = channelsCreateV1(user1.token, 'Boost', true);
    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    const dmMsg = messageSendDmV1(user1.token, dm.dmId, 'dm message!');
    messageSendV1(user1.token, channel.channelId, 'channel message');

    const result = messageShareV1(user1.token, dmMsg.messageId, 'sharing this message', channel.channelId, dm.dmId );
    expect(result.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('user attempting to share message from a channel/dm they are not a part of', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');
    const user3 = authRegisterV1('bdoe@gmail.com', 'password', 'Bob', 'Doe');

    const channel = channelsCreateV1(user1.token, 'Boost', true);
    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    const dmMsg = messageSendDmV1(user1.token, dm.dmId, 'dm message!');
    messageSendV1(user1.token, channel.channelId, 'channel message');

    let result = messageShareV1(user3.token, dmMsg.messageId, 'sharing this message', -1, dm.dmId);
    expect(result.statusCode).toBe(BAD_REQUEST);
    let bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
    
    result = messageShareV1(user3.token, dmMsg.messageId, 'sharing this message', channel.channelId, -1);
    expect(result.statusCode).toBe(BAD_REQUEST);
    bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('ogMessageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');
    const user3 = authRegisterV1('bdoe@gmail.com', 'password', 'Bob', 'Doe');

    const channel = channelsCreateV1(user1.token, 'Boost', true);
    const channel2 = channelsCreateV1(user3.token, 'Boost', true);
    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    channelJoinV1(user3.token, channel.channelId);
    const dmMsg = messageSendDmV1(user1.token, dm.dmId, 'dm message!');
    const channelMsg = messageSendV1(user1.token, channel.channelId, 'channel message');

    let result = messageShareV1(user3.token, dmMsg.messageId, 'sharing this message', channel.channelId, -1);
    expect(result.statusCode).toBe(BAD_REQUEST);
    let bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });

    result = messageShareV1(user3.token, channelMsg.messageId, 'sharing this message', channel2.channelId , -1);
    expect(result.statusCode).toBe(BAD_REQUEST);
    bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });


  test('test sharing a message to a channel that user is not a part of', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');

    const channel = channelsCreateV1(user1.token, 'Boost', true);
    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    const dmMsg = messageSendDmV1(user1.token, dm.dmId, 'dm message!');

    const result = messageShareV1(user2.token, dmMsg.messageId, 'sharing this message', channel.channelId, -1);
    expect(result.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('test sharing a message to a dm that user is not a part of', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');

    const channel = channelsCreateV1(user1.token, 'Boost', true);
    channelJoinV1(user2.token, channel.channelId);
    const dm = dmCreateV1(user1.token, []);
    const channelMsg = messageSendV1(user1.token, channel.channelId, 'channel message');

    const result = messageShareV1(user2.token, channelMsg.messageId, 'sharing this message', -1, dm.dmId);
    expect(result.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

});
