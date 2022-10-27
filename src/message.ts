import {
  channelIdExists, tokenExists, getMessageId,
  isMemberOfChannel, error, getUidFromToken, messageIdExists, isOwnerOfMessage, getMessageContainer
} from './other';
import { getData, setData } from './dataStore';

const MIN_MESSAGE_LEN = 1;
const MAX_MESSAGE_LEN = 1000;
const GLOBAL_OWNER = 1;

type messageId = { messageId: number }

interface Message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
}

/**
  * Creates a message and stores it in the messages array in a channel
  *
  * @param {string} token - token of authorised user
  * @param {number} channelId - id of channel to send message to
  * @param {string} message - message to send
  * ...
  *
  * @returns {messageId} returns an object containing the messageId
*/
export function messageSendV1 (token: string, channelId: number, message: string): messageId | error {
  const data = getData();
  const findChannel = data.channels.find(chan => chan.channelId === channelId);

  if (!(tokenExists(token))) {
    return { error: 'token is invalid.' };
  }
  if (!channelIdExists(channelId)) {
    return { error: 'channelId is invalid' };
  }

  // Check if length of the message is between 1-1000 characters long.
  // Create message if true, return error if false.
  if (message.length < MIN_MESSAGE_LEN || message.length > MAX_MESSAGE_LEN) {
    return { error: 'length of message is less than 1 or over 1000 characters' };
  }

  const uId = getUidFromToken(token);
  if (!isMemberOfChannel(findChannel, uId)) {
    return { error: 'user is not a member of the channel' };
  }

  // Create message
  const messageId = getMessageId();
  const timeSent = Math.floor((new Date()).getTime() / 1000);
  const messageObj = {
    messageId: messageId,
    uId: uId,
    message: message,
    timeSent: timeSent,
  };

  storeMessageInChannel(messageObj, channelId);

  return { messageId: messageId };
}

function storeMessageInChannel(message: Message, channelId: number) {
  const data = getData();

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.messages.push(message);
    }
  }
  setData(data);
}

/**
  * Changes a message in the messages array which exists in a channel
  *
  * @param {string} token - token of authorised user
  * @param {number} messageId - id of the message to be edited
  * @param {string} message - edited message 
  * ...
  *
  * @returns {messageId} returns an object containing the messageId
*/

export function messageEditV1 (token: string, messageId: number, message: Message): error | Record<string, never> {
  // need to add editMessageFromChannel(messageId: number): any {}
  const data = getData(); 

  if (!(tokenExists(token))) {
    return { error: 'token is invalid.' };
  }

  if (message.length > MAX_MESSAGE_LEN) {
    return { error: 'length of message is over 1000 characters.' };
  }

  const messageContainer = getMessageContainer(messageId);
  if (!messageContainer) {
    return { error: 'message does not exist in either channels or dms' }
  }
  
  const uId = getUidFromToken(token);

  // Case where message is in a channel
  if (messageContainer.type === 'channel') {
    const messageEditResult = messageFromChannelValid(messageContainer.channel, messageId, uId);
  }
  
  if (messageEditResult === true) {
    editMessageFromChannel(messageId, message);
  }
  else {
    return messageEditResult;
  }

  // Testing that data.channels was edited
  for (const channel of data.channels) {
    console.log(channel.messages); 
  }

  return {}; 

}

function editMessageFromChannel(messageId: number, editedMessage: Message) {
  const data = getData();
  for (const channel of data.channels) {
    for (const targetmessage of channel.messages) {
      if (targetmessage.messageId === messageId) {
        targetmessage.message = editedMessage
        
      };   
    };  
  }
  setData(data); 
}

  /*
  const uId = getUidFromToken(token);
  for (const channel of data.channels) {
    let findMessage = channel.messages.find(message => message.messageId === messageId);
     let findChannelOwner = channel.ownerMembers.find(channel => channel.uId === uId);  
  };

  
  


  if (!messageIdExists(messageId)) {
    return { error: 'messageId is invalid.' }; 
  }

  
  const uId = getUidFromToken(token);
  
  
 
  if (!isOwnerOfMessage(findMessage, uId) /*&& ! ) {
    return { error: 'user is not the sender of the message and is not the owner of the channel.'}; 
  }  

  
  // No errors found, update message with edited message. 
  if (findMessage.messageId === messageId) {
      findMessage.message = message;
  }
  
  
  setData(data);  
  */
  

