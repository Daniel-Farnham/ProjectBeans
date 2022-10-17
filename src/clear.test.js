import { clearV1 } from './other.js';
import { authLoginV1, authRegisterV1 } from './auth.js';

describe('ClearV1 test cases', () => {
  test('Testing clearV1 returns {}', () => {
    const result = clearV1();
    expect(result).toMatchObject({});
  });

  test('Testing logging in as a user should fail after running clearV1', () => {
    authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
    clearV1();
    const result = authLoginV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!');
    expect(result).toStrictEqual(
      {
        error: expect.any(String),
      }
    );
  });

  test('Testing re-creating the same user after running clearV1', () => {
    authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
    clearV1();
    const result = authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
    expect(result).toStrictEqual(
      {
        authUserId: expect.any(Number),
      }
    );
  });
});
