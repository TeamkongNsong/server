const friendRouter = require('express').Router();
const friendController = require('./friendController');
/*===========================================
                정렬 순서
                 * GET
                 * POST
                 * PUT
                 * DELETE
===========================================*/
/*===========================================
                  FRIENDS
===========================================*/
// friendRouter.route('/')
// .get(friendController.getAllFriends);


/*===========================================
                  FRIENDS
===========================================*/
friendRouter.route('/me')
.get(friendController.getMyFriends)
.post(friendController.addFriend)
.put(friendController.handleFriendStatus)
.delete(friendController.deleteFriendStatus);


module.exports = friendRouter;
