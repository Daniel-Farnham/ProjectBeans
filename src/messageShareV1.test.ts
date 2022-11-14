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
    expect(result).toMatchObject({shareMessageId: expect.any(Number)});
  });
});
