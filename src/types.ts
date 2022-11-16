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


export type Channel = {
  channelId: channelId,
  name: name,
  ownerMembers: user[],
  allMembers: user[],
  messages: user[],
  isPublic: isPublic,
};



// Iteration 2 Types
export type token = string;
export type dmId = number;
export type permissionId = number;

// Iteration 3 Types
export type isThisUserReacted = boolean;
export type isPinned = boolean;

export type reactId = number;

export type react = {
  reactId: reactId,
  uIds: uIds,
  isThisUserReacted: isThisUserReacted,
};
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


export type dm = {
  dmId: dmId,
  name: name,
  creator: uId,
  members: user[],
  messages: Message[],
};


// Output Types
export type messages = Message[];

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


export type dmOutput = {
  dmId: dmId,
  name: name,
};
export type dms = dmOutput[];
export type uIds = uId[];

export type reacts = react[];
export type notifications = notification[];

// Internal representations of objects in datastore

export type internalUser = {
  uId: uId,
  email: email,
  nameFirst: nameFirst,
  nameLast: nameLast,
  handleStr: handleStr,
  password: password,
  permissionId: permissionId
}
export type internalUsers = internalUser[];

export type internalChannel = {
  channelId: channelId,
  name: name,
  ownerMembers: internalUsers,
  allMembers: internalUsers,
  messages: Message[],
  isPublic: isPublic,
};
export type internalNotification = {
  uId: uId,
  notifications: notifications[]
};

export type internalNotifications = internalNotification[];