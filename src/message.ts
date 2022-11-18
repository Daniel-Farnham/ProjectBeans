import {
  channelIdExists, tokenExists, getMessageId, FORBIDDEN, BAD_REQUEST, isMemberOfDm,
  isMemberOfChannel, error, getUidFromToken, isOwnerOfMessage, getMessageContainer, dmIdExists,
  getDmObjectFromDmlId, getChannelObjectFromChannelId, httpError, isOwnerOfChannel, updateMessageAnalytics
} from './other';
import { storeMessageInDm, messageSendDmV1 } from './dm';
import { notificationSetTag, requiresTagging, notificationSetReact } from './notifications';
import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { dm, internalChannel, messages, messageIdReturnedObject, messagesReturnObject, Message, messageId } from './types';

const MIN_MESSAGE_LEN = 1;
const MAX_MESSAGE_LEN = 1000;
const GLOBAL_OWNER = 1;

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
export function messageSendV1 (token: string, channelId: number, message: string): messageIdReturnedObject | error {
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

  const data = getData();
  const uId = getUidFromToken(token);
  const findChannel = data.channels.find(chan => chan.channelId === channelId);
  if (!isMemberOfChannel(findChannel, uId)) {
    throw HTTPError(403, 'user is not a member of the channel');
  }

  // Create message
  const messageId = getMessageId();
  const timeSent = Math.floor((new Date()).getTime() / 1000);
  const messageObj: Message = {
    messageId: messageId,
    uId: uId,
    message: message,
    timeSent: timeSent,
    reacts: [
      {
        reactId: 1,
        uIds: [],
        isThisUserReacted: false,
      }
    ],
    isPinned: false,
  };

  storeMessageInChannel(messageObj, channelId);
  if (requiresTagging(message)) {
    notificationSetTag(uId, channelId, -1, message, 'channel');
  }

  // Update the workplace analytics
  updateMessageAnalytics(timeSent);

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
      if (requiresTagging(message)) {
        notificationSetTag(uId, messageContainer.channel.channelId, -1, message, 'channel');
      }
    } else {
      return messageEditResult;
    }
  }

  // Case where message is in a dm.
  if (messageContainer.type === 'dm') {
    // If user is not an owner
    for (const message of messageContainer.dm.messages) {
      if (message.messageId === messageId && uId !== message.uId && messageContainer.dm.creator !== uId) {
        throw HTTPError(403, 'User atttempting edit message is not the owner of the dm or the sender');
      }
    }
    // If no errors, edit message from channel.
    editMessageFromDM(messageId, message);
    if (requiresTagging(message)) {
      notificationSetTag(uId, -1, messageContainer.dm.dmId, message, 'dm');
    }
  }

  return {};
}

/**
  * Reacts to the message that is entered
  *
  * @param {number} messageId - id of the message to be reacted to
  * @param {string} reactId - react value
  * ...
  *
  * @returns {{}}
*/
export function messageReactV1 (token: string, messageId: number, reactId: number): error | Record<string, never> {
  if (!(tokenExists(token))) {
    throw HTTPError(FORBIDDEN, 'token is invalid');
  }

  if (reactId !== 1) {
    throw HTTPError(BAD_REQUEST, 'reactId entered is not valid');
  }

  // Checking both channels and dms to see if messageId is valid.
  const messageContainer = getMessageContainer(messageId);
  if (!messageContainer) {
    throw HTTPError(400, 'message does not exist in either channels or dms');
  }
  const data = getData();

  const uId = getUidFromToken(token);
  if (messageContainer.type === 'channel') {
    if (!isMemberOfChannel(messageContainer.channel, uId)) {
      throw HTTPError(BAD_REQUEST, 'User is not a member of the channel');
    }
    for (const message of messageContainer.channel.messages) {
      if (message.messageId === messageId) {
        if (!isMemberOfChannel(messageContainer.channel, uId)) {
          throw HTTPError(BAD_REQUEST, 'User attempting to react to message is not a member');
        }
        if (messageReactedByUser(message, uId, reactId)) {
          throw HTTPError(BAD_REQUEST, 'Message already reacted by user');
        }
        reactToMessage(messageId, uId, reactId, 'channel');
      }
    }
  }
  if (messageContainer.type === 'dm') {
    for (const message of messageContainer.dm.messages) {
      if (message.messageId === messageId) {
        if (!isMemberOfDm(messageContainer.dm, uId)) {
          throw HTTPError(BAD_REQUEST, 'User attempting to react to message is not a member');
        }
        if (messageReactedByUser(message, uId, reactId)) {
          throw HTTPError(BAD_REQUEST, 'Message already reacted by user');
        }
        reactToMessage(messageId, uId, reactId, 'dm');
      }
    }
  }
  setData(data);
  return {};
}

