import { getRequest, postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
import { channelJoinV1, channelsCreateV1 } from './wrapperFunctions';
const SERVER_URL = `${url}:${port}`;
const GLOBAL_OWNER = 1;
const GLOBAL_MEMBER = 2;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  return postRequest(SERVER_URL + '/auth/register/v3', { email, password, nameFirst, nameLast });
}

function adminUserPermissionChangeV1(token: string, uId: number, permissionId: number) {
  return postRequest(SERVER_URL + '/admin/userpermission/change/v1', { uId, permissionId }, token);
}

function channelDetailsV1(token: string, channelId: number) {
  return getRequest(SERVER_URL + '/channel/details/v3', { channelId }, token);
}

describe('Testing basic adminUserPermissionChangeV1 functionality', () => {
  test('Test that adminUserPermissionChangeV1 successfully changes a permission to owner', () => {
    const global = authRegisterV1('bubbles@ad.unsw.edu.au', 'password', 'Bubleen', 'Rosie');
    const changeUser = authRegisterV1('roses@ad.unsw.edu.au', 'password', 'Bee', 'Rosie');

    const channel = channelsCreateV1(global.token, 'a test case', false).channelId;
    const channel2 = channelsCreateV1(changeUser.token, 'another test case', false).channelId;

    adminUserPermissionChangeV1(global.token, changeUser.authUserId, 1);
    adminUserPermissionChangeV1(changeUser.token, global.authUserId, 2);

    expect(channelJoinV1(global.token, channel2).statusCode).toBe(403);
    channelJoinV1(changeUser.token, channel);
    expect(channelDetailsV1(changeUser.token, channel).allMembers).toEqual([
      {
        uId: global.authUserId,
        nameFirst: expect.any(String),
        nameLast: expect.any(String),
        email: expect.any(String),
        handleStr: expect.any(String),
      },
      {
        uId: changeUser.authUserId,
        nameFirst: expect.any(String),
        nameLast: expect.any(String),
        email: expect.any(String),
        handleStr: expect.any(String),
      }
    ]);
  });
});

describe('Testing adminUserPermissionChangeV1 error handling HTTP errors', () => {
  test('Testing uId does not refer to a valid user', () => {
    const global = authRegisterV1('roses@ad.unsw.edu.au', 'password', 'Bee', 'Rosie');
    const changeUser = authRegisterV1('bubbles', 'password', 'Bubleen', 'Rosie');

    const change = adminUserPermissionChangeV1(global.token, changeUser.authUserId, GLOBAL_MEMBER);

    expect(change.statusCode).toBe(400);
    const bodyObj = JSON.parse(change.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing uId which referes to a user who is the only global owner and is being demoted to a user', () => {
    const authId = authRegisterV1('roses@ad.unsw.edu.au', 'password', 'Bee', 'Rosie');
    authRegisterV1('bubbles@ad.unsw.edu.au', 'password', 'Bubleen', 'Rosie');
    const change = adminUserPermissionChangeV1(authId.token, authId.authUserId, GLOBAL_MEMBER);

    expect(change.statusCode).toBe(400);
    const bodyObj = JSON.parse(change.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing an invalid permission ID', () => {
    const global = authRegisterV1('bubbles@ad.unsw.edu.au', 'password', 'Bubleen', 'Rosie');
    const change = adminUserPermissionChangeV1(global.token, global.authUserId, 3);

    expect(change.statusCode).toBe(400);
    const bodyObj = JSON.parse(change.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing a user which already has the permission level', () => {
    const authId = authRegisterV1('bubbles@ad.unsw.edu.au', 'password', 'Bubleen', 'Rosie');
    authRegisterV1('roses@ad.unsw.edu.au', 'password', 'Bee', 'Rosie');
    const change = adminUserPermissionChangeV1(authId.token, authId.authUserId, GLOBAL_OWNER);

    expect(change.statusCode).toBe(400);
    const bodyObj = JSON.parse(change.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing the authorised user is not a global owner', () => {
    authRegisterV1('roses@ad.unsw.edu.au', 'password', 'Bee', 'Rosie');
    const authId = authRegisterV1('bubbles@ad.unsw.edu.au', 'password', 'Bubleen', 'Rosie');
    const remove = adminUserPermissionChangeV1(authId.token, authId.authUserId, GLOBAL_MEMBER);

    expect(remove.statusCode).toBe(403);
    const bodyObj = JSON.parse(remove.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
