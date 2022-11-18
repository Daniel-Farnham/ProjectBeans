// Iteration 0 Types
export type email = string;
export type password = string;
export type message = string;
export type start = number;
export type end = number;
export type name = string;
export type is = boolean
export type uId = number;
// Iteration 1 Types
export type length = number;
export type time = number;
export type messageId = number;
export type channelId = number;
export type handleStr = string;
export type nameFirst = string;
export type nameLast = string;
export type isPublic = boolean;

// Iteration 2 Types
export type token = string;
export type dmId = number;
export type permissionId = number;

// Iteration 3 Types
export type isThisUserReacted = boolean;
export type isPinned = boolean;
export type uIds = uId[];
export type reactId = number;
export type isActive = boolean;
export type timeFinish = number | null;

export type react = {
  reactId: reactId,
  uIds: uIds,
  isThisUserReacted: isThisUserReacted,
};
export type reacts = react[];
export type Message = {
  messageId: messageId,
  uId: uId,
  message: message,
  timeSent: time,
  reacts: reacts,
  isPinned: isPinned,
};
export type notificationMessage = string;

export type notification = {
  channelId: channelId,
  dmId: dmId,
  notificationMessage: notificationMessage,
};

export type StandUp = {
  messages: message[];
  isActive: isActive,
  timeFinish: timeFinish,
};

// Output Types
export type messages = Message[];

// Used for dm/messages/v2 and channel/messages/v3
export type messagesOutput = {
  messages: Message[],
  start: start,
  end: end,
};
export type dmsOutput = {
  dmId: dmId,
  name: name,
};

export type channels = {channelId: channelId, name: name}[];
export type user = {
  uId: uId,
  email: email,
  nameFirst: nameFirst,
  nameLast: nameLast,
  handleStr: handleStr,
};
export type members = user[];
export type users = user[];
export type Channel = {
  channelId: channelId,
  name: name,
  ownerMembers: user[],
  allMembers: user[],
  messages: user[],
  isPublic: isPublic,
};

export type dmOutput = {
  dmId: dmId,
  name: name,
};
export type dms = dmOutput[];

export type notifications = notification[];

// Used for messageSendDmV1 and messageSendV1
export type messageIdReturnedObject = { messageId: messageId }
export type messagesReturnObject = { messages: messages };

// Used for dmDetailsV1
export type dmDetailsOuput = {
  name: name,
  members: users
};

// Used for dmListV1
export type dmListInfo = {
  dmId: number,
  name: string
};

export type dmListOutput = {
  dms: dmListInfo[],
};

export type dm = {
  dmId: dmId,
  name: name,
  creator: uId,
  members: user[],
  messages: Message[],
};

export type channelDetails = {
  name: string,
  isPublic: boolean,
  ownerMembers: user[],
  allMembers: user[],
};

// Used for standup functions

export type standUp = StandUp[];

// Internal representations of objects in datastore
export type profileImgUrl = string;
export type internalUser = {
  uId: uId,
  email: email,
  nameFirst: nameFirst,
  nameLast: nameLast,
  handleStr: handleStr,
  profileImgUrl: profileImgUrl,
  password: password,
  permissionId: permissionId
}
export type internalUsers = internalUser[];

export type internalChannel = {
  channelId: channelId,
  name: name,
  ownerMembers: users,
  allMembers: users,
  messages: messages,
  isPublic: isPublic,
  standUp: StandUp;
};

export type session = {
  uId: uId,
  tokens: string[]
};
export type sessions = session[];

export type internalChannels = internalChannel[];

export type internalNotification = {
  uId: uId,
  notifications: notifications
};

export type internalNotifications = internalNotification[];
export type internalDm = {
  dmId: dmId,
  name: name,
  creator: uId,
  members: users,
  messages: messages,
};
export type internalDms = internalDm[];

export type resetCodeRequest = {
  email: string,
  resetCode: string,
};

export type resetCodeRequests = resetCodeRequest[];
export type messagesAnalytics = { numMessagesExist: number, timeStamp: number };
export type internalMessagesExist = messagesAnalytics[];
export type dmsAnalytics = { numDmsExist: number, timeStamp: number };
export type internalDmsExist = dmsAnalytics[];
export type channelsAnalytics = { numChannelsExist: number, timeStamp: number };
export type internalChannelsExist = channelsAnalytics[];
export type internalWorkspaceStats = {
  channelsExist: internalChannelsExist,
  dmsExist: internalDmsExist,
  messagesExist: internalMessagesExist
}
export type timeoutIds = { dmId: number, isActive: boolean };
export type internalTimeoutIds = timeoutIds[];

export type datastore = {
  users: internalUsers,
  channels: internalChannels,
  sessions: sessions,
  messageCount: number,
  tokenCount: number,
  dms: internalDms,
  notifications: internalNotifications,
  resetCodeRequests: resetCodeRequests,
  resetCode: number,
  workspaceStats: internalWorkspaceStats
  timeoutIds: internalTimeoutIds
};

export type messageContainerType = {
  type: string,
  dm?: internalDm,
  channel?: internalChannel
};

export type isActiveOutput = {
    isActive: boolean,
    timeFinish: number,
}
