import { getData, setData } from './dataStore.js'
import { userIdExists, channelIdExists } from './other.js'

const GLOBAL_OWNER = 1; 

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

  const data = getData();
  const findChannel = data.channels.find(o => o.channelId === channelId);
  
  //Check if userId or channelId are invalid
  if (!(userIdExists(authUserId)) || !(channelIdExists(channelId)) ) {
    return { error: 'userId or channelId is invalid' };
  }

  //Check if user is already member of channel
  for (const channelMembers of findChannel.channelMembers) {
    if (channelMembers.uId === authUserId) {
      return { error: 'User is already a member of the public channel' };
    }
  }

  //If member is not Global Owner and channel is private. 
  const findUser = data.users.find(o => o.uId === authUserId)
  
  if (!(findChannel.isPublic) && findUser.permissionId !== GLOBAL_OWNER) {
    return { error: 'Channel is private and user is not global owner or a member of the channel'}
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
  

function channelInviteV1(authUserId, channelId, uId) {
    return {};
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


export { channelJoinV1, channelDetailsV1 }

