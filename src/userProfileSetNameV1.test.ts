
import { postRequest, deleteRequest, getRequest, putRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const INVALID_TOKEN = 403;
const INPUT_ERROR = 400;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing userProfileSetNameV1 successful case handling', () => {
  test('Testing successful return of empty object', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const result = putRequest(SERVER_URL + '/user/profile/setname/v2', {
      nameFirst: 'John',
      nameLast: 'Doe',
    }, user.token);

    expect(result).toMatchObject({});
  });

  test('Testing channel ownerMembers and allMembers contain user with updated name', () => {
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

    putRequest(SERVER_URL + '/user/profile/setname/v2', {
      nameFirst: 'John',
      nameLast: 'Darcy',
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
          email: 'jane.doe@student.unsw.edu.au',
          nameFirst: 'John',
          nameLast: 'Darcy',
          handleStr: 'janedoe',
        }
      ],
      allMembers: [
        {
          uId: user.authUserId,
          email: 'jane.doe@student.unsw.edu.au',
          nameFirst: 'John',
          nameLast: 'Darcy',
          handleStr: 'janedoe',
        }
      ],
    };

    expect(result).toMatchObject(expectedChannelObj);
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
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    putRequest(SERVER_URL + '/user/profile/setname/v2', {
      nameFirst: nameFirst,
      nameLast: nameLast,
    }, user.token);

    const expectedUser = {
      user: {
        uId: user.authUserId,
        email: 'jane.doe@student.unsw.edu.au',
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'janedoe'
      }
    };

    const resultUser = getRequest(SERVER_URL + '/user/profile/v3', {
      uId: user.authUserId,
    }, user.token);

    expect(resultUser).toMatchObject(expectedUser);
  });
  test('Testing dm members contain user with updated name', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const dm = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: [],
    }, user.token);

    putRequest(SERVER_URL + '/user/profile/setname/v2', {
      nameFirst: 'John',
      nameLast: 'Darcy',
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
          email: 'jane.doe@student.unsw.edu.au',
          nameFirst: 'John',
          nameLast: 'Darcy',
          handleStr: 'janedoe',
        }
      ],
    };

    expect(result).toMatchObject(expectedDmObj);
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
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    putRequest(SERVER_URL + '/user/profile/setname/v2', {
      nameFirst: nameFirst,
      nameLast: nameLast,
    }, user.token);

    const expectedUser = {
      user: {
        uId: user.authUserId,
        email: 'jane.doe@student.unsw.edu.au',
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'janedoe'
      }
    };

    const resultUser = getRequest(SERVER_URL + '/user/profile/v3', {
      uId: user.authUserId,
    }, user.token);

    expect(resultUser).toMatchObject(expectedUser);
  });

  test('Testing successful return of users array with multiple users with names renamed', () => {
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

      // Rename user by swapping first and last names
      putRequest(SERVER_URL + '/user/profile/setname/v2', {
        nameFirst: lastNames[i],
        nameLast: firstNames[i],
      }, user.token);
      users.push(user);
    }

    const resultUsers = getRequest(SERVER_URL + '/users/all/v2', {}, users[0].token);

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

describe('Testing user/profile/setname/v2 error handling', () => {
  test.each([
    {
      token: 'InvalidToken',
      nameFirst: 'John',
      nameLast: 'Doe',
      desc: 'token is invalid',
      statusCode: INVALID_TOKEN
    },
    {
      token: '',
      nameFirst: '',
      nameLast: '',
      desc: 'Both names are not longer than 1 character',
      statusCode: INPUT_ERROR
    },
    {
      token: '',
      nameFirst: 'ThisIsARealNameThatIsOverFiftyCharactersLongForSureHa',
      nameLast: 'ThisIsARealNameThatIsOverFiftyCharactersLongForSureHa',
      desc: 'Both names are over 50 letters long',
      statusCode: INPUT_ERROR
    },
  ])('$desc', ({ token, nameFirst, nameLast, statusCode }) => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const result = putRequest(SERVER_URL + '/user/profile/setname/v2', {
      nameFirst: nameFirst,
      nameLast: nameLast,
    }, user.token + token);

    expect(result.statusCode).toBe(statusCode);

    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
