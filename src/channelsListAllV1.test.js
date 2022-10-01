import { clearV1 } from './other';
import { channelsCreateV1, channelsListAllV1 } from './channels';
import { authRegisterV1 } from './auth';

// Working cases
test('Testing successful return of all channels', () => {
  const userId = authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
  const channelId1 = channelsCreateV1(userId, "General", true);
  const channelId2 = channelsCreateV1(userId, "Boost", false);
  const channelId3 = channelsCreateV1(userId, "Random", true);
  const expectedChannels = [
    {
      "channelId": channelId1,
      "name": "General",
    },
    {
      "channelId": channelId2,
      "name": "Boost",
    },
    {
      "channelId": channelId3,
      "name": "Random",
    },
  ];
  
  const resultChannels = channelsListAllV1(userId);
  expect(resultChannels).toMatchObject(expectedChannels);
});

test('Testing invalid authUserId', () => {
  const userId = authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
  const channelId1 = channelsCreateV1(userId, "General", true);
  
  const resultChannels = channelsListAllV1(userId + 1);
  expect(resultChannels).toMatchObject(expectedChannels);
});
