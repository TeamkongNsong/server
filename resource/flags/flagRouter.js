const flagRouter = require('express').Router();
const flagController = require('./flagController');

/* route 순서
 * GET,
 * POST,
 * PUT,
 * DELETE
 */

// flag on map
flagRouter.route('/')
.get(flagController.returnAllFlags)
.post(flagController.pinFlag);

flagRouter.route('/:nickname')
.get(flagController.isMatchNicknmae);

flagRouter.route('/:idx')
.delete(flagController.deleteMapFlag);


module.exports = flagRouter;
