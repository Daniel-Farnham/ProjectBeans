import { getRequest, postRequest, deleteRequest } from './other'; 
import { port, url } from './config.json'; 

const SERVER_URL = `${url}:${port}`


describe('Testing channelDetails', () => {
  beforeEach(() => {
    deleteRequest(SERVER_URL + '/clear/v1', {});
  });


  
  test('Successfully view channel details', () => {

    // post request sending data to authRegisterV1
    // const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    //post request sending data to channelsCreateV1 
    //const channel = channelsCreateV1(userId.authUserId, 'ChannelBoost', true);

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token, 
      name: 'ChannelBoost',
      IsPublic: true, 
    });
    
    // get request to receve data back from channelDetailsV1 
    //const ReturnedChannelObj = channelDetailsV1(userId.token, channel.channelId); // Should provide a valid channelId

    const ReturnedChannelObj = getRequest(SERVER_URL + '/channel/details/v2', {
      token: userId.token,
      channelId: channel.channelId
    });

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
    // checking that we have a match 
    expect(ReturnedChannelObj).toMatchObject(ExpectedChannelObj);
  });

  test('Testing invalid authUserId', () => {
    
    // post request sending data to authRegisterV1
    // const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    // post request sending data to channelsCreateV1 
    // const channel = channelsCreateV1(userId.authUserId, 'ChannelBoost', true);
    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token, 
      name: 'ChannelBoost',
      IsPublic: true, 
    })

    
    // const ReturnedChannelObject = channelDetailsV1(userId.token + 1, channel.channelId);
    const ReturnedChannelObj = getRequest(SERVER_URL + '/channel/details/v2', {
      token: userId.token,
      channelId: channel.channelId
    });

    expect(ReturnedChannelObj).toMatchObject({ error: expect.any(String) });
  });

  test('Testing invalid channelId', () => {

    // post request sending data to authRegisterV1
    // const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    // post request sending data to channelsCreateV1 
    // const channel = channelsCreateV1(userId.authUserId, 'ChannelBoost', true);
    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token, 
      name: 'ChannelBoost',
      IsPublic: true, 
    })
    
    // const ReturnedChannelObject = channelDetailsV1(userId.token, channel.channelId + 1);
    const ReturnedChannelObj = getRequest(SERVER_URL + '/channel/details/v2', {
      token: userId.token,
      channelId: channel.channelId
    });
    expect(ReturnedChannelObj).toMatchObject({ error: expect.any(String) });
  });

  test('Authorised user is not a member of the channel', () => {

    // post request sending data to authRegisterV1
    // const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    // post request sending data to channelsCreateV1 
    // const channel = channelsCreateV1(userId.authUserId, 'ChannelBoost', true);
    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token, 
      name: 'ChannelBoost',
      IsPublic: true, 
    });

    // const NonMemberChannel = channelsCreateV1(userId.authUserId, 'ChannelBoostWithoutDaniel', true);
    const NonMemberChannel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token, 
      name: 'ChannelBoostWithoutDaniel',
      IsPublic: true, 
    });
    
    //expect(NonMemberChannel).toMatchObject({ error: expect.any(String) });
    //const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    //channelsCreateV1(userId.authUserId, 'ChannelBoost', true);
    
    expect(NonMemberChannel).toMatchObject({ error: expect.any(String) });
  });
});
