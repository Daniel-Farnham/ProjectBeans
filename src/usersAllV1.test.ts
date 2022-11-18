import { postRequest, deleteRequest, getRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const INVALID_TOKEN = 403;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing usersAllV1 successful case handling', () => {
  test('Testing successful return of users array with multiple users', () => {
    // Create multiple users
    const users = [];
    const firstNames = ['jane', 'bob', 'sally', 'john', 'peter'];
    const lastNames = ['doe', 'junior', 'beans', 'wick', 'cordial'];
    for (let i = 0; i <= 4; i++) {
      const user = postRequest(SERVER_URL + '/auth/register/v3', {
        email: `${firstNames[i]}.${lastNames[i]}@student.unsw.edu.au`,
        password: 'AP@ssW0rd!',
        nameFirst: firstNames[i],
        nameLast: lastNames[i],
      });
      users.push(user);
    }

    const resultUsers = getRequest(SERVER_URL + '/users/all/v2', {}, users[0].token);

    // Loop through each user and check the user object exists within the
    // returned users object that was called by /users/all/v2
    for (let i = 0; i <= 4; i++) {
      const expectedUser = {
        uId: users[i].authUserId,
        email: `${firstNames[i]}.${lastNames[i]}@student.unsw.edu.au`,
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

  test('Testing successful return of users array with one user', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const resultUsers = getRequest(SERVER_URL + '/users/all/v2', {}, user.token);

    const expectedUsers = {
      users: [
        {
          uId: user.authUserId,
          email: 'jane.doe@student.unsw.edu.au',
          nameFirst: 'Jane',
          nameLast: 'Doe',
          handleStr: 'janedoe',
        }
      ],
    };

    expect(resultUsers).toMatchObject(expectedUsers);
  });
});

describe('Testing usersAllV1 error handling', () => {
  test.each([
    { token: 'InvalidToken', desc: 'Token is invalid' },
  ])('$desc', ({ token }) => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const result = getRequest(SERVER_URL + '/users/all/v2', {}, user.token + token);
    expect(result.statusCode).toBe(INVALID_TOKEN);

    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
