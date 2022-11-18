import { postRequest, deleteRequest, getRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const INPUT_ERROR = 400;
const INVALID_TOKEN = 403;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

test('Testing successful return of user profile', () => {
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

  const expectedUser = {
    user: {
      uId: user1.authUserId,
      email: 'hang.pham1@student.unsw.edu.au',
      nameFirst: 'Hang',
      nameLast: 'Pham',
      handleStr: 'hangpham',
    }
  };

  const resultUser = getRequest(SERVER_URL + '/user/profile/v3', {
    uId: user1.authUserId,
  }, user2.token);

  expect(resultUser).toMatchObject(expectedUser);
});

describe('Testing userProfileV2 error handling', () => {
  test.each([
    { token: '', uId: 100, desc: 'uID to search does not exist', statusCode: INPUT_ERROR },
    { token: 'InvalidToken', uId: 0, desc: 'token is invalid', statusCode: INVALID_TOKEN },
  ])('$desc', ({ token, uId, statusCode }) => {
    const user = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });

    const result = getRequest(SERVER_URL + '/user/profile/v3', {
      uId: user.authUserId + uId,
    }, user.token + token);

    expect(result.statusCode).toBe(statusCode);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
