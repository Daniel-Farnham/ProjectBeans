import { authRegisterV1 } from './auth';
import { userProfileV1 } from './users';
import { clearV1 } from './other';

beforeEach(() => {
  clearV1();
});

describe('Testing basic authRegisterV1 functionality', () => {
  test('Test successful registration of new account', () => {
    const newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    expect(typeof newId.authUserId).toBe('number');
  });

  test('Test uniqueness of newly registered account Ids', () => {
    const firstId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const secondId = authRegisterV1('hayden.smith@unsw.edu.au', '123456', 'Hayden', 'Smith');
    expect(firstId.authUserId).not.toBe(secondId.authUserId);
  });
  
  test('Test user info is registered correctly', () => {
    const newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Johnathon', 'Augustus-Jones');

    const resultUser = userProfileV1(newId, newId);
    const expectedUser = {
      uId: newId,
      nameFirst: 'Johnathon',
      nameLast: 'Augustus-Jones',
      email: 'z5361935@ad.unsw.edu.au',
      handleStr: 'johnathonaugustusjon',
    };

    expect(resultUser).toMatchObject(expectedUser);
  });
  
  test('Test user info is registered correctly when user handle is already taken', () => {
    const firstId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Johnathon', 'Augustus-Jones');
    const secondId = authRegisterV1('hayden.smith@unsw.edu.au', 'password', 'Johnathon', 'Augustus-Jones');

    const resultUser = userProfileV1(secondId, secondId);
    const expectedUser = {
      uId: newId,
      nameFirst: 'Johnathon',
      nameLast: 'Augustus-Jones',
      email: 'hayden.smith@unsw.edu.au',
      handleStr: 'johnathonaugustusjon0',
    };

    expect(resultUser).toMatchObject(expectedUser);
  });
});

describe('Testing authRegisterV1 error handling', () => {
  test.each([
    { email: 'notAnEmail', password: 'password', nameFirst: 'Curtis', nameLast: 'Scully', desc: 'Testing registration with invalid email' },
    { email: 'z5361935@ad.unsw.edu.au', password: 'five', nameFirst: 'Curtis', nameLast: 'Scully', desc: 'Testing registration with password too short' },
    { email: 'z5361935@ad.unsw.edu.au', password: 'password', nameFirst: '', nameLast: 'Scully', desc: 'Testing registration with first name too short' },
    { email: 'z5361935@ad.unsw.edu.au', password: 'password', nameFirst: 'ThisIsGoingToBeAVeryLongFirstNameWhichIsNotAllowedSinceItIsOverTheLimit', nameLast: 'Scully', desc: 'Testing registration with first name too long' },
    { email: 'z5361935@ad.unsw.edu.au', password: 'password', nameFirst: 'Curtis', nameLast: '', desc: 'Testing registration with last name too short' },
    { email: 'z5361935@ad.unsw.edu.au', password: 'password', nameFirst: 'Curtis', nameLast: 'ThisIsGoingToBeAVeryLongLastNameWhichIsNotAllowedSinceItIsOverTheLimit', desc: 'Testing registration with last name too long' },
  ])('$desc', ({ email, password, nameFirst, nameLast }) => {
    const newId = authRegisterV1(email, password, nameFirst, nameLast);
    expect(newId).toMatchObject({ error: 'error' });
  });
  
  test('Testing registration with in use email', () => {
    const firstId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const secondId = authRegisterV1('z5361935@ad.unsw.edu.au', '123456', 'Mike', 'Wazowski')
    expect(secondId).toMatchObject({ error: 'error' });
  });
});