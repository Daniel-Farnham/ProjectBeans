import { postRequest, deleteRequest, getRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// Before each test, clear dataStore
beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

// Working cases

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
      token: user1.token,
      uIds: [user2.uId],
    });
    
    const sendDm = postRequest(SERVER_URL + '/message/senddm/v1', {
      token: user1.token,
      dmId: dm.dmId,
      message: 'This is my first message',
    });
    
    expect(sendDm).toMatchObject({messageId: expect.any(Number) });
  });

  test('Testing successful viewing of DM after one message sent', () => {
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
      token: user1.token,
      uIds: [user2.uId],
    });
    
    postRequest(SERVER_URL + '/message/senddm/v1', {
      token: user2.token,
      dmId: dm.dmId,
      message: 'This is my first message'
    });
    
    const sendDm = getRequest(SERVER_URL + '/dm/messages/v1', {
      token: user1.token,
      dmId: dm.dmId,
      message: 'This is my first message'
    });
    
    expect(sendDm).toMatchObject({messageId: expect.any(Number) });
  });

});

describe('Testing messageSendDmV1 error handling', () => {
  const messageGreaterThan1000Char = 'a'.repeat(1001);
  const messageLessThan1Char = '';
  test.each([
    { token: 'InvalidToken', dmId: 0, message: 'This is a message',desc: 'token is invalid' },
    { token: '', dmId: 100, message: 'This is a message',desc: 'dmId does not refer to a valid DM' },
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
      token: user1.token,
      uIds: [user2.uId],
    });
    
    const sendDmResult = postRequest(SERVER_URL + '/message/senddm/v1', {
      token: user1.token + token,
      dmId: dm.dmId + dmId,
      message: message,
    });


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
      token: user1.token,
      uIds: [user2.uId],
    });
    
    const sendDmResult = postRequest(SERVER_URL + '/message/senddm/v1', {
      token: user3.token,
      dmId: dm.dmId,
      message: 'JUST A MESSAGE',
    });
  
  
    expect(sendDmResult).toStrictEqual(
      {
        error: expect.any(String),
      }
    );
    
  });
});
