import { postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
    deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing messageDeleteV1 success for channels', () => {
  test('Successfully remove message', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
      });
  
    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token,
      name: 'ChannelBoost',
      isPublic: true,
    });

    const message = postRequest(SERVER_URL + '/message/send/v1', {
      token: userId.token,
      channelId: channel.channelId,
      message: 'Hello this is a random test message'
    });

    const deletedMessage = deleteRequest(SERVER_URL + '/message/remove/v1', {
      token: userId.token, 
      messageId: message.messageId,
    });
    
    expect(deletedMessage).toStrictEqual({});
  });
});


describe('Testing messageDeleteV1 error handling for channels', () => {
  test('Testing invalid token', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });
  
    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token,
      name: 'ChannelBoost',
      isPublic: true,
    });

    const message = postRequest(SERVER_URL + '/message/send/v1', {
      token: userId.token,
      channelId: channel.channelId,
      message: 'Hello this is a random test message'
    });

    const deletedMessage = deleteRequest(SERVER_URL + '/message/remove/v1', {
      token: userId.token + 'Invalid Token',
      messageId: message.messageId,
    });
    
    expect(deletedMessage).toStrictEqual({ error: expect.any(String) });
  });
  test('MessageId is invalid', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token,
      name: 'ChannelBoost',
      isPublic: true,
    });

    const message = postRequest(SERVER_URL + '/message/send/v1', {
      token: userId.token,
      channelId: channel.channelId,
      message: 'Hello this is a random test message'
    });

    const deletedMessage = deleteRequest(SERVER_URL + '/message/remove/v1', {
      token: userId.token,
      messageId: message.messageId + 1,
    });
    
    expect(deletedMessage).toStrictEqual({ error: expect.any(String) });
  });

  test('Message not sent by authorised user, user does have global owner permission but is not a member of the channel', () => {
    // user1 = the userId with global owner permissions 
    const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    // user2 = the userId without owner permissions 
    const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'fake.mcfake@student.unsw.edu.au',
      password: 'AnEvenWorsePassword',
      nameFirst: 'Fake',
      nameLast: 'McFake',
    });

    // if user2 creates this channel, they have owner permissions. 
    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: user2.token,
      name: 'ChannelBoost',
      isPublic: true,
    });

    // a valid message is created by user 2 who is also the owner of the channel. 
    const message = postRequest(SERVER_URL + '/message/send/v1', {
      token: user2.token,
      channelId: channel.channelId,
      message: 'Hello this is a random test message'
    });

    // user 1 tries to edit the message. They neither have owner permissions of the channel and are not the authorised sender of the message dm. 
    const deletedMessage = deleteRequest(SERVER_URL + '/message/remove/v1', {
      token: user1.token,
      messageId: message.messageId,
    });
    
    expect(deletedMessage).toStrictEqual({ error: expect.any(String) });
  });  

    // needs to add user to global owner. 
  test('Message not sent by authorised user and the user does not have the global owner permission but they are a member of the channel', () => {
    // user1 = the userId with owner permissions 
    const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    // user2 = the userId without owner permissions 
    const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'fake.mcfake@student.unsw.edu.au',
      password: 'AnEvenWorsePassword',
      nameFirst: 'Fake',
      nameLast: 'McFake',
    });

    // if user1 creates this channel, they have owner permissions. user2 won't have owner status. 
    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: user1.token,
      name: 'ChannelBoost',
      isPublic: true,
    });

    // user2 is now becoming a member of the channel but won't be an owner. 
    postRequest(SERVER_URL + '/channel/join/v2', {
        token: user2.token,
        channelId: channel.channelId 
    }); 

    // a valid message is created by user 1 who is also the owner of the channel. 
    const message = postRequest(SERVER_URL + '/message/send/v1', {
      token: user1.token,
      channelId: channel.channelId,
      message: 'Hello this is a random test message'
    });
    // user 2 tries to edit the message. They neither have owner permissions of the channel and are not the authorised sender of the message dm. 
    const deletedMessage = deleteRequest(SERVER_URL + '/message/remove/v1', {
      token: user2.token,
      messageId: message.messageId,
    });
    
    expect(deletedMessage).toStrictEqual({ error: expect.any(String) });
  });  

});


describe('Testing messageDeleteV1 success for dms', () => {
  test('Successfully remove message', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
      });
  
    const dm = postRequest(SERVER_URL + '/dm/create/v1', {
      token: userId.token,
      uIds: [], 
    });

    const message = postRequest(SERVER_URL + '/message/senddm/v1', {
      token: userId.token,
      dmId: dm.dmId,
      message: 'Hello this is a random test message'
    });

    const deletedMessage = deleteRequest(SERVER_URL + '/message/remove/v1', {
      token: userId.token, 
      messageId: message.messageId,
    });

    expect(deletedMessage).toStrictEqual({});
  });
});

describe('Testing messageDeleteV1 error handling for dms', () => {
  test('Testing invalid token', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });
    const dm = postRequest(SERVER_URL + '/dm/create/v1', {
      token: userId.token,
      uIds: [], 
    });

    const message = postRequest(SERVER_URL + '/message/senddm/v1', {
      token: userId.token,
      dmId: dm.dmId,
      message: 'Hello this is a random test message'
    });

    const deletedMessage = deleteRequest(SERVER_URL + '/message/remove/v1', {
      token: userId.token + 'Invalid Token', 
      messageId: message.messageId,
    });

    expect(deletedMessage).toStrictEqual({ error: expect.any(String) })
  });

  test('Testing messageId is invalid', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });
    const dm = postRequest(SERVER_URL + '/dm/create/v1', {
      token: userId.token,
      uIds: [], 
    });

    const message = postRequest(SERVER_URL + '/message/senddm/v1', {
      token: userId.token,
      dmId: dm.dmId,
      message: 'Hello this is a random test message'
    });

    const deletedMessage = deleteRequest(SERVER_URL + '/message/remove/v1', {
      token: userId.token, 
      messageId: message.messageId + 1,
    });

    expect(deletedMessage).toStrictEqual({ error: expect.any(String) })
  });


});

test('Message not sent by authorised user and the user does not have global owner permissions', () => {
  // user1 = the userId with global owner permissions 
  const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
    email: 'daniel.farnham@student.unsw.edu.au',
    password: 'AVeryPoorPassword',
    nameFirst: 'Daniel',
    nameLast: 'Farnham',
  });

  // user2 = the userId without owner permissions 
  const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
    email: 'fake.mcfake@student.unsw.edu.au',
    password: 'AnEvenWorsePassword',
    nameFirst: 'Fake',
    nameLast: 'McFake',
  });

  // if user1 creates this dm, they have dm owner permissions && are global owners. 
  const dm = postRequest(SERVER_URL + '/dm/create/v1', {
    token: user1.token,
    uIds: [], 
  });

  // a valid message is created by user 1 who is also the creator of the dm. 
  const message = postRequest(SERVER_URL + '/message/senddm/v1', {
    token: user1.token,
    dmId: dm.dmId,
    message: 'Hello this is a random test message'
  });

  // user 2 tries to delete. They are neither global owners or are the authorised sender of the message dm. 
  const deletedMessage = deleteRequest(SERVER_URL + '/message/remove/v1', {
    token: user2.token,
    messageId: message.messageId,
  });
 
  expect(deletedMessage).toMatchObject({ error: expect.any(String) });
});  


