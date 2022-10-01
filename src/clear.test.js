import { clearV1 } from './other';
import { authLoginV1, authRegisterv1 } from './auth';


test('Testing clearV1 returns {}', () => {
  const result = clearV1();
  expect(result).toMatchObject({});
});

test('Testing logging in as a user should fail after running clearV1', () => {
  authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
  clearV1();
  const result = authLoginV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!');
  expect(result).toMatchObject({error: 'error'});
});

test('Testing re-creating the same user after running clearV1', () => {
  authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
  clearV1();
  const result = authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
  expect(typeof result).toBe('number');
});