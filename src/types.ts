// Iteration 0 Types
export type email =  string;
export type password =  string;
export type message =  string;
export type start =  number;
export type name =  string;
export type is =  boolean
export type uId = number;

// Iteration 1 Types
export type length = number;
export type time = number;
export type messageId = number;
export type channelId = number;
export type handleStr = string;
export type nameFirst = string;
export type nameLast = string;

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

// Iteration 2 Types
export type token = string;
export type dmId = number;
export type dm = {
  dmId: dmId,
  name: name,
  creator: uId,
  members: user[],
  messages: message[],
};
export type dms = dm[];
export type uIds = uId[];

// Iteration 3 Types
export type reactId = number;
export type isThisUserReacted = boolean;
export type react = {
  reactId: reactId,
  uIds: uIds,
  isThisUserReacted: isThisUserReacted,
};
export type reacts = react[];
export type notificationMessage = string;
export type notification = {
  channelId: channelId,
  dmId: dmId,
  notificationMessage: notificationMessage,
};
export type notifications = notification[];

export type isPinned = boolean;
export type Message = {
  messageId: messageId,
  uId: uId,
  message: message,
  timeSent: time,
  reacts: reacts,
  isPinned: isPinned,
};

export type messages = Message[];