import {
  channelIdExists, tokenExists, getMessageId,
  isMemberOfChannel, error, getUidFromToken, isOwnerOfMessage, getMessageContainer, Channel
} from './other';
import { notificationSetTag, requiresTagging } from'./notifications';
import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';

const MIN_MESSAGE_LEN = 1;
const MAX_MESSAGE_LEN = 1000;
const GLOBAL_OWNER = 1;

type messageId = { messageId: number }

/**
  * Interface for message object
*/
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
    throw HTTPError(403, 'token is invalid');
  }
  if (!channelIdExists(channelId)) {
    throw HTTPError(400, 'channelId is invalid');
  }

  // Check if length of the message is between 1-1000 characters long.
  // Create message if true, return error if false.
  if (message.length < MIN_MESSAGE_LEN || message.length > MAX_MESSAGE_LEN) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }

  const uId = getUidFromToken(token);
  if (!isMemberOfChannel(findChannel, uId)) {
    throw HTTPError(403, 'user is not a member of the channel');
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
  if (requiresTagging(message)) {
    notificationSetTag(uId, channelId, -1, message, 'channel');
  }
  return { messageId: messageId };
}

/**
  * Stores message in channel object and saves it to datastore
  *
  * @param {string} message - message to store
  * @param {number} channelId - id of channel to store
  * ...
  *
  * @returns - nothing to return
*/
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

export function messageEditV1 (token: string, messageId: number, message: string): error | Record<string, never> {
  if (!(tokenExists(token))) {
    throw HTTPError(403, 'token is invalid');
  }

  if (message.length > MAX_MESSAGE_LEN) {
    throw HTTPError(400, 'length of message is over 1000 characters.');
  }

  // Checking both channels and dms to see if messageId is valid.
  const messageContainer = getMessageContainer(messageId);
  if (!messageContainer) {
    throw HTTPError(400, 'message does not exist in either channels or dms');
  }

  const uId = getUidFromToken(token);

  // Case where message is in a channel.
  if (messageContainer.type === 'channel') {
    const messageEditResult = messageFromChannelValid(messageContainer.channel, messageId, uId);
    if (messageEditResult === true) {
      editMessageFromChannel(messageId, message);
    } else {
      return messageEditResult;
    }
  }

  // Case where message is in a dm.
  if (messageContainer.type === 'dm') {
    // If no errors, remove dm from channel.
    if (messageContainer.dm.creator !== uId) {
      throw HTTPError(403, 'User atttempting remove message is not the owner of the dm');
    } else {
      editMessageFromDM(messageId, message);
    }
  }

  return {};
}

/**
  * Edits the message that exists in the channel
  *
  * @param {number} messageId - id of the message to be edited
  * @param {string} editedMessage - edited message
  * ...
  *
  * @returns nothing
*/

function editMessageFromChannel(messageId: number, editedMessage: string) {
  const data = getData();
  for (const channel of data.channels) {
    for (const targetmessage of channel.messages) {
      // If there is a message with the correct messageId, edit the message.
      if (targetmessage.messageId === messageId) {
        targetmessage.message = editedMessage;
      }
    }
  }

  setData(data);
}

/**
  * Edits the message that exists in the dm
  *
  * @param {number} messageId - id of the message to be edited
  * @param {string} editedMessage - edited message
  * ...
  *
  * @returns nothing
*/
function editMessageFromDM(messageId: number, editedMessage: string) {
  const data = getData();
  for (const dm of data.dms) {
    for (const targetmessage of dm.messages) {
      if (targetmessage.messageId === messageId) {
        targetmessage.message = editedMessage;
      }
    }
  }

  setData(data);
}

/**
  * Finds a message and deletes it from the messages array.
  *
  * @param {string} token - token of authorised user
  * @param {number} messageId - id of the message to be deleted.
  * ...
  *
  * @returns {} returns an empty object (Record<string, never>)
  * @returns {error} returns an error object
*/
export function messageRemoveV1(token: string, messageId: number): error | Record<string, never> {
  if (!(tokenExists(token))) {
    throw HTTPError(403, 'token is invalid');
  }

  // Checking both channels and dms to see if messageId is valid.
  const messageContainer = getMessageContainer(messageId);
  if (!messageContainer) {
    throw HTTPError(400, 'message does not exist in either channels or dms');
  }

  const uId = getUidFromToken(token);

  // Error handling where message is in a channel
  if (messageContainer.type === 'channel') {
    const messageRemoveResult = messageFromChannelValid(messageContainer.channel, messageId, uId);

    // If no errors, remove message from channel.
    if (messageRemoveResult === true) {
      removeMessageFromChannel(messageId);
    } else {
      return messageRemoveResult;
    }
  }

  // Error handling where message is in a dm
  if (messageContainer.type === 'dm') {
    // If no errors, remove dm from channel.
    if (messageContainer.dm.creator !== uId) {
      throw HTTPError(403, 'User atttempting remove message is not the owner of the dm');
    } else {
      removeMessageFromDM(messageId);
    }
  }

  return {};
}

/**
  * For a given channel, message and uId this function error checks the channel/message owner permissions.
  *
  * @param {string} channel - the channel object
  * @param {number} messageId - id of the message to be deleted.
  * @param {number} uId - id of the user.
  *
  * @returns {error} returns an error object.
  * @returns {boolean} returns a boolean value.
*/
function messageFromChannelValid(channel: Channel, messageId: number, uId: number): any {
  const data = getData();

  let ownerMember = false;
  // Check if user is owner member
  for (const member of channel.ownerMembers) {
    if (member.uId === uId) {
      ownerMember = true;
    }
  }

  let messageObj;
  for (const message of channel.messages) {
    if (message.messageId === messageId) {
      messageObj = message;
    }
  }
  // Find user object
  const findUser = data.users.find(user => user.uId === uId);
  if (!isMemberOfChannel(channel, uId)) {
    throw HTTPError(403, 'User is not a member of the channel');
  }

  // If user is a member and now a channel owner and not a global owner
  if (!ownerMember && !isOwnerOfMessage(messageObj, uId) && findUser.permissionId !== GLOBAL_OWNER) {
    throw HTTPError(403, 'Channel member does not have permissions to remove message');
  }
  return true;
}

/**
  * Removes the message that exists in the channel
  *
  * @param {number} messageId - id of the message to be edited
  * ...
  *
  * @returns nothing
*/
function removeMessageFromChannel(messageId: number): any {
  const data = getData();

  // Removes the message from channel.
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        channel.messages = channel.messages.filter(message => message.messageId !== messageId);
      }
    }
  }
  setData(data);
}

/**
  * Removes the message that exists in the dms
  *
  * @param {number} messageId - id of the message to be edited
  * ...
  *
  * @returns nothing
*/
function removeMessageFromDM(messageId: number):any {
  const data = getData();

  // Removes the message from dms.
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        dm.messages = dm.messages.filter(message => message.messageId !== messageId);
      }
    }
  }
  setData(data);
}
