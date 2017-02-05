const userController = require('./controller');
const userRouter = require('express').Router();

userRouter.route('/users')
.post(userController.insertUser);

userRouter.route('/users/matchuser_id/:id')
.get(userController.searchUserId);

userRouter.route('/users/matchuser_nickname/:nickname')
.get(userController.searchUserNickName);


module.exports = userRouter;
