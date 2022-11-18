import { getRequest, postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
import { user } from './types';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  return postRequest(SERVER_URL + '/auth/register/v3', { email, password, nameFirst, nameLast });
}

function adminUserRemoveV1(token: string, uId: number) {
  return deleteRequest(SERVER_URL + '/admin/user/remove/v1', { uId }, token);
}

function usersAllV1(token: string) {
  return getRequest(SERVER_URL + '/users/all/v2', { }, token);
}

describe('Testing basic adminUserRemoveV1 functionality', () => {
  test('Test that adminUserRemoveV1 successful retrives user profile', () => {
    const global = authRegisterV1('bubbles@ad.unsw.edu.au', 'password', 'Bubleen', 'Rosie');
    const user = authRegisterV1('roses@ad.unsw.edu.au', 'password', 'Bee', 'Rosie');

    adminUserRemoveV1(global.token, user.authUserId);

    const expectedUser = {
      user: {
        uId: user.authUserId,
        email: expect.any(String),
        nameFirst: 'Removed',
        nameLast: 'user',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      }
    };

    const resultUser = getRequest(SERVER_URL + '/user/profile/v3', { uId: user.authUserId }, global.token);
    expect(resultUser).toEqual(expectedUser);
  });

  test('Test that adminUserRemoveV1 successfully removes user from all channels, dms and messages replaced with removed user', () => {
    const global = authRegisterV1('bubbles@ad.unsw.edu.au', 'password', 'Bubleen', 'Rosie');
    const user = authRegisterV1('roses@ad.unsw.edu.au', 'password', 'Bee', 'Rosie');

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, global.token);

    postRequest(SERVER_URL + '/channel/join/v3', {
      channelId: channel.channelId
    }, user.token);

    postRequest(SERVER_URL + '/message/send/v2', {
      channelId: channel.channelId,
      message: 'Hello this is a random test message'
    }, user.token);

    const dmId = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: [user.authUserId]
    }, global.token);

    postRequest(SERVER_URL + '/message/senddm/v2', {
      dmId: dmId.dmId,
      message: 'This is my first message',
    }, user.token);

    adminUserRemoveV1(global.token, user.authUserId);

    // channel and dm messages are now removed user
    const messages = getRequest(SERVER_URL + '/channel/messages/v3', {
      channelId: channel.channelId,
      start: 0,
    }, global.token);

    expect(messages.messages[0].message).toBe('Removed user');

    const dms = getRequest(SERVER_URL + '/dm/messages/v2', {
      dmId: dmId.dmId,
      start: 0,
    }, global.token);

    expect(dms.messages[0].message).toBe('Removed user');

    const returnedChannelObj = getRequest(SERVER_URL + '/channel/details/v3', {
      channelId: channel.channelId
    }, global.token);

    const removedInChannel = returnedChannelObj.allMembers.find((member: user): member is user => member.uId === user.authUserId);
    expect(removedInChannel).toEqual(undefined);

    const dmDetails = getRequest(SERVER_URL + '/dm/details/v2', {
      dmId: dmId.dmId
    }, global.token);

    const removedInDm = dmDetails.members.find((member: user): member is user => member.uId === user.authUserId);

    expect(removedInDm).toEqual(undefined);
  });

  test('Test that adminUserRemoveV1 successfully removes user from users all', () => {
    const global = authRegisterV1('bubbles@ad.unsw.edu.au', 'password', 'Bubleen', 'Rosie');
    const user = authRegisterV1('roses@ad.unsw.edu.au', 'password', 'Bee', 'Rosie');

    adminUserRemoveV1(global.token, user.authUserId);
    const userArray = usersAllV1(global.token);

    const expectedUser = {
      uId: global.authUserId,
      email: expect.any(String),
      nameFirst: 'Bubleen',
      nameLast: 'Rosie',
      handleStr: expect.any(String)
    };

    expect(userArray.users).toEqual([expectedUser]);
  });
});

describe('Testing adminUserRemoveV1 error handling HTTP errors', () => {
  test('Testing uId does not refer to a valid user', () => {
    const authId = authRegisterV1('roses@ad.unsw.edu.au', 'password', 'Bee', 'Rosie');
    const removeUser = authRegisterV1('bubbles', 'password', 'Bubleen', 'Rosie');

    const remove = adminUserRemoveV1(authId.token, removeUser.authUserId);

    expect(remove.statusCode).toBe(400);
    const bodyObj = JSON.parse(remove.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing uId which referes to a user who is the only global owner', () => {
    const authId = authRegisterV1('roses@ad.unsw.edu.au', 'password', 'Bee', 'Rosie');
    const remove = adminUserRemoveV1(authId.token, authId.authUserId);

    expect(remove.statusCode).toBe(400);
    const bodyObj = JSON.parse(remove.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing the authorised user is not a global owner', () => {
    authRegisterV1('roses@ad.unsw.edu.au', 'password', 'Bee', 'Rosie');
    const authId = authRegisterV1('bubbles@ad.unsw.edu.au', 'password', 'Bubleen', 'Rosie');
    const remove = adminUserRemoveV1(authId.token, authId.authUserId);

    expect(remove.statusCode).toBe(403);
    const bodyObj = JSON.parse(remove.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
