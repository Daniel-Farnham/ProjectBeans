import { getRequest, postRequest, deleteRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// const OK = 200;

beforeEach(() => {
  // clearV1();
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic authRegisterV1 functionality', () => {
  test('Test successful registration of new account', () => {
    // const newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    // expect(newId).toStrictEqual({ authUserId: expect.any(Number) });

    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    // expect(newId.statusCode).toBe(OK);
    expect(newId).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
  });

  test('Test uniqueness of newly registered account tokens and Ids', () => {
    // const firstId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    // const secondId = authRegisterV1('hayden.smith@unsw.edu.au', '123456', 'Hayden', 'Smith');
    // expect(firstId.authUserId).not.toBe(secondId.authUserId);

    const firstId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const secondId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hayden.smith@unsw.edu.au',
      password: '123456',
      nameFirst: 'Hayden',
      nameLast: 'Smith'
    });

    // expect(firstId.statusCode).toBe(OK);
    expect(firstId.token).not.toBe(secondId.token);
    expect(firstId.authUserId).not.toBe(secondId.authUserId);
  });

  test('Test user info is registered correctly', () => {
    // const newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Johnathon', 'Augustus-Jones');
    // const resultUser = userProfileV1(newId.authUserId, newId.authUserId);

    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Johnathon',
      nameLast: 'Augustus-Jones'
    });

    const resultUser = getRequest(SERVER_URL + '/user/profile/v2', {
      token: newId.token,
      uId: newId.authUserId
    });

    const expectedUser = {
      user: {
        uId: newId.authUserId,
        nameFirst: 'Johnathon',
        nameLast: 'Augustus-Jones',
        email: 'z5361935@ad.unsw.edu.au',
        handleStr: 'johnathonaugustusjon',
      }
    };

    // expect(newId.statusCode).toBe(OK);
    expect(resultUser).toMatchObject(expectedUser);
  });

  test('Test user info is registered correctly when user handle is already taken', () => {
    // authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Johnathon', 'Augustus-Jones');
    // authRegisterV1('hayden.smith@unsw.edu.au', 'password', 'Johnathon', 'Augustus-Jones');
    // authRegisterV1('edwin.ngo@student.unsw.edu.au', 'password', 'Johnathon', 'Augustus-Jones');
    // const newId = authRegisterV1('hang.pham1@student.unsw.edu.au', 'password', 'Johnathon', 'Augustus-Jones');

    // const resultUser = userProfileV1(newId.authUserId, newId.authUserId);

    postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Johnathon',
      nameLast: 'Augustus-Jones'
    });

    postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hayden.smith@unsw.edu.au',
      password: 'password',
      nameFirst: 'Johnathon',
      nameLast: 'Augustus-Jones'
    });

    postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'edwin.ngo@student.unsw.edu.au',
      password: 'password',
      nameFirst: 'Johnathon',
      nameLast: 'Augustus-Jones'
    });

    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'password',
      nameFirst: 'Johnathon',
      nameLast: 'Augustus-Jones'
    });

    const resultUser = getRequest(SERVER_URL + '/user/profile/v2', {
      token: newId.token,
      uId: newId.authUserId
    });

    const expectedUser = {
      user: {
        uId: newId.authUserId,
        nameFirst: 'Johnathon',
        nameLast: 'Augustus-Jones',
        email: 'hang.pham1@student.unsw.edu.au',
        handleStr: 'johnathonaugustusjon2',
      }
    };

    // expect(newId.statusCode).toBe(OK);
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
    // const newId = authRegisterV1(email, password, nameFirst, nameLast);
    // expect(newId).toMatchObject({ error: expect.any(String) });

    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast
    });

    // expect(newId.statusCode).toBe(OK);
    expect(newId).toMatchObject({ error: expect.any(String) });
  });

  test('Testing registration with in use email', () => {
    // authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    // const newId = authRegisterV1('z5361935@ad.unsw.edu.au', '123456', 'Mike', 'Wazowski');
    // expect(newId).toMatchObject({ error: expect.any(String) });

    postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: '123456',
      nameFirst: 'Mike',
      nameLast: 'Wazowski'
    });

    // expect(newId.statusCode).toBe(OK);
    expect(newId).toMatchObject({ error: expect.any(String) });
  });
});