/**
  * Pins a message in a channel or dm
  *
  * @param {string} token - token of authorised user
  * @param {number} messageId - id of the message to be pinned
  * ...
  *
  * @returns {{}}
*/
export function messagePinV1 (token: string, messageId: number): error | Record<string, never> {
  const data = getData();
  // check if token is valid
  if (!(tokenExists(token))) {
    throw HTTPError(FORBIDDEN, 'Token is invalid');
  }

  // Checking both channels and dms to see if messageId is valid.
  const messageContainer = getMessageContainer(messageId);
  if (!messageContainer) {
    throw HTTPError(BAD_REQUEST, 'Message does not exist in either channels or dms');
  }
  const uId = getUidFromToken(token);

  if (messageContainer.type === 'channel') {
    if (!isMemberOfChannel(messageContainer.channel, uId)) {
      throw HTTPError(BAD_REQUEST, 'User is not a member of the channel');
    }

    for (const message of messageContainer.channel.messages) {
      if (message.messageId === messageId) {
        if (message.isPinned === true) {
          throw HTTPError(BAD_REQUEST, 'That message is already pinned');
        } else {
          message.isPinned = true;
          const isOwner = isOwnerOfChannel(messageContainer.channel, getUidFromToken(token));
          if (!isOwner) {
            throw HTTPError(FORBIDDEN, 'Authorised user does not have owner permisssions');
          }
        }
      }
    }
  } else {
    for (const message of messageContainer.dm.messages) {
      if (!isMemberOfDm(messageContainer.dm, uId)) {
        throw HTTPError(BAD_REQUEST, 'User is not a member of this dm');
      }

      if (message.messageId === messageId) {
        if (message.isPinned === true) {
          throw HTTPError(BAD_REQUEST, 'That message is already pinned');
        } else {
          message.isPinned = true;
          const isOwner = isOwnerOfChannel(messageContainer.channel, getUidFromToken(token));
          if (!isOwner) {
            throw HTTPError(FORBIDDEN, 'Authorised user does not have owner permisssions');
          }
        }
      }
    }
  }
  setData(data);
  return {};
}

/**
  * Unpins a message in a channel or dm
  *
  * @param {string} token - token of authorised user
  * @param {number} messageId - id of the message to be unpinned
  * ...
  *
  * @returns {{}}
*/
export function messageUnpinV1 (token: string, messageId: number): error | Record<string, never> {
  const data = getData();
  // check if token is valid
  if (!(tokenExists(token))) {
    throw HTTPError(FORBIDDEN, 'Token is invalid');
  }

  // Checking both channels and dms to see if messageId is valid.
  const messageContainer = getMessageContainer(messageId);
  if (!messageContainer) {
    throw HTTPError(BAD_REQUEST, 'Message does not exist in either channels or dms');
  }
  const uId = getUidFromToken(token);

  if (messageContainer.type === 'channel') {
    if (!isMemberOfChannel(messageContainer.channel, uId)) {
      throw HTTPError(BAD_REQUEST, 'User is not a member of the channel');
    }

    for (const message of messageContainer.channel.messages) {
      if (message.messageId === messageId) {
        if (message.isPinned === false) {
          throw HTTPError(BAD_REQUEST, 'That message is not pinned');
        } else {
          message.isPinned = false;
          const isOwner = isOwnerOfChannel(messageContainer.channel, getUidFromToken(token));
          if (!isOwner) {
            throw HTTPError(FORBIDDEN, 'Authorised user does not have owner permisssions');
          }
        }
      }
    }
  } else {
    for (const message of messageContainer.dm.messages) {
      if (!isMemberOfDm(messageContainer.dm, uId)) {
        throw HTTPError(BAD_REQUEST, 'User is not a member of this dm');
      }

      if (message.messageId === messageId) {
        if (message.isPinned === false) {
          throw HTTPError(BAD_REQUEST, 'That message is not pinned');
        } else {
          message.isPinned = false;
          if (message.messageId === messageId && uId !== message.uId && messageContainer.dm.creator !== uId) {
            throw HTTPError(FORBIDDEN, 'Authorised user does not have owner permisssions');
          }
        }
      }
    }
  }
  setData(data);
  return {};
}

