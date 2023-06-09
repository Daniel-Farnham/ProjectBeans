
import { postRequest, deleteRequest, getRequest, putRequest } from './other';

import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

// Working cases
describe('Testing user/profile/sethandle/v1 success handling', () => {
  test('Testing successful return of empty object', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const result = putRequest(SERVER_URL + '/user/profile/sethandle/v1', {
      token: user.token,
      handleStr: 'coolestperson',
    });

    expect(result).toMatchObject({});
  });

  test('Testing channel ownerMembers and allMembers contain user with updated handleStr', () => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: user.token,
      name: 'Boost',
      isPublic: true,
    });

    putRequest(SERVER_URL + '/user/profile/sethandle/v1', {
      token: user.token,
      handleStr: 'janeiscool123',
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
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    putRequest(SERVER_URL + '/user/profile/sethandle/v1', {
      token: user.token,
      handleStr: handleStr,
    });

    const expectedUser = {
      user: {
        uId: user.authUserId,
        email: 'jane.doe@student.unsw.edu.au',
        nameFirst: 'Jane',
        nameLast: 'Doe',
        handleStr: handleStr
      }
    };

    const resultUser = getRequest(SERVER_URL + '/user/profile/v2', {
      token: user.token,
      uId: user.authUserId,
    });

    expect(resultUser).toMatchObject(expectedUser);
  });

  test('Testing successful return of users array with multiple users with handleStrs renamed', () => {
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

      // Update handleStr for user
      putRequest(SERVER_URL + '/user/profile/sethandle/v1', {
        token: user.token,
        handleStr: `${firstNames[i]}iscool`,
      });
      users.push(user);
    }

    const resultUsers = getRequest(SERVER_URL + '/users/all/v1', {
      token: users[0].token,
    });

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
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const dm = postRequest(SERVER_URL + '/dm/create/v1', {
      token: user.token,
      uIds: [],
    });

    putRequest(SERVER_URL + '/user/profile/sethandle/v1', {
      token: user.token,
      handleStr: 'janeiscool',
    });

    const result = getRequest(SERVER_URL + '/dm/details/v1', {
      token: user.token,
      dmId: dm.dmId,
    });

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

describe('Testing user/profile/sethandle/v1 error handling', () => {
  test.each([
    { token: '', handleStr: 'jd', desc: 'length of handleStr <3 characters' },
    { token: '', handleStr: 'janedoeshasaverylonghandlestring12345', desc: 'length of handleStr >20 characters' },
    { token: '', handleStr: 'ThisIsNot!ALPHANUMERIC!!!>:(', desc: 'handleStr contains non alphanumeric characters' },
    { token: '', handleStr: 'janedoe', desc: 'handleStr is already being used by another user' },
    { token: 'InvalidToken', handleStr: 'jdoe@gmail.com', desc: 'token is invalid' },
  ])('$desc', ({ token, handleStr }) => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const result = putRequest(SERVER_URL + '/user/profile/sethandle/v1', {
      token: user.token + token,
      handleStr: handleStr,
    });

    expect(result).toStrictEqual(
      {
        error: expect.any(String),
      }
    );
  });
});
