import { FORBIDDEN, BAD_REQUEST } from './other';
import {
  clearV1, authRegisterV1, notificationsGetV1, dmCreateV1, channelMessagesV1,
  channelsCreateV1, messageSendV1, messageReactV1, channelJoinV1, messageSendDmV1,
  dmMessagesV1, userProfileUploadPhotoV1
} from './wrapperFunctions';

beforeEach(() => {
  clearV1();
});
const MOSS_PHOTO = 'http://cdn.comedy.co.uk/images/library/people/180x200/t/the_it_crowd_moss.jpg'

describe('Testing user/profile/uploadphoto/v1 success handling', () => {
  test('correct return type after uploading photo', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const result = userProfileUploadPhotoV1(user1.token, MOSS_PHOTO, 0, 0, 5, 5);
    expect(result).toMatchObject({});
  });

});