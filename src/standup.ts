import { getData } from './dataStore';
import { tokenExists, getUidFromToken, channelIdExists, isMemberOfChannel, FORBIDDEN, BAD_REQUEST } from './other';
import HTTPError from 'http-errors';

type standupInfo = {
    isActive: boolean
    timeFinish: number | null
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
