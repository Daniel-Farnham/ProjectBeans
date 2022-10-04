// channelsListV1 function with stub response
function channelsListV1(authUserId) {
    return {
        channels: [
          {
            channelId: 1,
            name: 'My Channel',
          }
        ],
    };
}

// channelsListAllV1 function with stub response
function channelsListAllV1(authUserId) {
    return {
        channels: [
          {
            channelId: 1,
            name: 'My Channel',
          }
        ],
    };
}

// channelsCreateV1 function with stub response
function channelsCreateV1 (authUserId, name, isPublic) {
  return {
    channelId: 1,
  };
}

export { channelsCreateV1 }
