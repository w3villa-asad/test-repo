
'use strict';

/***********************************
 **** node module defined here *****
 ***********************************/
require('dotenv').config();
const EXPRESS = require("express");
const CONFIG = require('./config');
/**creating express server app for server */
const app = EXPRESS();



/********************************
 ***** Server Configuration *****
 ********************************/
app.set('port', CONFIG.server.PORT);
app.get("/", (req, res) => {
  // const image =
  //   "https://cdn.pixabay.com/photo/2018/03/31/05/07/blockchain-3277336__340.png";
  // res.send("<h1" + "WELCOME TO BIG HEART FOUNDATION SERVER" + " ></h1>");
  res.send(
    "<h1>Hey, There! You Are Currently Running BIG HEART FOUNDATION SERVER Backend Server</h1>"
  );
});
// app.set("port", port);
app.use('/public', EXPRESS.static('public'));
// configuration to setup socket.io on express server.
const server = require('http').Server(app);
// const io = require('socket.io')(server);
global.io = require('socket.io')(server);


/** Server is running here */
let startNodeserver = async () => {
  // express startup.
  await require(`./app/startup/bigheart/expressStartup`)(app);
  // start socket on server
  await require(`./app/socket/bigheart/socket`).connect(global.io);

  return new Promise((resolve, reject) => {
    server.listen(CONFIG.server.PORT, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};


startNodeserver()
  .then(() => {
    console.log('Node server running on ', CONFIG.server.URL);
  }).catch((err) => {
    console.log('Error in starting server', err);
    process.exit(1);
  });

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error);
});