export function messageReactedByUser(message: Message, uId: number, reactId: number): boolean {
  for (const react of message.reacts) {
    if (react.reactId === reactId) {
      for (reactId of react.uIds) {
        if (reactId === uId) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
  * Adds react from user to message
  *
  * @param {number} messageId - id of the message to be reacted to
  * @param {number} reactId - reactId
  * ...
  *
  * @returns nothing
*/
function reactToMessage(messageId: number, uId: number, reactId: number, type: string) {
  const data = getData();
  if (type === 'dm') {
    for (const dm of data.dms) {
      for (const message of dm.messages) {
        if (message.messageId === messageId) {
          for (const reaction of message.reacts) {
            if (reaction.reactId === reactId) {
              reaction.uIds.push(uId);
              reaction.isThisUserReacted = true;
            }
            if (isMemberOfDm(dm, message.uId)) {
              notificationSetReact(message, uId, -1, dm.dmId, 'dm');
            }
          }
        }
      }
    }
  }
  if (type === 'channel') {
    for (const channel of data.channels) {
      for (const message of channel.messages) {
        if (message.messageId === messageId) {
          for (const reaction of message.reacts) {
            if (reaction.reactId === reactId) {
              reaction.uIds.push(uId);
              reaction.isThisUserReacted = true;
            }
            if (isMemberOfChannel(channel, message.uId)) {
              notificationSetReact(message, uId, channel.channelId, -1, 'channel');
            }
          }
        }
      }
    }
  }
  setData(data);
}

/**
  * Removes a reaction from the message that is entered
  *
  * @param {number} messageId - id of the message to unreact to
  * @param {string} reactId - react value
  * ...
  *
  * @returns {{}}
*/
export function messageUnreactV1 (token: string, messageId: number, reactId: number): error | Record<string, never> {
  if (!(tokenExists(token))) {
    throw HTTPError(FORBIDDEN, 'token is invalid');
  }

  if (reactId !== 1) {
    throw HTTPError(BAD_REQUEST, 'reactId entered is not valid');
  }

  // Checking both channels and dms to see if messageId is valid.
  const messageContainer = getMessageContainer(messageId);
  if (!messageContainer) {
    throw HTTPError(400, 'message does not exist in either channels or dms');
  }
  const data = getData();

  const uId = getUidFromToken(token);
  if (messageContainer.type === 'channel') {
    if (!isMemberOfChannel(messageContainer.channel, uId)) {
      throw HTTPError(BAD_REQUEST, 'User is not a member of the channel');
    }
    for (const message of messageContainer.channel.messages) {
      if (message.messageId === messageId) {
        if (!isMemberOfChannel(messageContainer.channel, uId)) {
          throw HTTPError(BAD_REQUEST, 'User attempting to unreact to message is not a member');
        }
        if (!messageReactedByUser(message, uId, reactId)) {
          throw HTTPError(BAD_REQUEST, 'Message has not been reacted to by user');
        }
        UnreactToMessage(messageId, uId, reactId, 'channel');
      }
    }
  }
  if (messageContainer.type === 'dm') {
    for (const message of messageContainer.dm.messages) {
      if (message.messageId === messageId) {
        if (!isMemberOfDm(messageContainer.dm, uId)) {
          throw HTTPError(BAD_REQUEST, 'User attempting to unreact to message is not a member');
        }
        if (!messageReactedByUser(message, uId, reactId)) {
          throw HTTPError(BAD_REQUEST, 'Message has not been reacted to by user');
        }
        UnreactToMessage(messageId, uId, reactId, 'dm');
      }
    }
  }
  setData(data);
  return {};
}

/**
  * Removes react from user to message
  *
  * @param {number} messageId - id of the message to unreact to
  * @param {number} reactId - reactId
  * ...
  *
  * @returns nothing
*/
function UnreactToMessage(messageId: number, uId: number, reactId: number, type: string) {
  const data = getData();
  if (type === 'dm') {
    for (const dm of data.dms) {
      for (const message of dm.messages) {
        if (message.messageId === messageId) {
          for (const reaction of message.reacts) {
            if (reaction.reactId === reactId) {
              const index = reaction.uIds.indexOf(uId);
              reaction.uIds.splice(index, 1);
              reaction.isThisUserReacted = false;
            }
          }
        }
      }
    }
  }
  if (type === 'channel') {
    for (const channel of data.channels) {
      for (const message of channel.messages) {
        if (message.messageId === messageId) {
          for (const reaction of message.reacts) {
            if (reaction.reactId === reactId) {
              const index = reaction.uIds.indexOf(uId);
              reaction.uIds.splice(index, 1);
              reaction.isThisUserReacted = false;
            }
          }
        }
      }
    }
  }
  setData(data);
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

  // Case where message is in a dm.
  if (messageContainer.type === 'dm') {
    // If user is not an owner
    for (const message of messageContainer.dm.messages) {
      if (message.messageId === messageId && uId !== message.uId && messageContainer.dm.creator !== uId) {
        throw HTTPError(403, 'User atttempting edit message is not the owner of the dm or the sender');
      }
    }
    // If no errors, remove
    removeMessageFromDM(messageId);
  }

  // Update the workplace analytics
  decrementMessageAnalytics();

  return {};
}

/**
  * Decreases the number of messages in the workplace analytics
  */
function decrementMessageAnalytics() {
  const data = getData();
  const index = data.workspaceStats.messagesExist.length;
  const numMsgs = data.workspaceStats.messagesExist[index - 1].numMessagesExist;
  const timeSent = Math.floor((new Date()).getTime() / 1000);
  data.workspaceStats.messagesExist.push({ numMessagesExist: numMsgs - 1, timeStamp: timeSent });
  setData(data);
}

/**
  * Searches messages in dms/channels that user is a part of and returns
  * messages that match the query string
  *
  * @param {string} token - token of authorised user
  * @param {string} token - query string to search messages for
  *
  * @returns {{messages}} returns an array containing message objects
*/
export function searchV1 (token: string, queryStr: string): error | messagesReturnObject {
  if (!(tokenExists(token))) {
    throw HTTPError(FORBIDDEN, 'token is invalid');
  }

  if (queryStr.length < MIN_MESSAGE_LEN || queryStr.length > MAX_MESSAGE_LEN) {
    throw HTTPError(BAD_REQUEST, 'length of query is less than 1 or over 1000 characters');
  }
  let messages: messages = [];
  const uId = getUidFromToken(token);
  messages = getMessagesFromDms(messages, uId, queryStr);
  messages = getMessagesFromChannels(messages, uId, queryStr);
  return { messages };
}

/**
  * Shares a message from a dm/channel to a dm/channel
  *
  * @param {string} token - token of authorised user
  * @param {number} ogMessageId - messageId of original message to be shared
  * @param {string} message - additional optional message
  * @param {number} channelId - channelId to share to
  * @param {number} dmId - dmId to share to
  *
  * @returns {sharedMessageId} returns value of messageId of the shared message
*/
export function messageShareV1 (token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  messageShareErrorChecking(token, ogMessageId, message, channelId, dmId);
  const uId = getUidFromToken(token);
  const messageContainer = getMessageContainer(ogMessageId);

  let fullMessage;

  // Case where message being shared is shared to a channel
  if (dmId === -1) {
    fullMessage = generateChannelNewMessageString(messageContainer.channel, ogMessageId, message);
    if (requiresTagging(message)) {
      notificationSetTag(uId, -1, messageContainer.dm.dmId, message, 'dm');
    }
  }
  // Case where message being shared is shared to a dm
  if (channelId === -1) {
    fullMessage = generateDmNewMessageString(messageContainer.dm, ogMessageId, message);
    if (requiresTagging(message)) {
      notificationSetTag(uId, -1, messageContainer.dm.dmId, message, 'dm');
    }
  }
  const sharedMessageId = sendSharedMessage(uId, channelId, dmId, fullMessage);
  return { sharedMessageId: sharedMessageId };
}

/**
  * Performs error checking for messageShareV1 function and throws any errors
  *
  * @param {string} token - token of authorised user
  * @param {number} ogMessageId - messageId of original message to be shared
  * @param {string} message - additional optional message
  * @param {number} channelId - channelId to share to
  * @param {number} dmId - dmId to share to
  *
*/
function messageShareErrorChecking(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  if (!(tokenExists(token))) {
    throw HTTPError(FORBIDDEN, 'token is invalid');
  }
  if (!channelIdExists(channelId) && !dmIdExists(dmId)) {
    throw HTTPError(BAD_REQUEST, 'both dmId and channelId are invalid');
  }

  if (notValidSharing(channelId, dmId)) {
    throw HTTPError(BAD_REQUEST, 'neither channelId nor dmId are -1');
  }

  const uId = getUidFromToken(token);
  const messageContainer = getMessageContainer(ogMessageId);

  // ogMessageId does not refer to a valid message within a channel/DM
  // that the authorised user has joined
  if (!messageContainer) {
    throw HTTPError(BAD_REQUEST, 'ogMessageId not a valid message');
  }
  if (messageContainer.type === 'dm' && !isMemberOfDm(messageContainer.dm, uId)) {
    throw HTTPError(BAD_REQUEST, 'user is not member of dm that message is a part of');
  }
  if (messageContainer.type === 'channel' && !isMemberOfChannel(messageContainer.channel, uId)) {
    throw HTTPError(BAD_REQUEST, 'user is not member of channel that message is a part of');
  }
  if (message.length > MAX_MESSAGE_LEN) {
    throw HTTPError(BAD_REQUEST, 'length of optional message is more than 1000 characters');
  }

  const dm = getDmObjectFromDmlId(dmId);
  const channel = getChannelObjectFromChannelId(channelId);

  if (dmId === -1) {
    if (!isMemberOfChannel(channel, uId)) {
      throw HTTPError(FORBIDDEN, 'user not joined to channel that message is to be shared to');
    }
  }
  if (channelId === -1) {
    if (!isMemberOfDm(dm, uId)) {
      throw HTTPError(FORBIDDEN, 'user not joined to dm that message is to be shared to');
    }
  }
}

function sendSharedMessage(uId: number, channelId: number, dmId: number, message: string): messageId {
  // Create message
  const messageId = getMessageId();
  const timeSent = Math.floor((new Date()).getTime() / 1000);
  const messageObj: Message = {
    messageId: messageId,
    uId: uId,
    message: message,
    timeSent: timeSent,
    reacts: [
      {
        reactId: 1,
        uIds: [],
        isThisUserReacted: false,
      }
    ],
    isPinned: false,
  };

  if (channelId !== -1) {
    storeMessageInChannel(messageObj, channelId);
  } else if (dmId !== -1) {
    storeMessageInDm(messageObj, dmId);
  }
  return messageId;
}

function notValidSharing(channelId: number, dmId: number) {
  if (channelId !== -1 && dmId !== -1) {
    return true;
  }
  return false;
}

/**
  * Generate new message string for sharing
  *
  * @param {dm} dm - dm object
  * @param {number} messageId - id of the message to be edited
  * @param {string} additionalMsg - additional message to append
  * @returns newly generated message
  *
*/
function generateDmNewMessageString(dm: dm, messageId: number, additionalMsg: string) {
  for (const targetmessage of dm.messages) {
    // If there is a message with the correct messageId, edit the message.
    if (targetmessage.messageId === messageId) {
      additionalMsg = targetmessage.message + additionalMsg;
    }
  }
  return additionalMsg;
}
/**
  * Generate new message string for sharing
  *
  * @param {channel} channel - channel object
  * @param {number} messageId - id of the message to be edited
  * @param {string} additionalMsg - additional message to append
  * ...
  *
  * @returns newly generated message
*/
function generateChannelNewMessageString(channel: internalChannel, messageId: number, additionalMsg: string) {
  for (const targetmessage of channel.messages) {
    // If there is a message with the correct messageId, edit the message.
    if (targetmessage.messageId === messageId) {
      additionalMsg = targetmessage.message + additionalMsg;
    }
  }
  return additionalMsg;
}

/**
  * Searches messages in dms that user is a part of and returns
  * messages that match the query string
  *
  * @param {array} messages - messages array which is used to push matching messages
  *                           to
  * @param {number} uId - uId of authorised user requesting message
  *
  * @returns {{messages}} returns an array containing message objects
*/
function getMessagesFromDms (messages: messages, uId: number, queryStr: string) {
  const data = getData();
  const caseInsensitive = queryStr.toLowerCase();
  for (const dm of data.dms) {
    if (isMemberOfDm(dm, uId)) {
      for (const message of dm.messages) {
        if (message.message.toLowerCase().includes(caseInsensitive)) {
          messages.push(message);
        }
      }
    }
  }
  return messages;
}

/**
  * Searches messages in channels that user is a part of and returns
  * messages that match the query string
  *
  * @param {array} messages - messages array which is used to push matching messages
  *                           to
  * @param {number} uId - uId of authorised user requesting message
  *
  * @returns {{messages}} returns an array containing message objects
*/
function getMessagesFromChannels (messages: messages, uId: number, queryStr: string) {
  const data = getData();
  const caseInsensitive = queryStr.toLowerCase();
  for (const channel of data.channels) {
    if (isMemberOfChannel(channel, uId)) {
      for (const message of channel.messages) {
        if (message.message.toLowerCase().includes(caseInsensitive)) {
          messages.push(message);
        }
      }
    }
  }
  return messages;
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
function messageFromChannelValid(channel: internalChannel, messageId: number, uId: number): any {
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
    throw HTTPError(403, 'Channel member does not have permissions to remove/edit/share message');
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
        channel.messages = channel.messages.filter(
          (message: Message): message is Message => message.messageId !== messageId);
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
        dm.messages = dm.messages.filter(
          (message: Message): message is Message => message.messageId !== messageId);
      }
    }
  }
  setData(data);
}

/**
  * Sends a message to a channel automatically at a specified time in the future
  *
  * @param {string} token - the token of the user making the request
  * @param {number} channelId - id of the channel where the message is being sent
  * @param {string} message - the message being sent
  * @param {number} timeSent - the time when the message should be sent (in seconds)

  *
  * @returns {messageId} returns an object containing the messageId
  */
export function messageSendlaterV1(token: string, channelId: number, message: string, timeSent: number): messageIdReturnedObject | error {
  // Check if the given information is valid
  const currentTime = Math.floor((new Date()).getTime() / 1000);
  const isInvalid = sendlaterInfoInvalid(token, channelId, message, timeSent, currentTime);
  if (isInvalid !== false) {
    const errorMsg = isInvalid as any;
    throw HTTPError(errorMsg.code, errorMsg.error);
  }

  // Make the message send at the given time, and return what the messageId will be
  setTimeout(function() {
    messageSendV1(token, channelId, message);
  }, (timeSent - currentTime) * 1000);

  const data = getData();
  return { messageId: data.messageCount };
}

/**
  * Checks the info given in messageSendlaterV1 is valid
  *
  * @param {string} token - the token of the user making the request
  * @param {number} channelId - id of the channel where the message is being sent
  * @param {string} message - the message being sent
  * @param {number} timeSent - the time when the message should be sent (in seconds)
  * @param {number} currentTime - the current time (in seconds)
  *
  * @returns {httpError} returns an error code and message if the info is invalid
  * @returns {boolean} returns false if the info is valid
  */
function sendlaterInfoInvalid(token: string, channelId: number, message: string, timeSent: number, currentTime: number): httpError | boolean {
  const data = getData();

  if (!tokenExists(token)) {
    return { code: FORBIDDEN, error: 'Token is invalid' };
  }

  if (!channelIdExists(channelId)) {
    return { code: BAD_REQUEST, error: 'ChannelId is invalid' };
  }

  if (message.length < MIN_MESSAGE_LEN || message.length > MAX_MESSAGE_LEN) {
    return { code: BAD_REQUEST, error: 'Length of message is less than 1 or over 1000 characters' };
  }

  if (timeSent - currentTime < 0) {
    return { code: BAD_REQUEST, error: 'timeSent is in the past' };
  }

  const uId = getUidFromToken(token);
  const findChannel = data.channels.find(chan => chan.channelId === channelId);
  if (!isMemberOfChannel(findChannel, uId)) {
    return { code: FORBIDDEN, error: 'User is not a member of the channel' };
  }

  return false;
}

/**
  * Sends a message to a dm automatically at a specified time in the future
  *
  * @param {string} token - the token of the user making the request
  * @param {number} dmId - id of the dm where the message is being sent
  * @param {string} message - the message being sent
  * @param {number} timeSent - the time when the message should be sent (in seconds)
  *
  * @returns {messageId} returns an object containing the messageId
  */
export function messageSendlaterdmV1(token: string, dmId: number, message: string, timeSent: number): messageIdReturnedObject | error {
  // Check if the given information is valid
  const currentTime = Math.floor((new Date()).getTime() / 1000);
  const isInvalid = sendlaterdmInfoInvalid(token, dmId, message, timeSent, currentTime);
  if (isInvalid !== false) {
    const errorMsg = isInvalid as any;
    throw HTTPError(errorMsg.code, errorMsg.error);
  }

  // Make the message send at the given time, and return what the messageId will be
  setTimeout(function() {
    messageSendDmV1(token, dmId, message);
  }, (timeSent - currentTime) * 1000);

  // Store the dmId in the timeoutIds array that declares that the dm is still active
  // This will be used by messageSenddm to determine whether a message should still be sent
  const data = getData();
  data.timeoutIds.push({ dmId: dmId, isActive: true });
  return { messageId: data.messageCount };
}

/**
  * Checks the info given in messageSendlaterdmV1 is valid
  *
  * @param {string} token - the token of the user making the request
  * @param {number} dmId - id of the dm where the message is being sent
  * @param {string} message - the message being sent
  * @param {number} timeSent - the time when the message should be sent (in seconds)
  * @param {number} currentTime - the current time (in seconds)
  *
  * @returns {httpError} returns an error code and message if the info is invalid
  * @returns {boolean} returns false if the info is valid
  */
function sendlaterdmInfoInvalid(token: string, dmId: number, message: string, timeSent: number, currentTime: number): httpError | boolean {
  const data = getData();

  if (!tokenExists(token)) {
    return { code: FORBIDDEN, error: 'Token is invalid' };
  }

  if (!dmIdExists(dmId)) {
    return { code: BAD_REQUEST, error: 'DmId is invalid' };
  }

  if (message.length < MIN_MESSAGE_LEN || message.length > MAX_MESSAGE_LEN) {
    return { code: BAD_REQUEST, error: 'Length of message is less than 1 or over 1000 characters' };
  }

  if (timeSent - currentTime < 0) {
    return { code: BAD_REQUEST, error: 'timeSent is in the past' };
  }

  const uId = getUidFromToken(token);
  const findDm = data.dms.find(dm => dm.dmId === dmId);
  if (!isMemberOfDm(findDm, uId)) {
    return { code: FORBIDDEN, error: 'User is not a member of the dm' };
  }

  return false;
}
