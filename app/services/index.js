
const CONFIG = require('../../config');
/********************************
 **** Managing all the services ***
 ********* independently ********
 ********************************/
module.exports = {
    userService: require(`./bigheart/userService`),
    swaggerService: require(`./bigheart/swaggerService`),
    authService: require(`./bigheart/authService`),
    sessionService: require(`./bigheart/sessionService`),
    socketService: require(`./bigheart/socketService`),
    fileUploadService: require(`./bigheart/fileUploadService`)
};