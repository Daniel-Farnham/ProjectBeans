1. For channelMessagesV1, the parameter start is defined to just be an integer. However integers can be negative, whereas array indices cannot. So if a negative start value is passed into channelMessagesV1 we have assumed this is an error, since it naturally has undefined behaviour, and so the function returns a relevant error message.

2. authRegisterV1 uses the validator function to test if the email is valid. We're unsure of whether validator returns an email to be valid if it's a real email or if the email address is simply of the correct format (e.g. foo@bar.com). We assumed that we need to be using real emails and so authRegisterV1.test.js uses our real student emails.

3. After a new account is registered using authRegisterV1, we never logged into that account using authLoginV1. Since both authRegisterV1 and authLoginV1 return an authUserId, we have assumed that it is unnecessary to login to an account immediately after it has been registered since they would return the same id.

4. For channelsListAllV1, it is assumed that when executing the function where no channels have been created, the function will return an object containing an empty channels array.

5. In channelsCreateV1 we assume that we can have multiple channels with the same name. Meaning that in other functions such as channelDetailsV1, channelJoinV1 channelId is used to differentiate between channels. 

6. Emails are case insensitive and email has just been defined to be of type string. This means there is no restriction on whether variations of the same email with different amounts of capitalization are passed in to authRegisterV1 or authLoginV1. So, we have assumed that we must handle these variations by storing and comparing emails with their lower case versions to ensure they remain case insensitive.

