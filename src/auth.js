// authLoginV1 function with stub response
function authLoginV1(authUserId, email, password) {
    return {
        authUserId: 1,
    };
}

// authRegisterV1 function with stub response
function authRegisterV1(email, password, nameFirst, nameLast) {
    return {
        authUserId: 1,
    };
}

export { authLoginV1, authRegisterV1 }; 
