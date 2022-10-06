import { clearV1 } from './other';
import { channelsCreateV1, channelsListV1 } from './channels';
import { authRegisterV1 } from './auth';

describe('Testing channelsListV1', () => {
  test('Test successful return of users channels', () => {
    const userId = authRegisterV1('edwin.ngo@student.unsw.edu.au', 'ANicePassword', 'Edwin', 'Ngo');
    const channelId1 = channelsCreateV1(userId.authUserId, "General" , true);
    const channelId2 = channelsCreateV1(userId.authUserId, "Boost", false);
    const channelId3 = channelsCreateV1(userId.authUserId + 1, "Aero", false);
    const expectedChannels = [
      {
        channelId: channelId1,
        name: "General",
      },
      {
        channelId: channelId2,
        name: "Boost",
      },
    ];

    const resultChannels = channelsListV1(userId.authUserId);

    expect(resultChannels).toMatchObject(expectedChannels);
  });

  test('Testing invalid authUserId', () => {
    const userId = authRegisterV1('edwin.ngo@student.unsw.edu.au', 'ANicePassword', 'Edwin', 'Ngo');
    const channelId1 = channelsCreateV1(userId.authUserId, "General", true);
    const resultChannels = channelsListV1(userId.authUserId + 1);

    expect(resultChannels).toStrictEqual({error: expect.any(String)});
  });
});