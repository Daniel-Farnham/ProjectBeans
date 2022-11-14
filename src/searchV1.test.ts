import { FORBIDDEN, BAD_REQUEST } from './other';
import {
  clearV1, authRegisterV1, channelsCreateV1, messageSendV1, messageReactV1, channelJoinV1,
  channelInviteV1, dmLeaveV1, channelLeaveV1, messageEditV1, messageSendDmV1, searchV1, dmCreateV1
} from './wrapperFunctions';

beforeEach(() => {
  clearV1();
});

describe('Testing searchV1 success handling', () => {
  test('empty messages returned', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const result = searchV1(user1.token, 'anything');
    expect(result).toMatchObject({ messages: [] });
  });
  test('return a single message from channel', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const channel = channelsCreateV1(user1.token, 'Boost', true);
    const msg = messageSendV1(user1.token, channel.channelId, "This is something!");
    const expectedTimeSent = Math.floor((new Date()).getTime() / 1000);
    const result = searchV1(user1.token, 'something');
    expect(result).toMatchObject({ messages: [{
      messageId: msg.messageId, 
      uId:  user1.authUserId, 
      message: "This is something!", 
      timeSent: expect(result.messages[0].timeSent).toBeLessThanOrEqual(expectedTimeSent + 3),
      reacts: {}, 
      isPinned: false, 
    }]});
  });
  test('return a single message from dm', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const dm = dmCreateV1(user1.token, []);
    const msg = messageSendDmV1(user1.token, dm.dmId, "This is something!");
    const expectedTimeSent = Math.floor((new Date()).getTime() / 1000);
    const result = searchV1(user1.token, 'something');
    expect(result).toMatchObject({ messages: [{
      messageId: msg.messageId, 
      uId:  user1.authUserId, 
      message: "This is something!", 
      timeSent: expect(result.messages[0].timeSent).toBeLessThanOrEqual(expectedTimeSent + 3),
      reacts: {}, 
      isPinned: false, 
    }]});
  });
  test('return a two messages from channel and dm', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const channel = channelsCreateV1(user1.token, 'Boost', true);
    channelJoinV1(user2.token, channel.channelId);
    const dm = dmCreateV1(user1.token, [user2.token]);

    let messages = [];
    let messagesTimeSent = [];
    // Sending messages to dm and channel
    for (let i = 0; i <= 15; i++) {
      if (i % 2 == 0 ) {
        messages[i] =  messageSendDmV1(user2.token, dm.dmId, "This is something!");
      } else {
        messages[i] =  messageSendV1(user1.token, dm.dmId, "This is something!");  
      }
      messagesTimeSent[i] =  Math.floor((new Date()).getTime() / 1000);
    }

    let result = searchV1(user1.token, 'SomEThin');
    // Loop through array and check for dms and channels
    for (let i = 0; i <= 15; i++) {
      let userId;
      if (i % 2 == 0) {
        userId = user2.authUserId;
      } else {
        userId = user1.authUserId;
      }
      const expectedMsg = {
        messageId: messages[i].messageId, 
        uId:  userId, 
        message: "This is something!", 
        timeSent: expect(result.messages[0].timeSent).toBeLessThanOrEqual(messagesTimeSent[i] + 3),
        reacts: {}, 
        isPinned: false, 
      };

      expect(result.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining(expectedMsg)
        ])
      );
    }
  });
  
  test('multiple messages from multiple channels and multiple dms', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('jdoe@gmail.com', 'password', 'Jane', 'Doe');
    const user3 = authRegisterV1('hpotter@gmail.com', 'password', 'Harry', 'Potter');
    const dm = dmCreateV1(user1.token, [user2.token]);
    const channel = channelsCreateV1(user1.token, 'Boost', false);
    channelInviteV1(user1.token, channel.channelId, user3.authUserId);
    
    let messages = [];
    let messagesTimeSent = [];
    // Sending messages to dm
    for (let i = 0; i <= 15; i++) {
      messages[i] =  messageSendDmV1(user2.token, dm.dmId, "This is something!");
      messagesTimeSent[i] =  Math.floor((new Date()).getTime() / 1000);
    }
    
    let result = searchV1(user1.token, 'SomEThin');
    // Loop through array and check for dms
    for (let i = 0; i <= 15; i++) {
      const expectedMsg = {
        messageId: messages[i].messageId, 
        uId:  user2.authUserId, 
        message: "This is something!", 
        timeSent: expect(result.messages[0].timeSent).toBeLessThanOrEqual(messagesTimeSent[i] + 3),
        reacts: {}, 
        isPinned: false, 
      };

      expect(result.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining(expectedMsg)
        ])
      );
    }

    for (let i = 16; i <= 20; i++) {
      messageSendV1(user3.token, channel.channelId, 'Anything goes Mate!')
    }
    // Sending messages to channel
    messages = [];
    messagesTimeSent = [];
    for (let i = 20; i <= 25; i++) {
      messages[i] = messageSendV1(user1.token, channel.channelId, 'Anyth\thing goes');
      messagesTimeSent[i] =  Math.floor((new Date()).getTime() / 1000);
    }
    // Checking messages in channels
    result = searchV1(user1.token, 'anYth\thing');
    for (let i = 20; i <= 25; i++) {
      const expectedMsg = {
        messageId: messages[i].messageId, 
        uId:  user1.authUserId, 
        message: 'Anyth\thing goes', 
        timeSent: expect(result.messages[0].timeSent).toBeLessThanOrEqual(messagesTimeSent[i] + 3),
        reacts: {}, 
        isPinned: false, 
      };
      expect(result.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining(expectedMsg)
        ])
      );
    }
  });
  
  test('case insensitivity when searching', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const dm = dmCreateV1(user1.token, []);
    const msg = messageSendDmV1(user1.token, dm.dmId, "This is something!");
    const expectedTimeSent = Math.floor((new Date()).getTime() / 1000);
    const result = searchV1(user1.token, 'SomEThinG!');
    expect(result).toMatchObject({ messages: [{
      messageId: msg.messageId, 
      uId:  user1.authUserId, 
      message: "This is something!", 
      timeSent: expect(result.messages[0].timeSent).toBeLessThanOrEqual(expectedTimeSent + 3),
      reacts: {}, 
      isPinned: false, 
    }]});
  });
  
});

describe('Testing searchV1 error handling', () => {
  const over1000Chars = "a".repeat(1005);
  test.each([
    {
      desc: 'token is invalid',
      token: 'InvalidToken',
      queryStr: 'Doe',
      statusCode: FORBIDDEN
    },
    {
      desc: 'queryStr less than 1 characters',
      token: '',
      queryStr: '',
      statusCode: BAD_REQUEST,
    },
    {
      desc: 'queryStr longer than 1000 characters',
      token: '',
      queryStr: over1000Chars,
      statusCode: BAD_REQUEST,
    },

  ])('$desc', ({ token, queryStr, statusCode }) => {

    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const result = searchV1(user1.token + token, queryStr);
    expect(result.statusCode).toBe(statusCode);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
