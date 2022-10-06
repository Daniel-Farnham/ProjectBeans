import { channelsCreateV1 } from './channels';
import { authRegisterV1 } from './auth';
import { clearV1 } from './other';

beforeEach (() => {
  clearV1();
});

describe('Testing channelsCreateV1', () => {
  test('Test successful channel creation', () => {
    const userId = authRegisterV1('edwin.ngo@student.unsw.edu.au', 'ANicePassword', 'Edwin', 'Ngo');
    const newchannelId = channelsCreateV1(userId.authUserId, "General", true);
    expect(newchannelId).toStrictEqual({channelId:expect.any(Number)});
  });

  test('Testing Channel Uniqueness', () => {
    const userId = authRegisterV1('edwin.ngo@student.unsw.edu.au', 'ANicePassword', 'Edwin', 'Ngo');
    const channelId1 = channelsCreateV1(userId.authUserId, "General", true);
    const channelId2 = channelsCreateV1(userId.authUserId, "Boost", false);
    expect(channelId1.channelId).not.toBe(channelId2.channelId);
  });

  test('Testing invalid authUserId', () => {
    const userId = authRegisterV1('edwin.ngo@student.unsw.edu.au', 'ANicePassword', 'Edwin', 'Ngo');
    const channel = channelsCreateV1(userId.authUserId, "General", true);
    const returnedChannelId = channelsCreateV1(userId.authUserId + 1, channel.channelId);
    expect(returnedChannelId).toStrictEqual({error: expect.any(String)});
  });

  describe('Test if name length is valid', () => {
    test.each([
      {
        userId: '1', 
        channelname: '', 
        isPublic: 'true', 
        desc: 'Testing if name is less than 1 character' 
      },
      {
        userId: '1', 
        channelname: 'ThisNameIsNotAllowedBecauseItIsTooLong', 
        isPublic: 'true', 
        desc: 'Testing if name is over 20 characters'
      },
    ])('$desc', ({userId, channelname, isPublic}) => {
      const newchannelid = channelsCreateV1(userId.authUserId, channelname, isPublic);
      expect(newchannelid).toMatchObject({error: expect.any(String)});
    });
  });
});