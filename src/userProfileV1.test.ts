import { postRequest, deleteRequest, getRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

test('Testing successful return of user profile', () => {
  const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
    email: 'hang.pham1@student.unsw.edu.au',
    password: 'AP@ssW0rd!',
    nameFirst: 'Hang',
    nameLast: 'Pham',
  });

  const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
    email: 'jane.doe@student.unsw.edu.au',
    password: 'AP@ssW0rd!',
    nameFirst: 'Jane',
    nameLast: 'Doe',
  });

  const expectedUser = {
    user: {
      uId: user1.authUserId,
      email: 'hang.pham1@student.unsw.edu.au',
      nameFirst: 'Hang',
      nameLast: 'Pham',
      handleStr: 'hangpham',
    }
  };

  const resultUser = getRequest(SERVER_URL + '/user/profile/v2', {
    token: user2.token,
    uId: user1.authUserId,
  });

  expect(resultUser).toMatchObject(expectedUser);
});

describe('Testing userProfileV2 error handling', () => {
  test.each([
    { token: '', uId: 100, desc: 'uID to search does not exist' },
    { token: 'InvalidToken', uId: 0, desc: 'token is invalid' },
  ])('$desc', ({ token, uId }) => {
    const user = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const result = getRequest(SERVER_URL + '/user/profile/v2', {
      token: user.token + token,
      uId: user.authUserId + uId,
    });

    expect(result).toStrictEqual(
      {
        error: expect.any(String),
      }
    );
  });
});
