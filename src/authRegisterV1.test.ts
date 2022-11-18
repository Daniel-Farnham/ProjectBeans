import { getRequest, deleteRequest } from './other';
import { authRegisterV1 } from './wrapperFunctions';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const INVALID_PARAM = 400;

function clearV1() {
  return deleteRequest(SERVER_URL + '/clear/v1', {});
}

beforeEach(() => {
  clearV1();
});

describe('Testing basic authRegisterV1 functionality', () => {
  test('Test successful registration of new account', () => {
    const newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');

    expect(newId).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
  });

  test('Test uniqueness of newly registered account tokens and Ids', () => {
    const firstId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const secondId = authRegisterV1('hayden.smith@unsw.edu.au', '123456', 'Hayden', 'Smith');

    expect(firstId.token).not.toBe(secondId.token);
    expect(firstId.authUserId).not.toBe(secondId.authUserId);
  });

  test('Test user info is registered correctly', () => {
    const newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Johnathon', 'Augustus-Jones');

    const resultUser = getRequest(SERVER_URL + '/user/profile/v3', {
      uId: newId.authUserId
    }, newId.token);

    const expectedUser = {
      user: {
        uId: newId.authUserId,
        nameFirst: 'Johnathon',
        nameLast: 'Augustus-Jones',
        email: 'z5361935@ad.unsw.edu.au',
        handleStr: 'johnathonaugustusjon',
      }
    };

    expect(resultUser).toMatchObject(expectedUser);
  });

  test('Test user info is registered correctly when user handle is already taken', () => {
    authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Johnathon', 'Augustus-Jones');
    authRegisterV1('hayden.smith@unsw.edu.au', 'password', 'Johnathon', 'Augustus-Jones');
    authRegisterV1('edwin.ngo@student.unsw.edu.au', 'password', 'Johnathon', 'Augustus-Jones');

    const newId = authRegisterV1('hang.pham1@student.unsw.edu.au', 'password', 'Johnathon', 'Augustus-Jones');

    const resultUser = getRequest(SERVER_URL + '/user/profile/v3', {
      uId: newId.authUserId
    }, newId.token);

    const expectedUser = {
      user: {
        uId: newId.authUserId,
        nameFirst: 'Johnathon',
        nameLast: 'Augustus-Jones',
        email: 'hang.pham1@student.unsw.edu.au',
        handleStr: 'johnathonaugustusjon2',
      }
    };

    expect(resultUser).toMatchObject(expectedUser);
  });
});

describe('Testing authRegisterV1 error handling', () => {
  test.each([
    {
      email: 'notAnEmail',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
      desc: 'Testing registration with invalid email'
    },
    {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'five',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
      desc: 'Testing registration with password too short'
    },
    {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: '',
      nameLast: 'Scully',
      desc: 'Testing registration with first name too short'
    },
    {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'ThisIsGoingToBeAVeryLongFirstNameWhichIsNotAllowedSinceItIsOverTheLimit',
      nameLast: 'Scully',
      desc: 'Testing registration with first name too long'
    },
    {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: '',
      desc: 'Testing registration with last name too short'
    },
    {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'ThisIsGoingToBeAVeryLongLastNameWhichIsNotAllowedSinceItIsOverTheLimit',
      desc: 'Testing registration with last name too long'
    },
  ])('$desc', ({ email, password, nameFirst, nameLast }) => {
    const newId = authRegisterV1(email, password, nameFirst, nameLast);

    expect(newId.statusCode).toBe(INVALID_PARAM);
    const bodyObj = JSON.parse(newId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing registration with in use email', () => {
    authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const newId = authRegisterV1('z5361935@ad.unsw.edu.au', '123456', 'Mike', 'Wazowski');

    expect(newId.statusCode).toBe(INVALID_PARAM);
    const bodyObj = JSON.parse(newId.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
