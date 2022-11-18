import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import fs from 'fs';
import request from 'sync-request';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import { clearV1 } from './other';
import { authLoginV1, authRegisterV1, authLogoutV1, authPasswordResetRequestV1 } from './auth';
import { getData, setData } from './dataStore';
import {
  channelDetailsV1, channelInviteV1, channelJoinV1, channelMessagesV1,
  channelAddOwnerV1, channelLeaveV1, channelRemoveOwnerV1
} from './channel';
import { channelsCreateV1, channelsListAllV1, channelsListV1 } from './channels';
import {
  userProfileSetNameV1, userProfileSetEmailV1, userProfileSetHandleV1,
  userProfileV1, usersAllV1, userProfileUploadPhotoV1, usersStatsV1
} from './users';

import {
  messageSendV1, messageEditV1, messageRemoveV1, messageReactV1, searchV1, messageShareV1,
  messageSendlaterV1, messageSendlaterdmV1, messagePinV1, messageUnreactV1, messageUnpinV1
} from './message';

import { notificationsGetV1 } from './notifications';
import { dmCreateV1, dmDetailsV1, messageSendDmV1, dmMessagesV1, dmListV1, dmLeaveV1, dmRemoveV1 } from './dm';
import { standupSendV1, standupStartV1, standupActiveV1 } from './standup';
import { adminUserRemoveV1, adminUserPermissionChangeV1 } from './admin';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Get data. If datastore file exists, then update data to match datastore
let data = getData();
if (fs.existsSync('./dataStore.json')) {
  const dbStr = fs.readFileSync('./dataStore.json');
  data = JSON.parse(String(dbStr));
  setData(data);
}

// Function to fetch current datastore and store into datastore file
const save = () => {
  data = getData();
  const jsonStr = JSON.stringify(data);
  fs.writeFileSync('./dataStore.json', jsonStr);
};

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

app.post('/admin/userpermission/change/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { uId, permissionId } = req.body;
  res.json(adminUserPermissionChangeV1(token, uId, permissionId));
});

app.delete('/clear/v1', (req: Request, res: Response, next) => {
  res.json(clearV1());
  save();
});

app.post('/auth/register/v3', (req: Request, res: Response, next) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV1(email, password, nameFirst, nameLast));
  save();
});

app.post('/channels/create/v3', (req: Request, res: Response, next) => {
  const { name, isPublic } = req.body;
  const token = req.header('token');
  res.json(channelsCreateV1(token, name, isPublic));
  save();
});

app.get('/channels/list/v3', (req:Request, res: Response, next) => {
  const token = req.header('token');
  res.json(channelsListV1(token));
  save();
});

app.get('/channels/listall/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(channelsListAllV1(token));
  save();
});

app.post('/channel/invite/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  res.json(channelInviteV1(token, channelId, uId));
  save();
});

app.post('/channel/leave/v2', (req:Request, res: Response, next) => {
  const { channelId } = req.body;
  const token = req.header('token');
  res.json(channelLeaveV1(token, channelId));
  save();
});

app.post('/channel/addowner/v2', (req:Request, res:Response, next) => {
  const { channelId, uId } = req.body;
  const token = req.header('token');
  res.json(channelAddOwnerV1(token, channelId, uId));
  save();
});

app.post('/channel/removeowner/v2', (req:Request, res: Response, next) => {
  const { channelId, uId } = req.body;
  const token = req.header('token');
  res.json(channelRemoveOwnerV1(token, channelId, uId));
  save();
});

app.get('/channel/messages/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  res.json(channelMessagesV1(token, channelId, start));
});

app.get('/user/profile/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  res.json(userProfileV1(token, uId));
  save();
});

app.put('/user/profile/setname/v2', (req: Request, res: Response, next) => {
  const { nameFirst, nameLast } = req.body;
  const token = req.header('token');
  res.json(userProfileSetNameV1(token, nameFirst, nameLast));
  save();
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response, next) => {
  const { email } = req.body;
  const token = req.header('token');
  res.json(userProfileSetEmailV1(token, email));
  save();
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response, next) => {
  const { handleStr } = req.body;
  const token = req.header('token');
  res.json(userProfileSetHandleV1(token, handleStr));
  save();
});

app.post('/user/profile/uploadphoto/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
  res.json(userProfileUploadPhotoV1(token, imgUrl, xStart, yStart, xEnd, yEnd));
  save();
});

app.get('/users/all/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(usersAllV1(token));
  save();
});

app.get('/users/stats/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(usersStatsV1(token));
  save();
});

app.post('/auth/login/v3', (req: Request, res: Response, next) => {
  const email = req.body.email as string;
  const password = req.body.password as string;
  res.json(authLoginV1(email, password));
  save();
});

