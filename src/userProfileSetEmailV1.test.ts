
import { postRequest, deleteRequest, getRequest, putRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const INPUT_ERROR = 400;
const INVALID_TOKEN = 403;
beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing user/profile/setemail/v2 success handling', () => {
  test('Testing successful return of empty object', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const result = putRequest(SERVER_URL + '/user/profile/setemail/v2', {
      email: 'janed@gmail.com',
    }, user.token);

    expect(result).toMatchObject({});
  });

  test('Testing channel ownerMembers and allMembers contain user with updated email', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'Boost',
      isPublic: true,
    }, user.token);

    putRequest(SERVER_URL + '/user/profile/setemail/v2', {
      email: 'janed@gmail.com',
    }, user.token);

    const result = getRequest(SERVER_URL + '/channel/details/v3', {
      channelId: channel.channelId,
    }, user.token);

    const expectedChannelObj = {
      name: 'Boost',
      isPublic: true,
      ownerMembers:
      [
        {
          uId: user.authUserId,
          email: 'janed@gmail.com',
          nameFirst: 'Jane',
          nameLast: 'Doe',
          handleStr: 'janedoe',
        }
      ],
      allMembers: [
        {
          uId: user.authUserId,
          email: 'janed@gmail.com',
          nameFirst: 'Jane',
          nameLast: 'Doe',
          handleStr: 'janedoe',
        }
      ],
    };

    expect(result).toMatchObject(expectedChannelObj);
  });

  test('Testing dm members contain user with updated email', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const dm = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: [],
    }, user.token);

    putRequest(SERVER_URL + '/user/profile/setemail/v2', {
      email: 'janed@gmail.com',
    }, user.token);

    const result = getRequest(SERVER_URL + '/dm/details/v2', {
      dmId: dm.dmId,
    }, user.token);

    const expectedDmObj = {
      name: 'janedoe',
      members:
      [
        {
          uId: user.authUserId,
          email: 'janed@gmail.com',
          nameFirst: 'Jane',
          nameLast: 'Doe',
          handleStr: 'janedoe',
        }
      ],
    };

    expect(result).toMatchObject(expectedDmObj);
  });

  test.each([
    { email: 'jdoe@gmail.com', desc: 'Email updated correctly in user profile' },
  ])('$desc', ({ email }) => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    putRequest(SERVER_URL + '/user/profile/setemail/v2', {
      email: email,
    }, user.token);

    const expectedUser = {
      user: {
        uId: user.authUserId,
        email: email,
        nameFirst: 'Jane',
        nameLast: 'Doe',
        handleStr: 'janedoe'
      }
    };

    const resultUser = getRequest(SERVER_URL + '/user/profile/v3', {
      uId: user.authUserId,
    }, user.token);

    expect(resultUser).toMatchObject(expectedUser);
  });

  test('Testing successful return of users array with multiple users with emails renamed', () => {
    // Create multiple users
    const users = [];
    const firstNames = ['jane', 'bob', 'sally', 'john', 'peter'];
    const lastNames = ['doe', 'junior', 'beans', 'wick', 'cordial'];

    for (let i = 0; i <= 4; i++) {
      // Create the user
      const user = postRequest(SERVER_URL + '/auth/register/v3', {
        email: `${firstNames[i]}.${lastNames[i]}@student.unsw.edu.au`,
        password: 'AP@ssW0rd!',
        nameFirst: firstNames[i],
        nameLast: lastNames[i],
      });

      // Rename email by changing e-mail domain
      putRequest(SERVER_URL + '/user/profile/setemail/v2', {
        email: `${firstNames[i]}.${lastNames[i]}@gmail.com`,
      }, user.token);
      users.push(user);
    }

    const resultUsers = getRequest(SERVER_URL + '/users/all/v2', {}, users[0].token);

    // Loop through each user and check the user object has the e-mail domain
    // name changed
    for (let i = 0; i <= 4; i++) {
      const expectedUser = {
        uId: users[i].authUserId,
        email: `${firstNames[i]}.${lastNames[i]}@gmail.com`,
        nameFirst: firstNames[i],
        nameLast: lastNames[i],
        handleStr: `${firstNames[i]}${lastNames[i]}`,
      };

      expect(resultUsers.users).toEqual(
        expect.arrayContaining([
          expect.objectContaining(expectedUser)
        ])
      );
    }
  });
});

describe('Testing user/profile/setemail/v2 error handling', () => {
  test.each([
    {
      token: 'InvalidToken',
      email: 'jdoe@gmail.com',
      desc: 'token is invalid',
      statusCode: INVALID_TOKEN
    },
    {
      token: '',
      email: 'jane.doe@student.unsw.edu.au',
      desc: 'email address is already being used by another user',
      statusCode: INPUT_ERROR
    },
    {
      token: '',
      email: 'jdoe@gmail',
      desc: 'email entered is not a valid email',
      statusCode: INPUT_ERROR
    },
  ])('$desc', ({ token, email, statusCode }) => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const result = putRequest(SERVER_URL + '/user/profile/setemail/v2', {
      email: email,
    }, user.token + token);

    expect(result.statusCode).toBe(statusCode);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
