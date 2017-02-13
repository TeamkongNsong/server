const userRouter = require('express').Router();
const userController = require('./userController');

/* route 순서
 * GET,
 * POST,
 * PUT,
 * DELETE
 */

// users
userRouter.route('/')
.put(userController.updateUser);

// users/:id
userRouter.route('/:user_id')
.get(userController.retrieveUser)
.delete(userController.deleteUser);


//users/search/
userRouter.route('/search/:word')
.get(userController.searchUser);


// users profile
//TODO: 닉네임 업데이트, -> 1주일에 한 번 가능하도록.
// userRouter.route('/profile/nickname')
// .put(userController.updateNickname);
//
// userRouter.route('/profile/state_message')
// .put(userController.updateStateMessage);

//TODO: 프로필 초기 이미지 어떻게 할 것인지에 대해 생각 해 볼 필요가 있음.
// userRouter.route('/profile/img')
// .post(userController.retrieveUserimg)
// .put(userController.updateUserimg)
// .delete(userController.deleteUserimg)

/*----------matchusers id & nickname-------------*/
userRouter.route('/matchuser_id/:user_id')
.get(userController.checkDuplicatedUserId);

userRouter.route('/matchuser_nickname/:nickname')
.get(userController.checkDuplicatedUserNickname);
/*------------------------------------------------*/

module.exports = userRouter;
