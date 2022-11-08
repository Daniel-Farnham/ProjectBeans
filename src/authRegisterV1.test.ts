import { getRequest, postRequest, deleteRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic authRegisterV1 functionality', () => {
  test('Test successful registration of new account', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    expect(newId).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
  });

  test('Test uniqueness of newly registered account tokens and Ids', () => {
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

    expect(firstId.token).not.toBe(secondId.token);
    expect(firstId.authUserId).not.toBe(secondId.authUserId);
  });

  test('Test user info is registered correctly', () => {
    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Johnathon',
      nameLast: 'Augustus-Jones'
    });

    const resultUser = getRequest(SERVER_URL + '/user/profile/v2', {
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
    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast
    });

    expect(newId).toMatchObject({ error: expect.any(String) });
  });

  test('Testing registration with in use email', () => {
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

    expect(newId).toMatchObject({ error: expect.any(String) });
  });
});
