import { putRequest, postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
import {
  authRegisterV1, dmCreateV1, channelsCreateV1, messageSendV1,
  messageSendDmV1, messageShareV1
} from './wrapperFunctions';
const SERVER_URL = `${url}:${port}`;
const FORBIDDEN = 403;
const BAD_REQUEST = 400;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing messageEditV1 success for channels', () => {
  test('Successfully edit message', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    const message = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId,
      message: 'Hello this is a random test message'
    }, userId.token);

    const editedMessage = putRequest(SERVER_URL + '/message/edit/v2', {
      messageId: message.messageId,
      message: 'This is an edited message'
    }, userId.token);

    expect(editedMessage).toStrictEqual({});
  });

  test('Successfully edit share message in channel', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');
    const channel = channelsCreateV1(user1.token, 'Boost', true);
    const message = messageSendV1(user1.token, channel.channelId, 'original message!');
    messageShareV1(user2.token, message.messageId, 'sharing this message', channel.channelId, -1);

    const editedMessage = putRequest(SERVER_URL + '/message/edit/v2', {
      messageId: message.messageId,
      message: 'This is an edited message'
    }, user1.token);

    expect(editedMessage).toStrictEqual({});
  });
});

describe('Testing messageEditV1 error handling for channels', () => {
  test('Testing invalid token', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    const message = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId,
      message: 'Hello this is a random test message'
    }, userId.token);

    const editedMessage = putRequest(SERVER_URL + '/message/edit/v2', {
      messageId: message.messageId,
      message: 'This is an edited message'
    }, userId.token + 'Invalid Token');

    expect(editedMessage.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(editedMessage.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('MessageId is invalid', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    const message = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId,
      message: 'Hello this is a random test message'
    }, userId.token);

    const editedMessage = putRequest(SERVER_URL + '/message/edit/v2', {
      messageId: message.messageId + 1,
      message: 'This is an edited message'
    }, userId.token);

    expect(editedMessage.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(editedMessage.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Message is an invalid length', () => {
    const messageGreaterThan1000Char = 'a'.repeat(1001);
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    const message = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId,
      message: 'This is an edited message'
    }, userId.token);

    const editedMessage = putRequest(SERVER_URL + '/message/edit/v2', {
      messageId: message.messageId,
      message: messageGreaterThan1000Char,
    }, userId.token);

    expect(editedMessage.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(editedMessage.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Message not sent by authorised user, user does have global owner permission but is not a member of the channel', () => {
    // user1 = the userId with global owner permissions
    const user1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    // user2 = the userId without owner permissions
    const user2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'fake.mcfake@student.unsw.edu.au',
      password: 'AnEvenWorsePassword',
      nameFirst: 'Fake',
      nameLast: 'McFake',
    });

    // if user2 creates this channel, they have owner permissions.
    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, user2.token);

    // a valid message is created by user 2 who is also the owner of the channel.
    const message = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId,
      message: 'Hello this is a random test message'
    }, user2.token);

    // user 1 tries to edit the message. They neither have owner permissions of the channel and are not the authorised sender of the message dm.
    const editedMessage = putRequest(SERVER_URL + '/message/edit/v2', {
      messageId: message.messageId,
      message: 'This is an edited message'
    }, user1.token);

    expect(editedMessage.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(editedMessage.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Message not sent by authorised user and the user does not have the global owner permission but they are a member of the channel', () => {
    // user1 = the userId with owner permissions
    const user1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    // user2 = the userId without owner permissions
    const user2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'fake.mcfake@student.unsw.edu.au',
      password: 'AnEvenWorsePassword',
      nameFirst: 'Fake',
      nameLast: 'McFake',
    });

    // if user1 creates this channel, they have owner permissions. user2 won't have owner status.
    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, user1.token);

    // user2 is now becoming a member of the channel but won't be an owner.
    postRequest(SERVER_URL + '/channel/join/v2', {
      channelId: channel.channelId
    }, user2.token);

    // a valid message is created by user 1 who is also the owner of the channel.
    const message = postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId,
      message: 'Hello this is a random test message'
    }, user1.token);

    // user 2 tries to edit the message. They neither have owner permissions of the channel and are not the authorised sender of the message dm.
    const editedMessage = putRequest(SERVER_URL + '/message/edit/v2', {
      messageId: message.messageId,
      message: 'This is an edited message'
    }, user2.token);

    expect(editedMessage.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(editedMessage.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('Testing messageEditV1 success for dms', () => {
  test('Successfully remove message', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const dm = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: [],
    }, userId.token);

    const message = postRequest(SERVER_URL + '/message/senddm/v2', {
      dmId: dm.dmId,
      message: 'Hello this is a random test message'
    }, userId.token);

    const editedMessage = putRequest(SERVER_URL + '/message/edit/v2', {
      messageId: message.messageId,
      message: 'This is an edited message'
    }, userId.token);

    expect(editedMessage).toStrictEqual({});
  });

  test('Successfully edit shared message dm', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const user2 = authRegisterV1('janedoe@gmail.com', 'password', 'Jane', 'Doe');
    const dm = dmCreateV1(user1.token, [user2.authUserId]);
    const message = messageSendDmV1(user1.token, dm.dmId, 'original message!');
    messageShareV1(user1.token, message.messageId, 'sharing this message', -1, dm.dmId);

    const editedMessage = putRequest(SERVER_URL + '/message/edit/v2', {
      messageId: message.messageId,
      message: 'This is an edited message'
    }, user1.token);

    expect(editedMessage).toStrictEqual({});
  });
});

