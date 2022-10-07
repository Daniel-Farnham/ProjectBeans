import { channelJoinV1, channelDetailsV1 } from './channel';
import { authRegisterV1  } from './auth'
import { channelsCreateV1 } from './channels'
import { clearV1 } from './other'

describe('Testing positive cases for channelJoinV1', () => {
  beforeEach(() => {
      clearV1(); 
  })
  
  test('Successful return of empty object when joining public channel', () => {
    const user1 = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const user2 = authRegisterV1('hang.pham@student.unsw.edu.au', 'AVeryPoorPassword', 'Hang', 'Pham');
    const channel = channelsCreateV1(user1.authUserID, 'ChannelBoost', true);
    const returnedChannelObject = channelJoinV1(user2.authUserId, channel.channelId);
    
    expect(returnedChannelObject).toMatchObject({}); 
  });

  test('Successful return of empty object when joining private channel as global owner', () => {
    const user1 = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const user2 = authRegisterV1('hang.pham@student.unsw.edu.au', 'AVeryPoorPassword', 'Hang', 'Pham');
    const channel = channelsCreateV1(user2.authUserID, 'ChannelBoost', false);
    const returnedChannelObject = channelJoinV1(user1.authUserId, channel.channelId);
    
    expect(returnedChannelObject).toMatchObject({}); 
  });
  test('User is added as a new member of allMembers array', () => {
    const user1 = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const user2 = authRegisterV1('hang.pham@student.unsw.edu.au', 'AVeryPoorPassword', 'Hang', 'Pham');
    const channel = channelsCreateV1(user1.authUserID, 'ChannelBoost', true);
    channelJoinV1(user2.authUserId, channel.channelId);
    const channelObj = channelDetailsV1(user1.authUserId, channel.channelId);
    console.log(channelObj);
    const expectedChannelObj = {
      name: "ChannelBoost",
      isPublic: true,
      ownerMembers: [
        {
          uId: user1.authUserId,
          email: 'daniel.farnham@student.unsw.edu.au',
          nameFirst: 'Daniel',
          nameLast: 'Farnham',
          handleStr: 'danielfarnham',
        },
      ],
      allMembers: [
        {
          uId: user1.authUserId,
          email: 'daniel.farnham@student.unsw.edu.au',
          nameFirst: 'Daniel',
          nameLast: 'Farnham',
          handleStr: 'danielfarnham',
        },
        {
          uId: user2.authUserId,
          email: 'hang.pham@student.unsw.edu.au',
          nameFirst: 'Hang',
          nameLast: 'Pham',
          handleStr: 'hangpham',
        },
      ],
    };
    expect(channelObj).toMatchObject(expectedChannelObj); 
  });

});

describe('Testing negative cases for channelJoinV1', () => {
  beforeEach(() => {
    clearV1(); 
  })

  test('Testing invalid authUserId', () => {
    const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const channel = channelsCreateV1(userId.authUserID, 'ChannelBoost', true);
    const returnedChannelObject = channelJoinV1(userId.authUserId + 1, channel.channelId);
    
    expect(returnedChannelObject).toMatchObject({ error: expect.any(String) }); 
  });

  test('Testing invalid channelId', () => { 
    const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const channel = channelsCreateV1(userId.authUserId, 'ChannelBoost', true);
    const returnedChannelObject = channelJoinV1(userId.authUserId, channel.channelId + 1)  ;
    
    expect(returnedChannelObject).toMatchObject({ error: expect.any(String) }); 
  });

  test('Testing if the user is already a member of the channel', () => {
    const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const channel = channelsCreateV1(userId.authUserId, 'ChannelBoost', true);
    const returnedChannelObject = channelJoinV1(userId.authUserId, channel.channelId);

    expect(returnedChannelObject).toMatchObject({ error: expect.any(String) });  //expecting channelJoin to return error if the user is already a member. 
  });
  
  test('Testing if user is trying to join private channel assuming they are not global owner', () => {
    const user1 = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const user2 = authRegisterV1('hang.pham@student.unsw.edu.au', 'AVeryPoorPassword', 'Hang', 'Pham');

    const channel = channelsCreateV1(user1.authUserId, 'ChannelBoost', false); 
    const returnedChannelObject = channelJoinV1(user2.authUserId, channel.channelId);
    
    expect(returnedChannelObject).toMatchObject({ error: expect.any(String)});  
  });
}); 

