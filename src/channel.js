import { getData, setData } from './dataStore.js'
import { userIdExists, channelIdExists } from './other.js'


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
    return { error: 'userId / channelId is invalid' };
  }


  //check if channel Id is private 
  else if (findChannel.isPublic === false) {
    //check if user is not a global owner 
    for (const ownerMembers of findChannel.ownerMembers) {
      if (ownerMembers.uId === authUserId) {
        return { error: 'User is already the owner of private channel'};
      }
      //check if user is already member
    for (const channelMembers of findChannel.channelMembers) {
      if (channelMembers.uId === authUserId) {
        return { error: 'User is already a member of the private channel'};
        }
      }
    }
  }

  //Check if the user is a member of the channel. 
  else {
    for (const channelMembers of findChannel.channelMembers) {
      if (channelMembers.uId === authUserId) {
        return { error: 'User is already a member of the public channel'};
      }
    }
  }

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

