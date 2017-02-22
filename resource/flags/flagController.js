const knex = require('../../model/knex.js');
const config = require('../../config.js');

/*===========================================
/*===========================================
/*===========================================
                   COMMON
/*===========================================
/*===========================================
*===========================================*/
const handleValidation = (req, res, keyValues, locatedIn) => {
    if (locatedIn === 'headers') {
        const headers = keyValues;
        for (let key in headers) {
            if (key === 'id_token') {
                key = 'x-access-token';
            }
            req.checkHeaders(`${key}`, `${key} is required`).notEmpty();
        }
    } else if (locatedIn === 'params') {
        const params = keyValues;
        for (let key in params) {
            req.checkParams(`${key}`, `${key} is required`).notEmpty();
        }
    } else if (locatedIn === 'body') {
        const body = keyValues;
        for (let key in body) {
            if (key === body.password2) {
                req.checkBody(`${key}`, `${key} is required`).equal(body.password);
            }
            req.checkBody(`${key}`, `${key} is required`).notEmpty();
        }
    } else if (locatedIn === 'query') {
        const query = keyValues;
        for (let key in query) {
            req.checkQuery(`${key}`, `${key} is required`).notEmpty();
        }
    }

    const err = req.validationErrors();
    if (err) {
        handleError(err);
        res.status(400).json({
            msg: 'validation errors!',
            err: err.message,
            statusCode: 400,
        });
        return false;
    }
    return true;
};

const handleError = (err, res) => {
    console.log('err', err);
    res.end();
};


/*================================================
                       FLAGS
================================================*/
/*
 * GET - get all flags
 */
exports.getAllFlags = (req, res) => {
    const { service_issuer, device_info } = req.headers;
    const id_token = req.headers['x-access-token'];
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };
    if (handleValidation(req, res, headers, 'headers')) {
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
    }
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
        .then((result) => {
            if(!result) return Promise.reject('deleteAllFlags ERR');
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
    const { service_issuer, device_info } = req.headers;
    const id_token = req.headers['x-access-token'];
    const { title, message, region } = req.body;
    const { latitude, longitude } = req.body.region;
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };
    const body = {
        title,
        message,
        region,
    };


    if ((handleValidation(req, res, headers, 'headers')) && (handleValidation(req, res, body, 'body'))) {
        knex('user')
            .where({
                id_token,
            })
            .then((data) => {
                const idx = data[0].idx;
                const nickname = data[0].nickname;
                return knex('user_flag')
                    .insert({
                        user_idx: idx,
                        nickname,
                        title,
                        message,
                        latitude,
                        longitude,
                        created_at: config.dateNow(),
                    })
                    .then((result) => {
                        if (!result) return Promise.reject('pinFlag ERR');
                        res.json({
                            nickname,
                            msg: "You got a flag!",
                            logInfo: {
                                device_info,
                                date: config.dateNow(),
                            },
                        });
                    });
            })
            .catch(handleError);
    }
};

/*
 * DELETE
 */
exports.deleteMapFlag = (req, res) => {
    const { service_issuer, device_info } = req.headers;
    const id_token = req.headers['x-access-token'];
    const { idx } = req.body;
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };
    const body = {
        idx,
    };

    if ((handleValidation(req, res, headers, 'headers')) && (handleValidation(req, res, body, 'body'))) {
        knex('user_flag')
            .where({
                idx,
            })
            .del()
            .then((result) => {
                if (!result) return Promise.reject('deleteMapFlag ERR');
                res.json({
                    msg: "deleted message succesfully!",
                    logInfo: {
                        device_info,
                    },
                });
            })
            .catch(handleError);
    }
};


/*================================================
                        CHECK
================================================*/
/*---------------flags/check/:idx--------------*/
/*
 * GET: 깃발 누른 사람과 닉네임이 매치하는 지 true, false로 응답
 */
exports.isMatchUserSelf = (req, res) => {
    const { service_issuer, device_info } = req.headers;
    const id_token = req.headers['x-access-token'];
    const { idx } = req.params;
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };
    const params = {
        idx,
    };

    if ((handleValidation(req, res, headers, 'headers')) && (handleValidation(req, res, params, 'params'))) {
        knex('user_flag')
            .where({
                idx,
            })
            .then((flag) => {
                if (!flag.length) return Promise.reject('isMatchUserSelf ERR');
                const nickname = flag[0].nickname;
                return knex('user')
                    .where({
                        nickname,
                    })
                    .select('id_token')
                    .then((data) => {
                        if (!data.length) return Promise.reject('isMatchUserSelf ERR');
                        const check = (data[0].id_token === id_token) ? true : false;
                        res.json({
                            check,
                            logInfo: {
                                device_info,
                            },
                        });
                    });
            })
            .catch((err) => handleError(err, res));
    }
};