app.post('/channel/join/v3', (req: Request, res: Response, next) => {
  const { channelId } = req.body;
  const token = req.header('token');
  res.json(channelJoinV1(token, channelId));
  save();
});

app.get('/channel/details/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  res.json(channelDetailsV1(token, channelId));
  save();
});

app.post('/auth/logout/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(authLogoutV1(token));
  save();
});

app.post('/message/send/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = parseInt(req.body.channelId as string);
  const message = req.body.message as string;
  res.json(messageSendV1(token, channelId, message));
  save();
});

app.put('/message/edit/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const messageId = parseInt(req.body.messageId as string);
  const message = req.body.message as string;
  res.json(messageEditV1(token, messageId, message));
  save();
});

app.post('/dm/leave/v2', (req: Request, res: Response, next) => {
  const { dmId } = req.body;
  const token = req.header('token');
  res.json(dmLeaveV1(token, dmId));
  save();
});

app.delete('/message/remove/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const messageId = parseInt(req.query.messageId as string);
  res.json(messageRemoveV1(token, messageId));
  save();
});

app.post('/message/senddm/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = parseInt(req.body.dmId as string);
  const message = req.body.message as string;
  res.json(messageSendDmV1(token, dmId, message));
  save();
});

app.post('/message/sendlater/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = parseInt(req.body.channelId as string);
  const message = req.body.message as string;
  const timeSent = parseInt(req.body.timeSent as string);
  res.json(messageSendlaterV1(token, channelId, message, timeSent));
  save();
});

app.post('/message/react/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const messageId = parseInt(req.body.messageId as string);
  const reactId = parseInt(req.body.reactId as string);
  res.json(messageReactV1(token, messageId, reactId));
  save();
});

app.post('/dm/create/v2', (req: Request, res: Response, next) => {
  const { uIds } = req.body;
  const token = req.header('token');
  res.json(dmCreateV1(token, uIds));
  save();
});

app.delete('/dm/remove/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  res.json(dmRemoveV1(token, dmId));
  save();
});

app.get('/dm/details/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  res.json(dmDetailsV1(token, dmId));
  save();
});

app.get('/dm/messages/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  res.json(dmMessagesV1(token, dmId, start));
  save();
});

app.get('/notifications/get/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(notificationsGetV1(token));
  save();
});
app.get('/search/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const queryStr = req.query.queryStr as string;
  res.json(searchV1(token, queryStr));
  save();
});

app.post('/message/share/v1', (req: Request, res: Response, next) => {
  const { ogMessageId, message, channelId, dmId } = req.body;
  const token = req.header('token');
  res.json(messageShareV1(token, ogMessageId, message, channelId, dmId));
  save();
});

app.post('/message/sendlaterdm/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = parseInt(req.body.dmId as string);
  const message = req.body.message as string;
  const timeSent = parseInt(req.body.timeSent as string);
  res.json(messageSendlaterdmV1(token, dmId, message, timeSent));
  save();
});

app.get('/dm/list/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(dmListV1(token));
  save();
});

app.post('/standup/send/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { channelId } = req.body;
  const message = req.body.message as string;
  res.json(standupSendV1(token, channelId, message));
});

app.post('/standup/start/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { channelId } = req.body;
  const { length } = req.body;
  res.json(standupStartV1(token, channelId, length));
  save();
});

app.delete('/admin/user/remove/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  res.json(adminUserRemoveV1(token, uId));
  save();
});

app.get('/channel/details/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  res.json(channelDetailsV1(token, channelId));
  save();
});

app.post('/message/unreact/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const messageId = parseInt(req.body.messageId as string);
  const reactId = parseInt(req.body.reactId as string);
  res.json(messageUnreactV1(token, messageId, reactId));
});

app.post('/message/pin/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const messageId = parseInt(req.body.messageId as string);
  res.json(messagePinV1(token, messageId));
});

app.post('/message/unpin/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const messageId = parseInt(req.body.messageId as string);
  res.json(messageUnpinV1(token, messageId));
  save();
});

app.post('/auth/passwordreset/request/v1', (req: Request, res: Response, next) => {
  const { email } = req.body;
  res.json(authPasswordResetRequestV1(email));
});

app.get('/standup/active/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  res.json(standupActiveV1(token, channelId));
  save();
});

// handles errors nicely
app.use(errorHandler());

// for logging errors (print to terminal)
app.use(morgan('dev'));

// Serving files within static folder
app.use('/static', express.static('static'));
if (!fs.existsSync('static')) {
  fs.mkdirSync('static');
}
// Set up default photo
const DEFAULT_PHOTO = 'http://cdn.comedy.co.uk/images/library/people/180x200/t/the_it_crowd_moss.jpg';
const response = request('GET', DEFAULT_PHOTO);
const responseBody = response.getBody();
fs.writeFileSync('static/defaultpic.jpg', responseBody, { flag: 'w' });

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
