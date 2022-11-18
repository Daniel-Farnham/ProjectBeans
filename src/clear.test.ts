import { postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const INVALID_PARAM = 400;
describe('ClearV1 test cases', () => {
  test('Testing clearV1 returns {}', () => {
    const result = deleteRequest(SERVER_URL + '/clear/v1', {});
    expect(result).toMatchObject({});
  });

  test('Testing logging in as a user should fail after running clearV1', () => {
    postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });

    deleteRequest(SERVER_URL + '/clear/v1', {});
    const result = postRequest(SERVER_URL + '/auth/login/v3', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
    });
    expect(result.statusCode).toBe(INVALID_PARAM);
  });

  test('Testing re-creating the same user after running clearV1', () => {
    postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });
    deleteRequest(SERVER_URL + '/clear/v1', {});
    const result = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });
    expect(result).toStrictEqual(
      {
        authUserId: expect.any(Number),
        token: expect.any(String),
      }
    );
  });
});
