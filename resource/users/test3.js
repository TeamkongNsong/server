const knex = require('../../model/knex.js');
const config = require('../../config.js');

// all about me

// get
exports.getMyInfo = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers["x-access-token"];
    const device_info = req.headers.device_info;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();

    knex('user')
    .where({
        id_token,
    })
    .then((user) => {
        console.log(user);
        res.json({
            user: user[0],
        });
    })
    .catch(handleError);
};

// del
exports.deleteMyInfo = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers["x-access-token"];
    const device_info = req.headers.device_info;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();

    knex('user')
    .where({
        id_token,
    })
    .del()
    .then(() => {
        res.json({
            msg: 'see you again.'
        });
    })
    .catch(handleError);
};

//put
exports.updateMyInfo = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers["x-access-token"];
    const device_info = req.headers.device_info;
    const subject = req.headers.subject;
    const { nickname, state_message, img } = req.body;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();

    if (subject === 'nickname') {
        knex('user')
        .where({
            id_token,
        })
        .update({
            nickname,
        })
        .then(() => {
            knex('user_flag')
            .where({
                nickname,
            })
            .update({
                nickname,
            });
        })
        .catch(handleError);
    } else if (subject === 'state_message') {
        knex('user')
        .where({
            id_token,
        })
        .update({
            state_message,
        })
        .then(() => {
            res.json({
                state_message,
            });
        })
        .catch(handleError);
    } else if (subject === 'img') {
        knex('user')
        .where({
            id_token,
        })
        .update({
            state_message,
        })
        .then(() => {
            res.json({
                img,
            });
        })
        .catch(handleError);
    }
};
