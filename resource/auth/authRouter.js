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

/*===========================================
                COMMON
===========================================*/
authRouter.route('/sign-in')
.post(authController.signIn);

authRouter.route('/sign-out')
.put(authController.signOut);

authRouter.route('/nickname')
.put(authController.enrollNickname);


module.exports = authRouter;
