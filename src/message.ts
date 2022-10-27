import {
  channelIdExists, tokenExists, getMessageId,
  isMemberOfChannel, error, getUidFromToken, messageIdExists, isOwnerOfMessage, isOwnerOfChannel
} from './other';
import { getData, setData } from './dataStore';

const MIN_MESSAGE_LEN = 1;
const MAX_MESSAGE_LEN = 1000;

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
  const data = getData(); 
  const uId = getUidFromToken(token);
  for (const channel of data.channels) {
    let findMessage = channel.messages.find(message => message.messageId === messageId);
    /* let findChannelOwner = channel.ownerMembers.find(channel => channel.uId === uId);  */
  };

  console.log(findMessage); 
/*   console.log(findChannelOwner); 
 */  
  if (!(tokenExists(token))) {
    return { error: 'token is invalid.' };
  }

  if (!messageIdExists(messageId)) {
    return { error: 'messageId is invalid.' }; 
  }

  if (message.length > MAX_MESSAGE_LEN) {
    return { error: 'length of message is over 1000 characters.' };
  }

  const uId = getUidFromToken(token);
  
  /*
  if (isOwnerOfChannel(findChannel, uId)) {
    console.log('hello'); 
  } 
  */
 
  if (!isOwnerOfMessage(findMessage, uId) /*&& !isOwnerOfChannel(findChannel, uId)*/ ) {
    return { error: 'user is not the sender of the message and is not the owner of the channel.'}; 
  }  

  // No errors found, update message with edited message. 
  if (findMessage.messageId === messageId) {
      findMessage.message = message;
  }
  
  setData(data);  
  return {}; 

}

export function messageRemoveV1(token: string, messageId: number) {
  const data = getData(); 
  const uId = getUidFromToken(token);
  for (const channel of data.channels) {
    let findMessage = channel.messages.find(message => message.messageId === messageId);

  };

 

  if (!(tokenExists(token))) {
    return { error: 'token is invalid.' };
  };

  if (!messageIdExists(messageId)) {
    return { error: 'messageId is invalid.' }; 
  };

  if (!isOwnerOfMessage(findMessage, uId) /*&& !isOwnerOfChannel(findChannel, uId)*/ ) {
    return { error: 'user is not the sender of the message and is not the owner of the channel.'}; 
  }  

  if (findMessage.messageId === messageId) {
    delete findMessage.message; 
  }; 

  setData(data); 

  return {}; 
}; 
