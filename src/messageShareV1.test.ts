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
      dmId: -1,
      statusCode: BAD_REQUEST,
    },
    {
      desc: 'message length is more than 1000 characters',
      token: '',
      ogMessageId: 0,
      message: largerThan1000Characters,
      channelId: -1,
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
});
