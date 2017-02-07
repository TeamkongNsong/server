const userRouter = require('express').Router();
const userController = require('./userController');

userRouter.route('/')
.post(userController.insertUser);

userRouter.route('/matchuser_id/:id')
.get(userController.searchUserId);

userRouter.route('/matchuser_nickname/:nickname')
.get(userController.searchUserNickName);


module.exports = userRouter;
