import { getRequest, postRequest, deleteRequest, FORBIDDEN, BAD_REQUEST } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic functionality of standupActiveV1', () => {
  test('Testing standupActiveV1 return the correct info for an active standup', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const channelId = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, regId.token);

    const standup = postRequest(SERVER_URL + '/standup/start/v1', {
      channelId: channelId.channelId,
      length: 120
    }, regId.token);

    const standupActive = getRequest(SERVER_URL + '/standup/active/v1', {
      channelId: channelId.channelId
    }, regId.token);

    expect(standupActive).toStrictEqual({ isActive: true, timeFinish: standup.timeFinish });
  });

  test('Testing standupActiveV1 return the correct info for an inactive standup', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const channelId = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, regId.token);

    const standupActive = getRequest(SERVER_URL + '/standup/active/v1', {
      channelId: channelId.channelId
    }, regId.token);

    expect(standupActive).toStrictEqual({ isActive: false, timeFinish: null });
  });
});

describe('Testing standupActiveV1 error handling', () => {
  test('Testing standupActiveV1 throws an error when channelId is invalid', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const standupActive = getRequest(SERVER_URL + '/standup/active/v1', {
      channelId: 1
    }, regId.token);

    expect(standupActive.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(standupActive.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing standupActiveV1 throws an error when user isn\'t member of channel', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const secondId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channelId = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, regId.token);

    const standupActive = getRequest(SERVER_URL + '/standup/active/v1', {
      channelId: channelId.channelId
    }, secondId.token);

    expect(standupActive.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(standupActive.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing standupActiveV1 throws an error when token is invalid', () => {
    const regId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully'
    });

    const channelId = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'General',
      isPublic: true
    }, regId.token);

    const standupActive = getRequest(SERVER_URL + '/standup/active/v1', {
      channelId: channelId.channelId
    }, regId.token + 'NotAToken');

    expect(standupActive.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(standupActive.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