export function messageRemoveV1(token: string, messageId: number) {
  const data = getData(); 
  if (!(tokenExists(token))) {
    return { error: 'token is invalid.' };
  }
  
  const messageContainer = getMessageContainer(messageId);
  if (!messageContainer) {
    return { error: 'message does not exist in either channels or dms' }
  }
  
  

  const uId = getUidFromToken(token);

  // Case where message is in a channel
  if (messageContainer.type === 'channel') {
    const messageRemoveResult = messageFromChannelValid(messageContainer.channel, messageId, uId);
    /* return messageRemoveResult; 
    if (!messageRemoveResult) {
      return messageRemoveResult;
    } */
    
    if (messageRemoveResult === true) {
      for (const channel of data.channels) {
      }
       removeMessageFromChannel(messageId);
    }
    else {
      return messageRemoveResult; 
    }
  }  
  // Case where message is in a dm
  /*
  if (messageContainer.type === 'dm') {
    if (messageContainer.dm.creator !== uId) {
      return {error: 'User atttempting remove message is not the owner of the dm'}
    }
      removeMessageFromDm(messageId);
  } 
  */

  return {};

}



function messageFromChannelValid(channel, messageId: number, uId: number): any {
  const data = getData();

  let ownerMember = false;
  // Check if user is owner member
  for (const member of channel.ownerMembers) {
    if (member.uId === uId) {
      ownerMember = true;
    }
  }

  // Get message
  let messageObj;
  for (const message of channel.messages) {
    if (message.messageId === messageId) {
      messageObj = message;
    }
  }
  // Find user object
  const findUser = data.users.find(user => user.uId === uId);
  if (!isMemberOfChannel(channel, uId)) {
    return {error: 'User is not a member of channel'};
  }
  
  
  // If user is a member and now a channel owner and not a global owner
  if (!ownerMember && !isOwnerOfMessage(messageObj, uId) && findUser.permissionId !== GLOBAL_OWNER) {
    return {error: 'Channel member does not have permissions to remove message'};

  }
  return true;
}

// function messageFromDmValid(dm, messageId: number, uId: number): any {
//   if (dm.creator === uId) {

//   }
// }

function removeMessageFromChannel(messageId: number): any {
  let data = getData();

  // Remove message
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        channel.messages = channel.messages.filter(message => message.messageId !== messageId);
      };   
    };  
  }
  setData(data);
}

/*
function removeMessageFromDm( messageId: number):any {
  let data = getData();
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        dm.messages = dm.messages.filter(message => message.messageId !== messageId);
      };   
    };  
  }
  setData(data);
}
*/


/*


  const uId = getUidFromToken(token);  
  
  if (messageErrorChecking(messageId, uId)) {
    return { error: 'messageId is invalid for channels or dms user is a member of.' }; 
  };

  let findMessage; 
  let findChannelorDM; 
  // findMessage for channel 
  for (const channel of data.channels) {
    if (channel.messages.find(message => message.messageId === messageId) !== undefined ) {
      findMessage = channel.messages.find(message => message.messageId === messageId); 
      findChannelorDM = channel; 
    } 
  };

  for (const dm of data.dms) {
    if (dm.messages.find(message => message.messageId === messageId) !== undefined ) {
      findMessage = dm.messages.find(message => message.messageId === messageId); 
      findChannelorDM = dm; 
    } 
  };
   
  const findUser = data.users.find(user => user.uId === uId);
  
  // user is not sender of message and is not the global owner
  if (!isOwnerOfMessage(findMessage, uId)) {
    if ( findUser.permissionId === GLOBAL_OWNER ){
      return { error: 'User is global owner but not a member of channel'}; 
    }; 
    if ( findUser.permissionId !== GLOBAL_OWNER ) {
      return { error: 'User is a member of the channel but not global owner'}
    };
    if (!isOwnerOfChannel(findChannelorDM, uId) || findChannelorDM.creator === uId  ) {
      return { error: 'User is not the owner of the channel'}
    
    };
};
  


  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        channel.messages = channel.messages.filter(message => message.messageId !== messageId);
      }
    }
  }
  
  setData(data); 

  return {}; 
}; 
*/

/* function messageErrorChecking(messageId: number, uId: number): boolean {
  // Loop through all members of channel
  // if user is found, then return true
  const data = getData(); 
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId && isMemberOfChannel(channel, uId)) {
        return true;
      }
    }
  };
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId && isMemberOfChannel(dm, uId)) {
        return true;
      }
    }
  };
  return false;
};
 */

