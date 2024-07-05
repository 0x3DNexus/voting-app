let bcrypt = require('bcrypt');

const encryptPass = async function(password){
    let hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
}

const comparePass = async function(request_password, stored_password){
    let auth_pass = await bcrypt.compare(request_password, stored_password);
    return auth_pass;
}

module.exports = {encryptPass, comparePass};