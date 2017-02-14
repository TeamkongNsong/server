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
.get(flagController.returnAllFlags)
.post(flagController.pinFlag);

flagRouter.route('/:nickname')
.get(flagController.isMatchUserSelf);

flagRouter.route('/:idx')
.delete(flagController.deleteMapFlag);


module.exports = flagRouter;
