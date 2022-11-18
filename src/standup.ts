import { getData, setData } from './dataStore';
import { tokenExists, storeMessageInChannel, getMessageId, error, getUidFromToken, channelIdExists, isMemberOfChannel, FORBIDDEN, BAD_REQUEST } from './other';
import HTTPError from 'http-errors';
import { Message, isActiveOutput } from './types';

const MAX_MESSAGE_LEN = 1000;
type timeFinish = {
  timeFinish: number | null,
}

/**
  * Packages the messages sent during the stand up.
  * This is then pushed to the channel messages as one package.
  *
  * @param {string} token - token of authorised user
  * @param {number} channelId - id of channel to send message to
  * @param {string} message
  * ...
  *
  * @returns {} returns an empty object
  */

export function standupSendV1 (token: string, channelId: number, message: string): error | Record<string, never> {
  const data = getData();
  const findChannel = data.channels.find(chan => chan.channelId === channelId);

  if (!(tokenExists(token))) {
    throw HTTPError(FORBIDDEN, 'token is invalid');
  }

  if (!channelIdExists(channelId)) {
    throw HTTPError(BAD_REQUEST, 'channelId is invalid');
  }

  if (message.length > MAX_MESSAGE_LEN) {
    throw HTTPError(BAD_REQUEST, 'length of message is over 1000 characters.');
  }

  const uId = getUidFromToken(token);
  if (!isMemberOfChannel(findChannel, uId)) {
    throw HTTPError(FORBIDDEN, 'User is not a member of the channel');
  }

  const isActive = (standupActiveV1(token, channelId).isActive);
  if (isActive === false) {
    throw HTTPError(BAD_REQUEST, 'Active standup is not currently running in the channel');
  }

  const user = data.users.find(user => user.uId === uId);
  const packagedMessage = user.handleStr + ': ' + message + '\n';

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.standUp.messages.push(packagedMessage);
    }
  }

  return {};
}

export function standupStartV1 (token: string, channelId: number, length: number): timeFinish | error {
  const data = getData();
  const findChannel = data.channels.find(chan => chan.channelId === channelId);

  if (!(tokenExists(token))) {
    throw HTTPError(FORBIDDEN, 'token is invalid');
  }

  if (!channelIdExists(channelId)) {
    throw HTTPError(BAD_REQUEST, 'channelId is invalid');
  }

  if (length < 0) {
    throw HTTPError(BAD_REQUEST, 'standup length is invalid');
  }

  const uId = getUidFromToken(token);
  if (!isMemberOfChannel(findChannel, uId)) {
    throw HTTPError(FORBIDDEN, 'User is not a member of the channel');
  }

  const isActive = (standupActiveV1(token, channelId).isActive);
  if (isActive === true) {
    throw HTTPError(BAD_REQUEST, 'Active standup already running in the channel');
  }

  const timeFinish = timeStandup(length);

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.standUp.isActive = true;
      channel.standUp.timeFinish = timeFinish;
    }
  }

  setData(data);
  setTimeout(function() {
    const findChannel = data.channels.find(chan => chan.channelId === channelId);
    const standupMessages = findChannel.standUp.messages.join('');
    const standupMessageId = getMessageId();

    const messageObj: Message = {
      messageId: standupMessageId,
      uId: uId,
      message: standupMessages,
      timeSent: timeFinish,
      reacts: [
        {
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }
      ],
      isPinned: false
    };

    storeMessageInChannel(messageObj, channelId);
    deactivateStandup(channelId, timeFinish);
  }, (length * 1000));

  return { timeFinish: timeFinish };
}

/**
  * Sums Current Time + length, returning time finish.
  *
  * @param {number} length
  * ...
  *
  * @returns {timeFinish}
  */

function timeStandup (length: number): number {
  const timeStart = Math.floor((new Date()).getTime() / 1000);
  const timeFinish = timeStart + length;

  return timeFinish;
}

/**
  * Deactivates the standup by setting isActive to false. This function is runs at TimeFinish.
  *
  * @param {number} length
  * @param {number} channelId
  * ...
  *
  */

function deactivateStandup(channelId: number, timeFinish: number) {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      if (channel.standUp.timeFinish >= timeFinish) {
        channel.standUp.isActive = false;
        channel.standUp.messages = [];
        channel.standUp.timeFinish = null;
      }
    }
  }
  setData(data);
}

/**
  * Returns whether a standup from a given channel is active and
  * what time the standup finishes. If not active, the finish time
  * is null.
  *
  * @param {string} token - token of authorised user
  * @param {number} channelId - id of channel to send message to
  * ...
  *
  * @returns {standupInfo} returns an object containing information
  * regarding whether the standup is active and its finish time
  */
export function standupActiveV1(token: string, channelId: number): isActiveOutput {
  if (!(tokenExists(token))) {
    throw HTTPError(FORBIDDEN, 'Token is invalid');
  }

  if (!channelIdExists(channelId)) {
    throw HTTPError(BAD_REQUEST, 'ChannelId is invalid');
  }

  const data = getData();
  const findChannel = data.channels.find(chan => chan.channelId === channelId);
  const uId = getUidFromToken(token);
  if (!isMemberOfChannel(findChannel, uId)) {
    throw HTTPError(FORBIDDEN, 'User is not a member of the channel');
  }

  // If the standup is active return its finish time otherwise return null
  let isActive = false;
  let timeFinish = null;

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      if (channel.standUp.isActive === true) {
        isActive = true;
        timeFinish = channel.standUp.timeFinish;
      }
    }
  }
  return { isActive: isActive, timeFinish: timeFinish };
}
