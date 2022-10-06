import { userIdExists, channelIdExists } from './other.js';
import { getData, setData } from './dataStore.js';
import { userProfileV1 } from './users.js';

const GLOBAL_OWNER = 1; 

function channelDetailsV1(authUserId, channelId) {

  const data = getData(); 
  const findChannel = data.channels.find(o => o.channelId === channelId);
  
  //Check if userId and channelId is invalid. 
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

// Allows an authorised user to join a channel 
// Parameters authUserId, channelId
// Return: empty object or error message

function channelJoinV1(authUserId, channelId) {

  const data = getData();
  const findChannel = data.channels.find(o => o.channelId === channelId);
  
  //Check if userId or channelId are invalid
  if (!(userIdExists(authUserId)) || !(channelIdExists(channelId)) ) {
    return { error: 'userId or channelId is invalid' };
  }

  const findUser = data.users.find(o => o.uId === authUserId)
  
  //Check if member is not Global Owner and the channel is private. 
  if (!(findChannel.isPublic) && findUser.permissionId !== GLOBAL_OWNER) {
    return { error: 'Channel is private and user is not global owner or a member of the channel'}
  }

  //Check if user is already member of channel
  for (const allMembers of findChannel.allMembers) {
    if (allMembers.uId === authUserId) {
      return { error: 'User is already a member of the public channel' };
    }
  }

  const userObj = {
    uId: findUser.uId, 
    email: findUser.email,
    nameFirst: findUser.nameFirst,
    nameLast: findUser.nameLast,
    handleStr: findUser.handleStr,
  };

  //Loop through channel and add new member
  for (let channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.allMembers.push(userObj);
    }
  } 

  setData(data);
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


export { channelJoinV1, channelInviteV1, channelDetailsV1 };

