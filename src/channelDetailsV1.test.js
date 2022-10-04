import { channelDetailsV1 } from './channel';
import { channelsCreateV1 } from './channels'
import { authRegisterV1 } from './auth'
import { clear } from './other'


/* describe('Testing channelDetails', () => {
  
  beforeEach(() => {
    clear();
  }); */


  test('Successfully view channel details', () => {
    const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham')
    const channel = channelsCreateV1(userId, 'ChannelBoost', true); 
    const ReturnedChannelObj = channelDetailsV1(userId, channel.channelId);
    const ExpectedChannelObj = { name: 'Hayden', ownerMembers: 
    [
      {
        uId: 1,
        email: 'example@gmail.com',
        nameFirst: 'Hayden',
        nameLast: 'Jacobs',
        handleStr: 'haydenjacobs',
      }
    ],
    allMembers: [
      {
        uId: 1,
        email: 'example@gmail.com',
        nameFirst: 'Hayden',
        nameLast: 'Jacobs',
        handleStr: 'haydenjacobs',
      }
    ], 
    }; 

    expect(ReturnedChannelObj).toMatchObject(ExpectedChannelObj);

    });


    test('Testing invalid authUserId', () => {
      const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham')
      const channel = channelsCreateV1(userId, 'ChannelBoost', true);
      const ReturnedChannelObject = channelDetailsV1(userId + 1, channel.channelId)
      
      expect(ReturnedChannelObject).toMatchObject({ error: 'error' }); 
    });

    test('Testing invalid channelId', () => { 
      const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham')
      const channel = channelsCreateV1(userId, 'ChannelBoost', true);
      const ReturnedChannelObject = channelDetailsV1(userId, channel.channelId + 1)  

      expect(ReturnedChannelObject).toMatchObject({ error: 'error' }); 
    });

    test('Authorised user is not a member of the channel', () => {
      const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham')
      const channel = channelsCreateV1(userId, 'ChannelBoost', true);
      const NonMemberChannel = channelsCreateV1(userId, 'ChannelBoostWithoutDaniel', true); 
      
      expect(channel).not.toMatchObject(NonMemberChannel); 

      /*  this is an alternative test, not sure which is better. 
      expect(NonMemberChannel).toMatchObject({ error: 'error' }); 

      */ 

    });

// });

//Assumed that the isPublic question is boolean. 