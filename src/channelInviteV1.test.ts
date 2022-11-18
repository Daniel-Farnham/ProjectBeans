import { postRequest, deleteRequest, getRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const FORBIDDEN = 403;
const BAD_REQUEST = 400;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Working cases', () => {
  test('Successful return of empty object when executing channelInviteV1', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });
    const user2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });
    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, user1.token);

    const result = postRequest(SERVER_URL + '/channel/invite/v3', {
      channelId: channel.channelId,
      uId: user2.authUserId
    }, user1.token);

    expect(result).toMatchObject({});
  });

  test('User listed as member of channel after being invited to the channel', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });
    const user2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, user1.token);

    postRequest(SERVER_URL + '/channel/invite/v3', {
      channelId: channel.channelId,
      uId: user2.authUserId
    }, user1.token);

    const result = getRequest(SERVER_URL + '/channel/details/v3', {
      channelId: channel.channelId,
    }, user2.token);

    const expectedResult = {
      name: 'General',
      isPublic: true,
      ownerMembers: [
        {
          uId: user1.authUserId,
          nameFirst: 'Hang',
          nameLast: 'Pham',
          email: 'hang.pham1@student.unsw.edu.au',
          handleStr: 'hangpham',
        },
      ],
      allMembers: [
        {
          uId: user1.authUserId,
          nameFirst: 'Hang',
          nameLast: 'Pham',
          email: 'hang.pham1@student.unsw.edu.au',
          handleStr: 'hangpham',
        },
        {
          uId: user2.authUserId,
          nameFirst: 'Jane',
          nameLast: 'Doe',
          email: 'jane.doe@student.unsw.edu.au',
          handleStr: 'janedoe',
        },
      ],
    };
    expect(result).toMatchObject(expectedResult);
  });
});

describe('Testing channelInviteV1 error handling', () => {
  test('channelId does not refer to a valid channel', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });

    const user2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, user1.token);

    const result = postRequest(SERVER_URL + '/channel/invite/v3', {
      channelId: channel.channelId + 10,
      uId: user2.authUserId
    }, user1.token);

    expect(result.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('uId does not refer to a valid user', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });
    const user2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });
    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, user1.token);
    const result = postRequest(SERVER_URL + '/channel/invite/v3', {
      channelId: channel.channelId,
      uId: user1.authUserId + user2.authUserId + 10
    }, user1.token);

    expect(result.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('token is invalid', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });
    const user2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, user1.token);

    const result = postRequest(SERVER_URL + '/channel/invite/v3', {
      channelId: channel.channelId,
      uId: user2.authUserId
    }, user1.token + user2.token + 'InvalidToken');

    expect(result.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('uId refers to a user who is already a member of the channel', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });
    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, user1.token);
    const result = postRequest(SERVER_URL + '/channel/invite/v3', {
      channelId: channel.channelId,
      uId: user1.authUserId
    }, user1.token);

    expect(result.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });
    const user2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });
    const user3 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'stella.jones@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Stella',
      nameLast: 'Jones',
    });
    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, user1.token);
    const result = postRequest(SERVER_URL + '/channel/invite/v3', {
      channelId: channel.channelId,
      uId: user2.authUserId
    }, user3.token);

    expect(result.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
