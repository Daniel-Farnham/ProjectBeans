import { channelIdExists, getMessageId, tokenExists, getMessageId,
          isMemberOfChannel, error, getUidFromToken} from './other';
import { getData, setData } from './dataStore';
import {  } from './other';
import { MessageOptions } from 'child_process';


const MIN_MESSAGE_LEN = 1; 
const MAX_MESSAGE_LEN = 1000; 

type messageId = { messageId: number }

interface Message { 
  messageId: number, 
  uId: number,
  message: string,
  timeSent: number,
};

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
  const findChannel = data.channels.find(chan => chan.channelId === channelId)

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

  return {messageId: 0}; 
}

function storeMessageInChannel(message: Message, channelId: number) {
  let data = getData();

  for (let channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.messages.push(message);
    }
  }
}

//   const exampleMessages = [
    // {
    //   messageId: 0, 
    //   uId: 0,
    //   message: 'Something',
    //   timeSent: timeSent,
    // }
//   ]

