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
                WIKI
===========================================*/
authRouter.route('/wiki/sign-up')
.post(authController.signUpByWiki);

authRouter.route('/wiki')
.get(authController.autoSignIn);

/*===========================================
                COMMON
===========================================*/
authRouter.route('/sign-in')
.post(authController.signIn);

authRouter.route('/sign-out')
.put(authController.signOut);

authRouter.route('/nickname')
.put(authController.enrollNickname);

authRouter.route('/check/nickname')
.get(authController.checkNickname);



module.exports = authRouter;
