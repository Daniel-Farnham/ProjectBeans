import { messageSendDmV1 } from './dm';
import { FORBIDDEN } from './other';
import { clearV1, authRegisterV1, notificationsGetV1, dmCreateV1, 
  channelsCreateV1, messageSendV1, messageReactV1, channelJoinV1,
  channelInviteV1, dmLeaveV1, channelLeaveV1, messageEditV1 } from './wrapperFunctions';

beforeEach(() => {
  clearV1();
});

describe('Testing notificationsGetV1 success handling', () => {
  
  test('empty notifications returned', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const result = notificationsGetV1(user1.token);
    expect(result).toMatchObject({notifications: []});
  });

  test('no notification when tagging self', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const channel = channelsCreateV1(user1.token, 'Boost', true);
    messageSendV1(user1.token, channel.channelId, "hey @hangpham! how are you?");
    const result = notificationsGetV1(user1.token);
    expect(result).toMatchObject({notifications: []});
  });

  describe('Tagging notifications', () => {
    test('tagged into a channel', () => {
      const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
      const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');
      const channel = channelsCreateV1(user1.token, 'Boost', true);
      
      messageSendV1(user2.token, channel.channelId, "hey @hangpham! how are you?");
      const result = notificationsGetV1(user1.token);
      expect(result).toMatchObject( {
        notifications: [ 
          {
            channelId: channel.channelId,
            dmId: -1,
            notificationMessage: "janedoe tagged you in Boost: hey @hangpham! how a",
          }
        ],
      });
    });
    
    test('channel message edit double tagging multiple notifications', () => {
      const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
      const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');
      const channel = channelsCreateV1(user1.token, 'Boost', true);
      
      const channelMsg = messageSendV1(user2.token, channel.channelId, "hey @hangpham! how are you?");
      messageEditV1(user2.token, channelMsg.messageId, "hey @hangpham, attention needed @hangpham!");

      const result = notificationsGetV1(user1.token);
      expect(result).toMatchObject( {
        notifications: [ 
          {
            channelId: channel.channelId,
            dmId: -1,
            notificationMessage: "janedoe tagged you in Boost: hey @hangpham, atten",
          },
          {
            channelId: channel.channelId,
            dmId: -1,
            notificationMessage: "janedoe tagged you in Boost: hey @hangpham! how a",
          }
        ],
      });
    });
    
    test('tagged into a dm', () => {
      const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
      const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');
      const dm = dmCreateV1(user1.token, [user2.authUserId]);
      messageSendDmV1(user2.token, dm.dmId, "hey @hangpham! had to follow up on something");
      const result = notificationsGetV1(user1.token);
      expect(result).toMatchObject( {
        notifications: [ 
          {
            channelId: -1,
            dmId: dm.dmId,
            notificationMessage: "janedoe tagged you in hangpham, janedoe: hey @hangpham! had t",
          }
        ],
      });
    });

    test('dm edit double tagging multiple notifications', () => {
      const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
      const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');
      const dm = dmCreateV1(user1.token, [user2.authUserId]);
      const dmMsg:any = messageSendDmV1(user2.token, dm.dmId, "hey @hangpham! had to follow up on something");
      messageEditV1(user2.token, dmMsg.messageId, "hey @hangpham, attention needed @hangpham!");
      const result = notificationsGetV1(user1.token);
      expect(result).toMatchObject( {
        notifications: [ 
          {
            channelId: -1,
            dmId: dm.dmId,
            notificationMessage: "janedoe tagged you in hangpham, janedoe: hey @hangpham, atten",
          },
          {
            channelId: -1,
            dmId: dm.dmId,
            notificationMessage: "janedoe tagged you in hangpham, janedoe: hey @hangpham! had t",
          }
        ],
      });
    });
  });
  
  describe('Reacting notifications', () => {
    test('reacted to channel message', () => {
      const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
      const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');
      const channel = channelsCreateV1(user1.token, 'Boost', true);
      channelJoinV1(user2.token, channel.channelId);
      const channelMsg = messageSendV1(user2.token, channel.channelId, "hey @hangpham! how are you?");
      messageReactV1(user1.token, channelMsg.messageId, 1);
      const result = notificationsGetV1(user2.token);
      
      expect(result).toMatchObject( {
        notifications: [ 
          {
            channelId: channel.channelId,
            dmId: -1,
            notificationMessage: "hangpham reacted to your message in Boost",
          }
        ],
      });
      
    });
    test('reacted to dm message', () => {
      const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
      const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');
      const dm = dmCreateV1(user1.token, [user2.authUserId]);
      const dmMsg:any = messageSendDmV1(user2.token, dm.dmId, "hey @hangpham! had to follow up on something");
      messageReactV1(user1.token, dmMsg.messageId, 1);
      const result = notificationsGetV1(user1.token);
      expect(result).toMatchObject( {
        notifications: [ 
          {
            channelId: -1,
            dmId: dm.dmId,
            notificationMessage: "janedoe tagged you in hangpham, janedoe: hey @hangpham! had t",
          },
          {
            channelId: -1,
            dmId: dm.dmId,
            notificationMessage: `hangpham added you to hangpham, janedoe`
          }
        ],
      });
    });

    describe('No longer receive notifications after leaving dm/channel', () => {
      test('no notification when message reacted to user who is no longer part of channel', () =>  {
        const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
        const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');
        const channel = channelsCreateV1(user1.token, 'Boost', true);
        channelJoinV1(user2.token, channel.channelId);
        const channelMsg = messageSendV1(user2.token, channel.channelId, "hey @hangpham! how are you?");
        channelLeaveV1(user2.token, channel.channelId);
        messageReactV1(user1.token, channelMsg.messageId, 1);
        const result = notificationsGetV1(user2.token);
        expect(result).toMatchObject({
          notifications: []
        });
      });
      test('no notification when message reacted to user who is no longer part of dm', () =>  {
        const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
        const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');
        const dm = dmCreateV1(user1.token, [user2.authUserId]);
        const dmMsg:any  = messageSendDmV1(user2.token, dm.dmId, "hey there");
        dmLeaveV1(user2.token, dm.dmId);
        messageReactV1(user1.token, dmMsg.messageId, 1);
        const result = notificationsGetV1(user2.token);
        expect(result).toMatchObject({
          notifications: [
            {
              channelId: -1,
              dmId: dm.dmId,
              notificationMessage: `hangpham added you to hangpham, janedoe`
            }
          ]
        });
      });
    });
  });

  describe('Adding to channel/dm', () => {
    test('add user to channel', () => {
      const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
      const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');
      const channel = channelsCreateV1(user1.token, 'Boost', true);
      channelInviteV1(user1.token, channel.channelId, user2.authUserId);
      const result = notificationsGetV1(user2.token);
      expect(result).toMatchObject( {
        notifications: [ 
          {
            channelId: channel.channelId,
            dmId: -1,
            notificationMessage: `hangpham added you to Boost`}
        ],
      });
    });
  });
  test('receive 20 notifications back', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');
    const channel = channelsCreateV1(user1.token, 'Boost', true);
    channelJoinV1(user2.token, channel.channelId);

    for (let i = 0; i <= 25; i++) {
      const channelMsg = messageSendV1(user1.token, channel.channelId, `msg`);    
      messageReactV1(user2.token, channelMsg.messageId, 1);
    }
    const result = notificationsGetV1(user1.token);

      for (let i = 0; i <= 20; i++) {
        const expectedNotification = {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: `janedoe reacted to your message in Boost`
        };
        expect(result.notifications).toEqual(
          expect.arrayContaining([
            expect.objectContaining(expectedNotification)
          ])
        );
      }
  });

});

describe('Testing notificationsGetV1 error handling', () => {
  test('invalid token', () => {
    const result = notificationsGetV1('InvalidTokenSike!');
    expect(result.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});