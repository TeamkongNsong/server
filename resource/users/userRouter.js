const userRouter = require('express').Router();
const userController = require('./userController');
const userS3 = require('./users3');
/*===========================================
                정렬 순서
                 * GET
                 * POST
                 * PUT
                 * DELETE
===========================================*/
/*===========================================
                  CHANGE
===========================================*/
userRouter.route('/')
.get(userController.getAllUsers);

userRouter.route('/me')
.get(userController.getMyInfo)
.delete(userController.deleteUser);

userRouter.route('/me/state_message')
.put(userController.updateStateMessage);

//TODO: swagger.io 추가 요망
userRouter.route('/me/image/:idx')
.get(userS3.getAllProfileImages)
.put(userS3.saveImage);

userRouter.route('/:idx')
.get(userController.getUserInfo);

userRouter.route('/search/:word')
.get(userController.searchUser);

/*----------matchusers id & nickname-------------*/
userRouter.route('/matchuser_id/:user_id')
.get(userController.checkDuplicatedUserId);

userRouter.route('/matchuser_nickname/:nickname')
.get(userController.checkDuplicatedUserNickname);
/*------------------------------------------------*/

module.exports = userRouter;
