const flagRouter = require('express').Router();
const flagController = require('./flagController');

/* route 순서
 * GET,
 * POST,
 * PUT,
 * DELETE
 */

flagRouter.route('/')
.get(flagController.returnFlags)
.post(flagController.insertFlag);



module.exports = flagRouter;
