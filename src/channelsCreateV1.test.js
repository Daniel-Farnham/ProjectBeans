import { clearV1 } from './other';
import { channelsCreateV1, channelsListV1 } from './channels';
import { authRegisterV1 } from './auth';

describe('Testing channelsCreateV1', () => {
    test('Test successful channel creation', () => {
        const userId = authRegisterV1('edwin.ngo@student.unsw.edu.au', 'ANicePassword', 'Edwin', 'Ngo');
        const newchannelId = channelsCreateV1(userId, "General", true);
        expect(newchannelId).toStrictEqual({channelId:expect.any(Number)});
    });

    test('Testing Channel Uniqueness', () => {
        const userId = authRegisterV1('edwin.ngo@student.unsw.edu.au', 'ANicePassword', 'Edwin', 'Ngo');
        channelsCreateV1(userId, "General", true);
        const channelId1 = channelsListV1(userId);
        const channelId2 = channelsCreateV1(userId, "Boost", false);
        expect(channelId1.channelId).not.toBe(channelId2.channelId);
    });

    test('Testing invalid authUserId', () => {
        const userId = authRegisterV1('edwin.ngo@student.unsw.edu.au', 'ANicePassword', 'Edwin', 'Ngo');
        const channel = channelsCreateV1(userId, "General", true);
        const ReturnedChannelId = channelsCreateV1(userId + 1, channel.channelId);
        expect(ReturnedChannelId).toStrictEqual(
            {
                error: expect.any(String),
            }
        );
    });

    test('Test if name length is valid', () => {
        test.each([
            {userId: '1', channelname: '', isPublic: 'true', desc: 'Testing if name is less than 1 character' },
            {userId: '1', channelname: 'ThisNameIsNotAllowedBecauseItIsTooLong', isPublic: 'True', desc: 'Testing if name is over 20 characters'},
        ])('$desc', ({userId, channelname, isPublic}) => {
        const newchannelid = channelsCreateV1(userId, channelname, isPublic);
        expect(newchannelid).toMatchObject({error: 'error'});
        });
    });
});