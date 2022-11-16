import { getData, setData } from './dataStore';
import { tokenExists, error, getUidFromToken, channelIdExists, isMemberOfChannel, FORBIDDEN, BAD_REQUEST } from './other';
import HTTPError from 'http-errors';

type standupInfo = {
    isActive: boolean
    timeFinish: number | null
}

type timeFinish = {
    timeFinish: number | null
}

/**
  * Starts a given standup from a given channel. The standup time is specified by its length
  * and the standup is set to active. The standup deactivates at the end of length time.
  *
  * @param {string} token - token of authorised user
  * @param {number} channelId - id of channel to send message to
  * @param {number} length
  * ...
  *
  * @returns {timeFinish} returns an object containing information
  * regarding the standups finish time
  */
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

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const standup of channel.standUp) {
        if (standup.isActive === true) {
          throw HTTPError(BAD_REQUEST, 'Active standup already running in the channel');
        }
      }
    }
  }

  const timeFinish = timeStandup(length);
  const ActivateStandup = {
    isActive: true,
    timeFinish: timeFinish,
  };

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.standUp.push(ActivateStandup);
    }
  }
  setData(data);

  setTimeout(function() {
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
  const timeStart = Math.floor((new Date()).getTime());
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
    for (const targetStandup of channel.standUp) {
      if (targetStandup.timeFinish === timeFinish) {
        targetStandup.isActive = false;
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
export function standupActiveV1(token: string, channelId: number): standupInfo {
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
  if (findChannel.standUp.isActive) {
    isActive = true;
    timeFinish = findChannel.standUp.timeFinish;
  }

  return { isActive: isActive, timeFinish: timeFinish };
}
