import { getRequest, postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const FORBIDDEN = 400;
const BAD_REQUEST = 403;

describe('Testing channelDetails', () => {
  beforeEach(() => {
    deleteRequest(SERVER_URL + '/clear/v1', {});
  });

  test('Successfully view channel details', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    const ReturnedChannelObj = getRequest(SERVER_URL + '/channel/details/v3', {
      channelId: channel.channelId
    }, userId.token);

    const ExpectedChannelObj = {
      name: 'ChannelBoost',
      isPublic: true,
      ownerMembers:
    [
      {
        uId: userId.authUserId,
        email: 'daniel.farnham@student.unsw.edu.au',
        nameFirst: 'Daniel',
        nameLast: 'Farnham',
        handleStr: 'danielfarnham',
      }
    ],
      allMembers: [
        {
          uId: userId.authUserId,
          email: 'daniel.farnham@student.unsw.edu.au',
          nameFirst: 'Daniel',
          nameLast: 'Farnham',
          handleStr: 'danielfarnham',
        }
      ],
    };

    expect(ReturnedChannelObj).toMatchObject(ExpectedChannelObj);
  });

  test('Testing invalid authUserId', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    const ReturnedChannelObj = getRequest(SERVER_URL + '/channel/details/v3', {
      channelId: channel.channelId
    }, userId.token + 1);

    expect(ReturnedChannelObj.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(ReturnedChannelObj.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Testing invalid channelId', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, userId.token);

    const ReturnedChannelObj = getRequest(SERVER_URL + '/channel/details/v3', {
      channelId: channel.channelId + 1
    }, userId.token);

    expect(ReturnedChannelObj.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(ReturnedChannelObj.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Authorised user is not a member of the channel', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const user2 = postRequest(SERVER_URL + '/auth/register/v3', {
      email: 'fake.mcfake@student.unsw.edu.au',
      password: 'AnEvenWorsePassword',
      nameFirst: 'Fake',
      nameLast: 'McFake',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v3', {
      name: 'ChannelBoost',
      isPublic: true,
    }, user1.token);

    const ReturnedChannelObj = getRequest(SERVER_URL + '/channel/details/v3', {
      channelId: channel.channelId
    }, user2.token);

    expect(ReturnedChannelObj.statusCode).toBe(BAD_REQUEST);
    const bodyObj = JSON.parse(ReturnedChannelObj.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
