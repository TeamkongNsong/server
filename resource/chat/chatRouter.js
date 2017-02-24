// const chatRouter = require('express').Router();
// const chatController = require('./chatController');
// const chatS3 = require('./chats3');
// /*===========================================
//                 정렬 순서
//                  * GET
//                  * POST
//                  * PUT
//                  * DELETE
// ===========================================*/
chatRouter.route('/')
.post(chatController.sendMessage);

module.exports = chatRouter;
