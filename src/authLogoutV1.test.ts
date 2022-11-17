import { getRequest, postRequest } from './other';
import { authLoginV1, authRegisterV1, clearV1 } from './wrapperFunctions';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const INVALID_TOKEN = 403;

beforeEach(() => {
  clearV1();
});

describe('Testing successful cases for authLogoutV1', () => {
  test('Testing returning empty object upon successful logout', () => {
    const user = authRegisterV1('hang.pham1@student.unsw.edu.au', 'password', 'Hang', 'Pham');
    const result = postRequest(SERVER_URL + '/auth/logout/v2', {}, user.token);

    expect(result).toStrictEqual({});
  });

  test('Testing unsuccessful user profile access when using token that is no longer valid', () => {
    const user = authRegisterV1('hang.pham1@student.unsw.edu.au', 'password', 'Hang', 'Pham');

    postRequest(SERVER_URL + '/auth/logout/v2', {}, user.token);

    const result = getRequest(SERVER_URL + '/user/profile/v3', { uId: user.authUserId }, user.token);

    expect(result.statusCode).toBe(INVALID_TOKEN);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing ability to login with another token if logged out of one token', () => {
    const user = authRegisterV1('hang.pham1@student.unsw.edu.au', 'password', 'Hang', 'Pham');
    const loggedInSession = authLoginV1('hang.pham1@student.unsw.edu.au', 'password');

    postRequest(SERVER_URL + '/auth/logout/v2', {}, user.token);

    const result = getRequest(SERVER_URL + '/user/profile/v3', { uId: user.authUserId }, loggedInSession.token);

    const expectedResult = {
      user: {
        uId: user.authUserId,
        email: 'hang.pham1@student.unsw.edu.au',
        nameFirst: 'Hang',
        nameLast: 'Pham',
        handleStr: 'hangpham',
      }
    };
    expect(result).toMatchObject(expectedResult);
  });
});

describe('Testing authLogoutV1 error handling', () => {
  test.each([
    { token: 'InvalidToken', desc: 'Testing invalid token' },
  ])('$desc', ({ token }) => {
    const user = authRegisterV1('hang.pham1@student.unsw.edu.au', 'password', 'Hang', 'Pham');

    const result = postRequest(SERVER_URL + '/auth/logout/v2', {
    }, user.token + token);

    expect(result.statusCode).toBe(INVALID_TOKEN);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
