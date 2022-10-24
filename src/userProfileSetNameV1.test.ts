
import { postRequest, deleteRequest, getRequest, putRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// Before each test, clear dataStore
beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

// Working cases
describe('Testing userProfileSetNameV1 successful case handling', () => {
  test('Testing successful return of empty object', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const result = putRequest(SERVER_URL + '/user/profile/setname/v1', {
      token: user.token,
      nameFirst: 'John',
      nameLast: 'Doe',
    });

    expect(result).toMatchObject({});
  });

  test.each([
    { nameFirst: 'John', nameLast: 'Doe', desc: 'Successful return of empty object' },
    { nameFirst: 'John', nameLast: 'Doe', desc: 'Successfully updated first name' },
    { nameFirst: 'Jane', nameLast: 'Silly', desc: 'Successfully updated last name' },
    { nameFirst: 'Jabba', nameLast: 'The Hutt', desc: 'Successfully updated both names' },
    { nameFirst: 'J', nameLast: 'D', desc: 'Both names 1 letter long' },
    {
      nameFirst: 'ThisIsARealNameThatIsFiftyCharactersLongForSureHa',
      nameLast: 'ThisIsARealNameThatIsFiftyCharactersLongForSureHa',
      desc: 'Both names 50 letters long'
    },
  ])('$desc', ({ nameFirst, nameLast }) => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    putRequest(SERVER_URL + '/user/profile/setname/v1', {
      token: user.token,
      nameFirst: nameFirst,
      nameLast: nameLast,
    });

    const expectedUser = {
      user: {
        uId: user.authUserId,
        email: 'jane.doe@student.unsw.edu.au',
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'janedoe'
      }
    };

    const resultUser = getRequest(SERVER_URL + '/user/profile/v2', {
      token: user.token,
      uId: user.authUserId,
    });

    expect(resultUser).toMatchObject(expectedUser);
  });

  test('Testing successful return of users array with multiple users with names renamed', () => {
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

      // Rename user by swapping first and last names
      putRequest(SERVER_URL + '/user/profile/setname/v1', {
        token: user.token,
        nameFirst: lastNames[i],
        nameLast: firstNames[i],
      });
      users.push(user);
    }

    const resultUsers = getRequest(SERVER_URL + '/users/all/v1', {
      token: users[0].token,
    });

    // Loop through each user and check the user object has their first
    // and last names swapped
    for (let i = 0; i <= 4; i++) {
      const expectedUser = {
        uId: users[i].authUserId,
        email: `${firstNames[i]}.${lastNames[i]}@student.unsw.edu.au`,
        nameFirst: lastNames[i],
        nameLast: firstNames[i],
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

describe('Testing user/profile/setname/v1 error handling', () => {
  test.each([
    { token: 'InvalidToken', nameFirst: 'John', nameLast: 'Doe', desc: 'token is invalid' },
    { token: '', nameFirst: '', nameLast: '', desc: 'Both names are not longer than 1 character' },
    {
      token: '',
      nameFirst: 'ThisIsARealNameThatIsOverFiftyCharactersLongForSureHa',
      nameLast: 'ThisIsARealNameThatIsOverFiftyCharactersLongForSureHa',
      desc: 'Both names are over 50 letters long'
    },
  ])('$desc', ({ token, nameFirst, nameLast }) => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const result = putRequest(SERVER_URL + '/user/profile/setname/v1', {
      token: user.token + token,
      nameFirst: nameFirst,
      nameLast: nameLast,
    });

    expect(result).toStrictEqual(
      {
        error: expect.any(String),
      }
    );
  });
});
