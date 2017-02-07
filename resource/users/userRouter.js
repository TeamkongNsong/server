const userRouter = require('express').Router();
const userController = require('./userController');

/* route 순서
 * GET,
 * POST,
 * PUT,
 * DELETE
 */

userRouter.route('/')
.post(userController.insertUser);

userRouter.route('/:id')
.get(userController.retrieveUser);

userRouter.route('/matchuser_id/:id')
.get(userController.checkUserId);

userRouter.route('/matchuser_nickname/:nickname')
.get(userController.checkUserNickName);


module.exports = userRouter;
