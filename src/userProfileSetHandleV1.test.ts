
import { postRequest, deleteRequest, getRequest, putRequest } from './other';

import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const INPUT_ERROR = 400;
const INVALID_TOKEN = 403;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

// Working cases
describe('Testing user/profile/sethandle/v2 success handling', () => {
  test('Testing successful return of empty object', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const result = putRequest(SERVER_URL + '/user/profile/sethandle/v2', {
      handleStr: 'coolestperson',
    }, user.token);

    expect(result).toMatchObject({});
  });

  test('Testing channel ownerMembers and allMembers contain user with updated handleStr', () => {
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

    putRequest(SERVER_URL + '/user/profile/sethandle/v2', {
      handleStr: 'janeiscool123',
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
          nameFirst: 'Jane',
          nameLast: 'Doe',
          handleStr: 'janeiscool123',
        }
      ],
      allMembers: [
        {
          uId: user.authUserId,
          email: 'jane.doe@student.unsw.edu.au',
          nameFirst: 'Jane',
          nameLast: 'Doe',
          handleStr: 'janeiscool123',
        }
      ],
    };

    expect(result).toMatchObject(expectedChannelObj);
  });

  test.each([
    { handleStr: 'coolestperson', desc: 'handleStr updated correctly in user profile' },
    { handleStr: 'dog', desc: 'handleStr 3 characters long' },
    { handleStr: 'dog', desc: 'handleStr 20 characters long' },
    { handleStr: 'dog123', desc: 'handleStr changed to alphanumeric characters only' },
    { handleStr: '342543', desc: 'handleStr changed to numeric characters only' },
  ])('$desc', ({ handleStr }) => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    putRequest(SERVER_URL + '/user/profile/sethandle/v2', {
      handleStr: handleStr,
    }, user.token);

    const expectedUser = {
      user: {
        uId: user.authUserId,
        email: 'jane.doe@student.unsw.edu.au',
        nameFirst: 'Jane',
        nameLast: 'Doe',
        handleStr: handleStr
      }
    };

    const resultUser = getRequest(SERVER_URL + '/user/profile/v3', {
      uId: user.authUserId,
    }, user.token);

    expect(resultUser).toMatchObject(expectedUser);
  });

  test('Testing successful return of users array with multiple users with handleStrs renamed', () => {
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

      // Update handleStr for user
      putRequest(SERVER_URL + '/user/profile/sethandle/v2', {
        handleStr: `${firstNames[i]}iscool`,
      }, user.token);
      users.push(user);
    }

    const resultUsers = getRequest(SERVER_URL + '/users/all/v2', {}, users[0].token);

    // Loop through each user and check the user object has the handleStr changed
    for (let i = 0; i <= 4; i++) {
      const expectedUser = {
        uId: users[i].authUserId,
        email: `${firstNames[i]}.${lastNames[i]}@student.unsw.edu.au`,
        nameFirst: firstNames[i],
        nameLast: lastNames[i],
        handleStr: `${firstNames[i]}iscool`,
      };

      expect(resultUsers.users).toEqual(
        expect.arrayContaining([
          expect.objectContaining(expectedUser)
        ])
      );
    }
  });

  test('Testing dm members contain user with updated handleStr', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const dm = postRequest(SERVER_URL + '/dm/create/v2', {
      uIds: [],
    }, user.token);

    putRequest(SERVER_URL + '/user/profile/sethandle/v2', {
      handleStr: 'janeiscool',
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
          nameFirst: 'Jane',
          nameLast: 'Doe',
          handleStr: 'janeiscool',
        }
      ],
    };

    expect(result).toMatchObject(expectedDmObj);
  });
});

describe('Testing user/profile/sethandle/v2 error handling', () => {
  test.each([
    {
      token: '',
      handleStr: 'jd',
      desc: 'length of handleStr <3 characters',
      statusCode: INPUT_ERROR
    },
    {
      token: '',
      handleStr: 'janedoeshasaverylonghandlestring12345',
      desc: 'length of handleStr >20 characters',
      statusCode: INPUT_ERROR
    },
    {
      token: '',
      handleStr: 'ThisIsNot!ALPHANUMERIC!!!>:(',
      desc: 'handleStr contains non alphanumeric characters',
      statusCode: INPUT_ERROR
    },
    {
      token: '',
      handleStr: 'janedoe',
      desc: 'handleStr is already being used by another user',
      statusCode: INPUT_ERROR
    },
    {
      token: 'InvalidToken',
      handleStr: 'jdoe@gmail.com',
      desc: 'token is invalid',
      statusCode: INVALID_TOKEN
    },
  ])('$desc', ({ token, handleStr, statusCode }) => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const result = putRequest(SERVER_URL + '/user/profile/sethandle/v2', {
      handleStr: handleStr,
    }, user.token + token);
    expect(result.statusCode).toBe(statusCode);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
