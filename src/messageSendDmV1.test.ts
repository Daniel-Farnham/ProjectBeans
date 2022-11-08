import { postRequest, deleteRequest, getRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing messageSendDmV1 success case handling', () => {
  test('Testing successful return type for sending DM', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });

    const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const dm = postRequest(SERVER_URL + '/dm/create/v1', {
      uIds: [user2.authUserId],
    }, user1.token);

    const sendDm = postRequest(SERVER_URL + '/message/senddm/v1', {
      dmId: dm.dmId,
      message: 'This is my first message',
    }, user1.token);

    expect(sendDm).toMatchObject({ messageId: expect.any(Number) });
  });

  test('Testing successful viewing of DM after one message sent - NOT checking timestamp', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });

    const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const dm = postRequest(SERVER_URL + '/dm/create/v1', {
      uIds: [user2.authUserId],
    }, user1.token);

    postRequest(SERVER_URL + '/message/senddm/v1', {
      dmId: dm.dmId,
      message: 'This is my first message'
    }, user2.token);

    const messagesResult = getRequest(SERVER_URL + '/dm/messages/v1', {
      dmId: dm.dmId,
      start: 0
    }, user1.token);
    const expectedMessages = {
      messages: [
        {
          message: 'This is my first message',
          messageId: 1,
          timeSent: messagesResult.messages[0].timeSent,
          uId: 1,
        }
      ],
      start: 0,
      end: -1,
    };
    expect(messagesResult).toMatchObject(expectedMessages);
  });
  test('Testing successful viewing of DM after one message sent - checking timestamp', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });

    const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const dm = postRequest(SERVER_URL + '/dm/create/v1', {
      uIds: [user2.authUserId],
    }, user1.token);

    postRequest(SERVER_URL + '/message/senddm/v1', {
      dmId: dm.dmId,
      message: 'This is my first message'
    }, user2.token);
    const expectedTimeSent = Math.floor((new Date()).getTime() / 1000);

    const messagesResult = getRequest(SERVER_URL + '/dm/messages/v1', {
      dmId: dm.dmId,
      start: 0
    }, user1.token);
    expect(messagesResult.messages[0].timeSent).toBeLessThanOrEqual(expectedTimeSent + 3);
  });
});

describe('Testing messageSendDmV1 error handling', () => {
  const messageGreaterThan1000Char = 'a'.repeat(1001);
  const messageLessThan1Char = '';
  test.each([
    { token: 'InvalidToken', dmId: 0, message: 'This is a message', desc: 'token is invalid' },
    { token: '', dmId: 100, message: 'This is a message', desc: 'dmId does not refer to a valid DM' },
    { token: '', dmId: 0, message: messageLessThan1Char, desc: 'Length of message < 1 character' },
    { token: '', dmId: 0, message: messageGreaterThan1000Char, desc: 'Length of message > 1000 characters' },
  ])('$desc', ({ token, dmId, message }) => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });
    const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const dm = postRequest(SERVER_URL + '/dm/create/v1', {
      uIds: [user2.authUserId],
    }, user1.token);

    const sendDmResult = postRequest(SERVER_URL + '/message/senddm/v1', {
      dmId: dm.dmId + dmId,
      message: message,
    }, user1.token + token);

    expect(sendDmResult).toStrictEqual(
      {
        error: expect.any(String),
      }
    );
  });

  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });
    const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const user3 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const dm = postRequest(SERVER_URL + '/dm/create/v1', {
      uIds: [user2.authUserId],
    }, user1.token);

    const sendDmResult = postRequest(SERVER_URL + '/message/senddm/v1', {
      dmId: dm.dmId,
      message: 'JUST A MESSAGE',
    }, user3.token);

    expect(sendDmResult).toStrictEqual(
      {
        error: expect.any(String),
      }
    );
  });
});
