```javascript
let data = {
    // TODO: insert your data structure that contains 
    // users + channels here
  users: [
    {
      uId: 10,
      email: 'ada.l@gmail.com',
      nameFirst: 'Ada',
      nameLast: 'Lovelace',
      handleStr: 'adalovelace',
      password: 'P@ssword',
      permissionId: 1,
    },
    {
      uId: 20,
      email: 'jane.doe@gmail.com',
      nameFirst: 'Jane',
      nameLast: 'Doe',
      handleStr: 'janedoe',
      password: 'P@ssword',
      permissionId: 2,
    },
  ],

  channels: [
    {
      channelId: 1,
      name: 'W17C_BOOST',
      ownerMembers: [
        {
          uId: 10,
          email: 'ada.l@gmail.com',
          nameFirst: 'Ada',
          nameLast: 'Lovelace',
          handleStr: 'adalovelace',
          password: 'P@ssword',
          permissionId: 1,
        },
      ],
      allMembers: [
        {
          uId: 10,
          email: 'ada.l@gmail.com',
          nameFirst: 'Ada',
          nameLast: 'Lovelace',
          handleStr: 'adalovelace',
          password: 'P@ssword',
          permissionId: 1,
        },
        {
          uId: 20,
          email: 'jane.doe@gmail.com',
          nameFirst: 'Jane',
          nameLast: 'Doe',
          handleStr: 'janedoe',
          password: 'P@ssword',
          permissionId: 2,
       },
      ],
      messages: [
        {
          messageId: 0,
          uId: 10,
          message: "Hello",
          timeSent: 1665037588,
        },
        {
          messageId: 1,
          uId: 20,
          message: "Hello",
          timeSent: 1665037580,
        },
       
      ],
      isPublic: true,
    },
  ],
}

```

[Optional] short description: 

- messagesObject:
``` javascript
messages: [
    {
      messageId: 1,
      uId: 1,
      message: 'Hello world',
      timeSent: 1582426789,
    }
  ],
  start: 0,
  end: 50,
  ```
