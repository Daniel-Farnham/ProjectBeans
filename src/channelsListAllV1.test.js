import { clearV1 } from './other';
import { channelsCreateV1, channelsListAllV1 } from './channels';
import { authRegisterV1 } from './auth';

// Working cases
test('Testing successful return of all channels', () => {
  const user = authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
  const channelId1 = channelsCreateV1(user.authUserId, "General", true);
  const channelId2 = channelsCreateV1(user.authUserId, "Boost", false);
  const channelId3 = channelsCreateV1(user.authUserId, "Random", true);
  const expectedChannels = [
    {
      channelId: channelId1.channelId,
      name: "General",
    },
    {
      channelId: channelId2.channelId,
      name: "Boost",
    },
    {
      channelId: channelId3.channelId,
      name: "Random",
    },
  ];
  
  const resultChannels = channelsListAllV1(user.authUserId);
  expect(resultChannels).toMatchObject(expectedChannels);
});

test('Testing invalid authUserId', () => {
  const user = authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
  const channelId1 = channelsCreateV1(user.authUserId, "General", true);
  
  const resultChannels = channelsListAllV1(user.authUserId + 1);
  expect(resultChannels).toStrictEqual(
    {
      error: expect.any(String),
    }
  );
});
