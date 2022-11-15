import { FORBIDDEN, BAD_REQUEST } from './other';
import {
  clearV1, authRegisterV1, userProfileUploadPhotoV1, userProfileV1
} from './wrapperFunctions';

beforeEach(() => {
  clearV1();
});
const MOSS_PHOTO = 'http://cdn.comedy.co.uk/images/library/people/180x200/t/the_it_crowd_moss.jpg';
const PNG_PHOTO = 'https://www.transparentpng.com/download/water/xtbsSV-water-hd-photo.png';

describe('Testing user/profile/uploadphoto/v1 success handling', () => {
  test('correct return type after uploading photo', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const result = userProfileUploadPhotoV1(user1.token, MOSS_PHOTO, 0, 0, 50, 50);
    expect(result).toMatchObject({});
  });
  test('default photo returned in userProfileV1', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const result = userProfileV1(user1.token, user1.authUserId);
    expect(result.user).toMatchObject({
      uId: user1.authUserId,
      email: 'hangpham@gmail.com',
      nameFirst: 'Hang',
      nameLast: 'Pham',
      handleStr: 'hangpham',
      profileImgUrl: expect.stringMatching(/\.jpg$/),
    });
  });
  test('uploaded photo returned in userProfileV1 is different to first user profile', () => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const beforeUpload = userProfileV1(user1.token, user1.authUserId);
    userProfileUploadPhotoV1(user1.token, MOSS_PHOTO, 0, 0, 50, 50);
    const afterUpload = userProfileV1(user1.token, user1.authUserId);
    expect(beforeUpload.user.profileImgUrl).not.toEqual(afterUpload.user.profileImgUrl);
  });
});
describe('Testing user/profile/uploadphoto/v1 error case handling', () => {
  test.each([
    {
      desc: 'Token is invalid',
      token: 'InvalidToken',
      imgUrl: MOSS_PHOTO,
      xStart: 0,
      yStart: 0,
      xEnd: 100,
      yEnd: 100,
      statusCode: FORBIDDEN
    },
    {
      desc: 'imgUrl invalid',
      token: '',
      imgUrl: 'http://totallynotreal.com.au/picture.jpg',
      xStart: 0,
      yStart: 0,
      xEnd: 100,
      yEnd: 100,
      statusCode: BAD_REQUEST
    },
    {
      desc: 'xStart coordinate out of bounds',
      token: '',
      imgUrl: MOSS_PHOTO,
      xStart: 5000,
      yStart: 0,
      xEnd: 100,
      yEnd: 100,
      statusCode: BAD_REQUEST
    },
    {
      desc: 'yStart coordinate out of bounds',
      token: '',
      imgUrl: MOSS_PHOTO,
      xStart: 0,
      yStart: 1000,
      xEnd: 100,
      yEnd: 100,
      statusCode: BAD_REQUEST
    },
    {
      desc: 'xEnd coordinate out of bounds',
      token: '',
      imgUrl: MOSS_PHOTO,
      xStart: 0,
      yStart: 0,
      xEnd: 1000,
      yEnd: 100,
      statusCode: BAD_REQUEST
    },
    {
      desc: 'yEnd coordinate out of bounds',
      token: '',
      imgUrl: MOSS_PHOTO,
      xStart: 0,
      yStart: 0,
      xEnd: 100,
      yEnd: 1000,
      statusCode: BAD_REQUEST
    },
    {
      desc: 'xEnd is less than or equal to xStart',
      token: '',
      imgUrl: MOSS_PHOTO,
      xStart: 20,
      yStart: 0,
      xEnd: 20,
      yEnd: 100,
      statusCode: BAD_REQUEST
    },
    {
      desc: 'yEnd is less than or equal to yStart',
      token: '',
      imgUrl: MOSS_PHOTO,
      xStart: 0,
      yStart: 20,
      xEnd: 100,
      yEnd: 20,
      statusCode: BAD_REQUEST
    },
    {
      desc: 'image is not a .jpg',
      token: '',
      imgUrl: PNG_PHOTO,
      xStart: 0,
      yStart: 20,
      xEnd: 100,
      yEnd: 20,
      statusCode: BAD_REQUEST
    },

  ])('$desc', ({ token, imgUrl, xStart, yStart, xEnd, yEnd, statusCode }) => {
    const user1 = authRegisterV1('hangpham@gmail.com', 'password', 'Hang', 'Pham');
    const result = userProfileUploadPhotoV1(user1.token + token, imgUrl,
      xStart, yStart, xEnd, yEnd);

    expect(result.statusCode).toBe(statusCode);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
