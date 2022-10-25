
import { postRequest, deleteRequest, getRequest, putRequest } from './other';

import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

// Before each test, clear dataStore
beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

// Working cases
describe('Testing user/profile/setemail/v1 success handling', () => {
  test('Testing successful return of empty object', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const result = putRequest(SERVER_URL + '/user/profile/setemail/v1', {
      token: user.token,
      email: 'janed@gmail.com',
    });

    expect(result).toMatchObject({});
  });

  test('Testing channel ownerMembers and allMembers contain user with updated email', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const channel = putRequest(SERVER_URL + '/channels/create/v2', {
      token: user.token,
      name: 'Boost',
      isPublic: true,
    });

    putRequest(SERVER_URL + '/user/profile/setemail/v1', {
      token: user.token,
      email: 'janed@gmail.com',
    });

    const result = getRequest(SERVER_URL + '/channel/details/v2', {
      token: user.token,
      channelId: channel.channelId,
    });

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
          nameFirst: 'John',
          nameLast: 'Darcy',
          handleStr: 'janedoe',
        }
      ],
    };

    expect(result).toMatchObject(expectedChannelObj);
  });

  test.each([
    { email: 'jdoe@gmail.com', desc: 'Email updated correctly in user profile' },
  ])('$desc', ({ email }) => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    putRequest(SERVER_URL + '/user/profile/setemail/v1', {
      token: user.token,
      email: email,
    });

    const expectedUser = {
      user: {
        uId: user.authUserId,
        email: email,
        nameFirst: 'Jane',
        nameLast: 'Doe',
        handleStr: 'janedoe'
      }
    };

    const resultUser = getRequest(SERVER_URL + '/user/profile/v2', {
      token: user.token,
      uId: user.authUserId,
    });

    expect(resultUser).toMatchObject(expectedUser);
  });

  test('Testing successful return of users array with multiple users with emails renamed', () => {
    // Create multiple users
    const users = [];
    const firstNames = ['jane', 'bob', 'sally', 'john', 'peter'];
    const lastNames = ['doe', 'junior', 'beans', 'wick', 'cordial'];

    for (let i = 0; i <= 4; i++) {
      // Create the user
      const user = postRequest(SERVER_URL + '/auth/register/v2', {
        email: `${firstNames[i]}.${lastNames[i]}@student.unsw.edu.au`,
        password: 'AP@ssW0rd!',
        nameFirst: firstNames[i],
        nameLast: lastNames[i],
      });

      // Rename email by changing e-mail domain
      putRequest(SERVER_URL + '/user/profile/setemail/v1', {
        token: user.token,
        email: `${firstNames[i]}.${lastNames[i]}@gmail.com`,
      });
      users.push(user);
    }

    const resultUsers = getRequest(SERVER_URL + '/users/all/v1', {
      token: users[0].token,
    });

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

describe('Testing user/profile/setemail/v1 error handling', () => {
  test.each([
    { token: 'InvalidToken', email: 'jdoe@gmail.com', desc: 'token is invalid' },
    { token: '', email: 'jane.doe@student.unsw.edu.au', desc: 'email address is already being used by another user' },
    { token: '', email: 'jdoe@gmail', desc: 'email entered is not a valid email' },
  ])('$desc', ({ token, email }) => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const result = putRequest(SERVER_URL + '/user/profile/setemail/v1', {
      token: user.token + token,
      email: email,
    });

    expect(result).toStrictEqual(
      {
        error: expect.any(String),
      }
    );
  });
});
