import { channelDetailsV1 } from './channel';
import { channelsCreateV1 } from './channels'
import { authRegisterV1 } from './auth'
import { clearV1 } from './other'


describe('Testing channelDetails', () => {

  beforeEach(() => {
    clearV1();
  }); 

  test('Successfully view channel details', () => {
    const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const channel = channelsCreateV1(userId, 'ChannelBoost', true); 
    const ReturnedChannelObj = channelDetailsV1(userId, channel.channelId); //Should provide a valid channelId
    
    const ExpectedChannelObj = { 
      name: 'ChannelBoost', 
      isPublic: true,
      ownerMembers: 
    [
      {
        uId: userId.authUserId,
        email: 'daniel.farnham@student.unsw.edu.au@gmail.com',
        nameFirst: 'Daniel',
        nameLast: 'Farnham',
        handleStr: 'danialfarnham',
      }
    ],
    allMembers: [
      {
        uId: userId.authUserId,
        email: 'daniel.farnham@student.unsw.edu.au@gmail.com',
        nameFirst: 'Daniel',
        nameLast: 'Farnham',
        handleStr: 'danialfarnham',
      }
    ], 
    }; 

    expect(ReturnedChannelObj).toMatchObject(ExpectedChannelObj);

    });

    test('Testing invalid authUserId', () => {
      const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham')
      const channel = channelsCreateV1(userId, 'ChannelBoost', true);
      const ReturnedChannelObject = channelDetailsV1(userId + 1, channel.channelId)
      
      expect(ReturnedChannelObject).toMatchObject({ error: expect.any(String) }); 
    });

    test('Testing invalid channelId', () => { 
      const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham')
      const channel = channelsCreateV1(userId, 'ChannelBoost', true);
      const ReturnedChannelObject = channelDetailsV1(userId, channel.channelId + 1)  

      expect(ReturnedChannelObject).toMatchObject({ error: expect.any(String) }); 
    });

    test('Authorised user is not a member of the channel', () => {
      const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham')
      const channel = channelsCreateV1(userId, 'ChannelBoost', true);
      const NonMemberChannel = channelsCreateV1(userId, 'ChannelBoostWithoutDaniel', true); 
     
      expect(NonMemberChannel).toMatchObject({ error: expect.any(String) }); 

    });

});
