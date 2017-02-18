const flagRouter = require('express').Router();
const flagController = require('./flagController');

/*===========================================
                정렬 순서
                 * GET
                 * POST
                 * PUT
                 * DELETE
===========================================*/
// flag on map
flagRouter.route('/')
.get(flagController.getAllFlags)
.delete(flagController.deleteAllFlags);

flagRouter.route('/me')
.get(flagController.getMyFlags)
.post(flagController.pinFlag)
.delete(flagController.deleteMapFlag);

flagRouter.route('/check/:idx')
.get(flagController.isMatchUserSelf);


module.exports = flagRouter;
