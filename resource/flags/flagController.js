const knex = require('../../model/knex.js');
const config = require('../../config.js');

/*================================================
                      COMMON
================================================*/
const handleError = (err) => {
    console.log(err);
};


/*================================================
                       FLAGS
================================================*/
/*
 * GET - get all flags
 */
exports.getAllFlags = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers["x-access-token"];
    const device_info = req.headers.device_info;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();

    knex("user_flag")
        .then((flags) => {
            res.json({
                flags,
                logInfo: {
                    device_info,
                },
            });
        })
        .catch(handleError);
};

/*
 * DELETE
 */
exports.deleteAllFlags = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers['x-access-token'];
    const device_info = req.headers.device_info;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();

    knex('user_flag')
        .del()
        .then(() => {
            res.json({
                msg: "deleted all flags succesfully!",
                logInfo: {
                    device_info,
                },
            });
        })
        .catch(handleError);
};


/*================================================
                       ME
================================================*/
/*
 * POST
 */
exports.pinFlag = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers["x-access-token"];
    const device_info = req.headers.device_info;
    const {
        title,
        message,
    } = req.body;
    const {
        latitude,
        longitude,
    } = req.body.region;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();
    req.checkBody('title', 'title is required').notEmpty();
    req.checkBody('message', 'message is required').notEmpty();
    req.checkBody('latitude', 'latitude is required').notEmpty();
    req.checkBody('longitude', 'longitude is required').notEmpty();

    knex('user')
        .where({
            id_token,
        })
        .then((data) => {
            const idx = data[0].idx;
            const nickname = data[0].nickname;
            knex('user_flag')
                .insert({
                    user_idx: idx,
                    nickname,
                    title,
                    message,
                    latitude,
                    longitude,
                    created_at: config.date,
                })
                .then((data) => {
                    res.json({
                        nickname,
                        msg: "You got a flag!",
                        logInfo: {
                            device_info,
                        },
                    });
                })
                .catch(handleError);
        })
        .catch(handleError);
};

/*
 * DELETE
 */
exports.deleteMapFlag = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers['x-access-token'];
    const device_info = req.headers.device_info;
    const { idx } = req.body;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();
    req.checkBody('idx', 'idx is required').notEmpty();

    knex('user_flag')
        .where({
            idx,
        })
        .del()
        .then(() => {
            res.json({
                msg: "deleted message succesfully!",
                logInfo: {
                    device_info,
                },
            });
        })
        .catch(handleError);
};


/*================================================
                        CHECK
================================================*/
/*---------------flags/check/:idx--------------*/
/*
 * GET: 깃발 누른 사람과 닉네임이 매치하는 지 true, false로 응답
 */
exports.isMatchUserSelf = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers["x-access-token"];
    const device_info = req.headers.device_info;
    const { idx } = req.params;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();
    req.checkParams('idx', 'idx is required').notEmpty();

    knex('user_flag')
        .where({
            idx,
        })
        .then((flag) => {
            const nickname = flag[0].nickname;
            knex('user')
                .where({
                    nickname,
                })
                .select('id_token')
                .then((data) => {
                    const check = (data[0].id_token === id_token) ? true : false;
                    res.json({
                        check,
                        logInfo: {
                            device_info,
                        },
                    });
                })
                .catch(handleError);
        })
        .catch(handleError);
};
