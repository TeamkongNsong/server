const knex = require('../../model/knex.js');
const Hangul = require('hangul-js');
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
    }
    return true;
};

const handleError = (err) => {
    console.log('err', err);
};

/*================================================
                      USERS
================================================*/
/*
 * GET - 모든 유저 정보 가져오기
 */
exports.getAllUsers = (req, res) => {
    const { service_issuer, device_info } = req.headers;
    const id_token = req.headers['x-access-token'];
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };

    if (handleValidation(req, res, headers, 'headers')) {
        knex('user')
            .select()
            .then((users) => {
                res.json({
                    users,
                    logInfo: {
                        device_info,
                    },
                });
            })
            .catch(handleError);
    }
};

/*================================================
                        ME
================================================*/
/*
 * GET - 내 정보 가져오기
 */
exports.getMyInfo = (req, res) => {
    const { service_issuer, device_info } = req.headers;
    const id_token = req.headers['x-access-token'];
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };

    if (handleValidation(req, res, headers, 'headers')) {
        knex('user')
            .where({
                id_token,
            })
            .then((user) => {
                res.json({
                    user: user[0],
                    logInfo: {
                        device_info,
                    },
                });
            })
            .catch(handleError);
    }
};

/* TODO: 보류
 * DELETE - 유저 삭제
 */
exports.deleteUser = (req, res) => {
    const { service_issuer, device_info } = req.headers;
    const id_token = req.headers['x-access-token'];
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };
    const { user_id } = req.body;
    const body = {
        user_id,
    };

    if (handleValidation(req, res, headers, 'headers') && handleValidation(req, res, body, 'body')) {
        knex('user_flag')
            .where({
                user_id,
            })
            .del()
            .then((result) => {
                if (!result) Promise.reject('deleteUser, user_flag ERR');
                db.knex('user')
                    .where({
                        user_id,
                    })
                    .del()
                    .then((result) => {
                        if (!result) Promise.reject('deleteUser, user ERR');
                        res.json({
                            msg: "유저 데이터 삭제 완료.",
                            logInfo: {
                                user_id,
                                device_info,
                            },
                        });
                    })
                    .catch(handleError);
            })
            .catch(handleError);
    }
};


/*---------------users/me/state_message---------------*/

/*
 * UPDATE - 상태메세지 업데이트
 */
exports.updateStateMessage = (req, res) => {
    const { service_issuer, device_info } = req.headers;
    const { state_message } = req.body;
    const id_token = req.headers['x-access-token'];
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };
    const body = {
        state_message,
    };

    if (handleValidation(req, res, headers, 'headers') && handleValidation(req, res, body, 'body')) {
        knex('user')
            .where({
                id_token,
            })
            .select('state_message')
            .update({
                state_message,
            })
            .then((result) => {
                if (!result) return Promise.reject('updateStateMessage ERR');
                res.json({
                    msg: `${state_message}`,
                    logInfo: {
                        device_info,
                    },
                });
            })
            .catch(handleError);
    }
};

/*================================================
                    ONE OTHER
================================================*/
/*---------------users/:idx---------------*/
/*
 * GET - 다른 *한 사람* 유저 정보 get하기
 */
exports.getUserInfo = (req, res) => {
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

    if (handleValidation(req, res, headers, 'headers') && handleValidation(req, res, params, 'params')) {
        knex('user')
            .where({
                idx,
            })
            .then((user) => {
                res.json({
                    user: user[0],
                    logInfo: {
                        user_id: user[0].user_id,
                        device_info,
                    },
                });
            })
            .catch(handleError);
    }
};


/*================================================
                      SEARCH
================================================*/
/*---------------users/search/:word---------------*/
/*
 * GET - 유저 초성 검색(main 화면) - 2.11
 */
exports.searchUser = (req, res) => {
    const { service_issuer, device_info } = req.headers;
    const id_token = req.headers['x-access-token'];
    const { word } = req.params;
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };
    const params = {
        word,
    };

    if (handleValidation(req, res, headers, 'headers') && handleValidation(req, res, params, 'params')) {
        knex('user')
            .select()
            .then((users) => {
                const searcher = new Hangul.Searcher(`${word}`);
                const result = [];
                users.forEach((user) => {
                    if (searcher.search(user.nickname) !== -1) {
                        result.push({
                            idx: user.idx,
                            img: user.img,
                            nickname: user.nickname,
                            state_message: user.state_message,
                        });
                    }
                });
                res.json({
                    result,
                    msg: 'here',
                    logInfo: {
                        device_info,
                    },
                });
            });
    }
};


/*================================================
                    MATCH_USER
================================================*/
/*---------------matchuser/:user_id---------------*/
/*
 * GET - 유저 user_id 중복 확인
 */
exports.checkDuplicatedUserId = (req, res) => {
    const { service_issuer, device_info } = req.headers;
    const { user_id } = req.params;
    const headers = {
        service_issuer,
        device_info,
    };
    const params = {
        user_id,
    };

    if (handleValidation(req, res, headers, 'headers') && handleValidation(req, res, params, 'params')) {
        knex('user')
            .where({
                user_id,
            })
            .select('user_id')
            .then((data) => {
                const check = data.length ? true : false;
                res.json({
                    check,
                    logInfo: {
                        user_id,
                        device_info,
                    },
                });
            })
            .catch(handleError);
    }
};
/*---------------matchuser/:nickname---------------*/
/*
 * GET - 유저 닉네임 중복 확인
 */
exports.checkDuplicatedUserNickname = (req, res) => {
    const { service_issuer, device_info } = req.headers;
    const { nickname } = req.params;
    const headers = {
        service_issuer,
        device_info,
    };
    const params = {
        nickname,
    };

    if (handleValidation(req, res, headers, 'headers') && handleValidation(req, res, params, 'params')) {
        knex('user')
            .where({
                nickname,
            })
            .select('nickName')
            .then((data) => {
                const check = data.length ? true : false;
                res.json({
                    check,
                    msg: 'did!',
                    logInfo: {
                        nickname,
                        device_info,
                    },
                });
            })
            .catch(handleError);
    }
};
