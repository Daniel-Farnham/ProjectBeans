import { userIdExists, channelIdExists } from './other.js';
import { getData, setData } from './dataStore.js';
import { userProfileV1 } from './users';

function channelDetailsV1(authUserId, channelId) {
    return {
        name: 'Hayden',
        ownerMembers: [
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
}

function channelJoinV1(authUserId, channelId) {
    return {};
}
// Invites a user to a channel with an authorised user
// Paramaters: authUserId, channelId, uId
// Return: empty object or error message
function channelInviteV1(authUserId, channelId, uId) {
  
  // If authUserId, uId and channelId are valid Ids
  if (userIdExists(authUserId) && userIdExists(uId) 
  && channelIdExists(channelId)) {
    
    let authUserExists = false;
    
    const allMembers = data.channels.find(o => o.channelId === 1).allMembers;
    for (const member of allMembers) {
      // If authUserId exists in member list, then set authUserExists to true
      if (member.uId === authUserId) { 
        authUserExists = true;
      }
      
      // If user already exists as member, return error
      if (member.uId === uId) {
        return { error: "error"};
      } 
    }
    // Invite new member to channel if authUserId is member of channel
    if (authUserExists) {
      const newMember = userProfileV1(authUserId, uId);
      let data = getData();
      for (let channel of data.channels) {
        if (channel.channelId === channelId) {
          channel.allMembers.push(newMember);
          setData(data);
        }
      }
      return {};
    } else {
      return { error: "error"};
    }
  } else {
    return { error : "error" };
  }
}

function channelMessagesV1(authUserId, channelId, start) {
    return {
        messages: [
          {
            messageId: 1,
            uId: 1,
            message: 'Hello world',
            timeSent: 1582426789,
          }
        ],
        start: 0,
        end: 50,
      };
}

export { channelInviteV1 };