import { userIdExists, channelIdExists } from './other.js';
import { getData, setData } from './dataStore.js';
import { userProfileV1 } from './users.js';

function channelDetailsV1(authUserId, channelId) {

  const data = getData(); 
  const findChannel = data.channels.find(o => o.channelId === channelId);
  //Check if userId or channelId is invalid. 
  if (userIdExists(authUserId) && channelIdExists(channelId)) {
    //Check if the user is the member of the channel. Return channel details if true, return error if false. 
    for (const allMembers of findChannel.allMembers) {
      // Checking if the user is a member of the channel. 
      if (allMembers.uId === authUserId) { 
        return {
          name: findChannel.name,
          isPublic: findChannel.isPublic,
          ownerMembers: findChannel.ownerMembers,
          allMembers: findChannel.allMembers
        }
      }
    }    
    // Case where authUserId is not a member of the channel
    return { error: 'authUserId is not a member of the channel' }
  } else {
    return { error: 'userId or channelId is invalid' }
  }
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
    const data = getData(); 
    
    const allMembers = data.channels.find(o => o.channelId === channelId).allMembers;
    for (const member of allMembers) {
      // If authUserId exists in member list, then set authUserExists to true
      if (member.uId === authUserId) { 
        authUserExists = true;
      }
      
      // If user already exists as member, return error
      if (member.uId === uId) {
        return { error: "User to invite already a member of channel"};
      } 
    }
    // Invite new member to channel if authUserId is member of channel
    if (authUserExists) {
      const newMember = userProfileV1(authUserId, uId);
      let data = getData();
      // Loop through channel and add new member
      for (let channel of data.channels) {
        if (channel.channelId === channelId) {
          channel.allMembers.push(newMember);
          setData(data);
          return {};
        }
      } 
    } else {
      return { error: "authUserId is not a member of channel"};
    }
  } else {
    return { error : "authUserId/uId/channelId not valid" };
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

export { channelInviteV1, channelDetailsV1 };