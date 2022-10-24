import { postRequest, deleteRequest, getRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// Before each test, clear dataStore
beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

// Working cases
describe('Testing usersAllV1 successful case handling', () => {
  test('Testing successful return of users array with multiple users', () => {
  
    // Create multiple users
    const users = [];
    const firstNames = ['Jane', 'Bob', 'Sally', 'John', 'Peter'];
    const lastNames = ['Doe', 'Junior', 'Beans', 'Wick', 'Cordial'];
    for (let i = 0; i <= 4; i++) {
      const user = postRequest(SERVER_URL + '/auth/register/v2', {
        email: `${firstNames[i]}.${lastNames[i]}@student.unsw.edu.au`,
        password: 'AP@ssW0rd!',
        nameFirst: firstNames[i],
        nameLast: lastNames[i],
      });
      
      users.push(user);
    }
  
    const resultUsers = getRequest(SERVER_URL + '/users/all/v1', {
      token: users[0].token,
    });
    
    for (let i = 0; i <= 4; i++) {
      const expectedUser = {
        user: {
          uId: users[i].authUserId,
          email: `${firstNames[i]}.${lastNames[i]}@student.unsw.edu.au`,
          nameFirst: firstNames[i],
          nameLast: lastNames[i],
          handleStr: `${firstNames[i]}${lastNames[i]}`,
        }
      };  
      expect(resultUsers).toContain(expectedUser);
    }
  });

  test('Testing successful return of users array with one user', () => {
  
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const resultUsers = getRequest(SERVER_URL + '/users/all/v1', {
      token: user.token,
    });
    
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

      expect(resultUsers).toContain(expectedUsers);
    
  });

});

describe('Testing usersAllV1 error handling', () => {
  test.each([
    { token: 'InvalidToken', desc: 'Token is invalid' },
  ])('$desc', ({ token }) => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const result = getRequest(SERVER_URL + '/users/all/v1', {
      token: user.token + token,
    });

    expect(result).toStrictEqual(
      {
        error: expect.any(String),
      }
    );
  });
});