describe('Testing messageEditV1 error handling for dms', () => {
  test('Testing invalid token', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });
    const dm = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: [],
    }, userId.token);

    const message = postRequest(SERVER_URL + '/message/senddm/v2', {
      dmId: dm.dmId,
      message: 'Hello this is a random test message'
    }, userId.token);

    const editedMessage = putRequest(SERVER_URL + '/message/edit/v2', {
      messageId: message.messageId,
      message: 'This is an edited message'
    }, userId.token + 'Invalid Token');

    expect(editedMessage.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(editedMessage.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing messageId is invalid', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });
    const dm = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: [],
    }, userId.token);

    const message = postRequest(SERVER_URL + '/message/senddm/v2', {
      dmId: dm.dmId,
      message: 'Hello this is a random test message'
    }, userId.token);

    const editedMessage = putRequest(SERVER_URL + '/message/edit/v2', {
      messageId: message.messageId + 1,
      message: 'This is an edited message'
    }, userId.token);

    expect(editedMessage.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(editedMessage.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Message is an invalid length', () => {
    const messageGreaterThan1000Char = 'a'.repeat(1001);
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });
    const dm = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: [],
    }, userId.token);

    const message = postRequest(SERVER_URL + '/message/senddm/v2', {
      dmId: dm.dmId,
      message: 'Hello this is a random test message'
    }, userId.token);

    const editedMessage = putRequest(SERVER_URL + '/message/edit/v2', {
      messageId: message.messageId,
      message: messageGreaterThan1000Char
    }, userId.token);

    expect(editedMessage.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(editedMessage.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Message not sent by authorised user and the user does not have global owner permissions', () => {
    // user1 = the userId with global owner permissions
    const user1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    // user2 = the userId without owner permissions
    const user2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'fake.mcfake@student.unsw.edu.au',
      password: 'AnEvenWorsePassword',
      nameFirst: 'Fake',
      nameLast: 'McFake',
    });

    // if user1 creates this dm, they have dm owner permissions && are global owners.
    const dm = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: [],
    }, user1.token);

    // a valid message is created by user 1 who is also the creator of the dm.
    const message = postRequest(SERVER_URL + '/message/senddm/v2', {
      dmId: dm.dmId,
      message: 'Hello this is a random test message'
    }, user1.token);

    // user 2 tries to edit. They are neither global owners or are the authorised sender of the message dm.
    const editedMessage = putRequest(SERVER_URL + '/message/edit/v2', {
      messageId: message.messageId,
      message: 'This is an edited message'
    }, user2.token);

    expect(editedMessage.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(editedMessage.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
