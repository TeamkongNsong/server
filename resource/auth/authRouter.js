const authRouter = require('express').Router();
const authController = require('./authController');

/*===========================================
                정렬 순서
                 * GET
                 * POST
                 * PUT
                 * DELETE
===========================================*/

/*===========================================
                auth WIKI
===========================================*/
authRouter.route('/wiki/sign-up')
.post(authController.signUpByWiki);

authRouter.route('/wiki/sign-in')
.post(authController.signInByWiki);

authRouter.route('/wiki/sign-out')
.put(authController.signOutByWiki);

/*===========================================
                auth GOOGLE
===========================================*/
authRouter.route('/google/register')
.post(authController.registerToken);

authRouter.route('/google/sign-up')
.put(authController.signUpBygoogle);

authRouter.route('/google/sign-out')
.put(authController.signOutByGoogle);

authRouter.route('/google/newToken')
.put(authController.newToken);

/*===========================================
                COMMON
===========================================*/
authRouter.route('/common/check/nickname')
.get(authController.checkNickname);

authRouter.route('/common/nickname')
.put(authController.enrollNickname);


module.exports = authRouter;
