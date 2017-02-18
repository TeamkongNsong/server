const knex = require('../../model/knex.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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


/*========================================
* POST        WIKIS SIGN UP
========================================*/
exports.signUpByWiki = (req, res) => {
    const { user_id, password, password2 } = req.body;
    const body = {
        user_id,
        password,
        password2,
    };

    const genSaltForPassword = (newUser) => {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    return reject(err);
                } else {
                    const data = {
                        password,
                        salt,
                    };
                    resolve(data);
                }
            });
        });
    };

    const hashPassword = (data) => {
        bcrypt.hash(data.password, data.salt, (err, hash) => {
            knex('user')
                .insert({
                    user_id,
                    password: hash,
                })
                .then((result) => {
                    if (!result) return Promise.reject('hashpassword err');
                    res.json({
                        msg: `${user_id}님이 가입하셨습니다.`,
                        statusCode: 200,
                    });
                })
                .catch(handleError);
        });
    };

    if (handleValidation(req, res, body, 'body')) {
        genSaltForPassword(body)
            .then(hashPassword);
    }
};

/*========================================
* POST           SIGN IN
========================================*/
exports.signIn = (req, res) => {
    const secret = req.app.get('jwt-secret');
    const { service_issuer, device_info } = req.headers;
    const id_token = req.headers['x-access-token'];
    const { user_id, password } = req.body;
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };
    const body = {
        user_id,
        password,
    };

    if (handleValidation(req, res, headers, 'headers') && handleValidation(req, res, body, 'body')) {
        return new Promise((resolve, reject) => {
                if (service_issuer === 'wiki') {
                    return checkIdAndPassword(user_id, password)
                        .then((isMatch) => {
                            if (!isMatch) return res.send(isMatch);
                            resolve();
                        });
                } else if (service_issuer === 'google') {
                    return hasAlreadyUser(user_id)
                        .then((check) => {
                            if (check) return resolve(user_id);
                            insertUserInfo(user_id)
                                .then(() => {
                                    resolve();
                                });
                        });

                } else {
                    return res.json({
                        msg: 'check err',
                        err: 'sign-in ERR',
                    });
                }
            })
            .then(() => tokenUpdate(user_id, service_issuer, secret, id_token))
            .then((token) => checkNickname(user_id, token))
            .then((data) => {
                const user_id = data.user_id;
                res.json({
                    data,
                    msg: `${user_id}님이 ${device_info}로 로그인 하셨습니다.`,
                    logInfo: {
                        user_id,
                        device_info,
                    },
                });
            })
            .catch(handleError);
    }
};

//wiki
const checkIdAndPassword = (user_id, password) => {
    return knex('user')
        .where({
            user_id,
        })
        .then((user) => {
            if (!user.length) return Promise.reject('checkIdAndPassword err');
            const hash = user[0].password;
            return bcrypt.compare(password, hash);
        })
        .catch(handleError);
};

const makeToken = (user_id, secret) => {
    return new Promise((resolve, reject) => {
        jwt.sign({
                user_id,
            },
            secret, {
                expiresIn: '7d',
                issuer: 'pmirihss',
                subject: 'userInfo'
            },
            (err, token) => {
                if (err) reject(err);
                resolve(token);
            }
        );
    });
};
/*---------------------절취선-----------------------*/
//google
const hasAlreadyUser = (user_id) => {
    return knex('user')
        .where({
            user_id,
        })
        .then((user) => {
            const check = user.length > 0;
            return check;
        });
};

const insertUserInfo = (user_id) => {
    return knex('user')
        .insert({
            user_id,
            email: user_id,
        });
};


/*---------------------절취선-----------------------*/

const tokenUpdate = (user_id, service_issuer, secret, id_token) => {
    return new Promise((resolve, reject) => {
            if (service_issuer === 'wiki') {
                makeToken(user_id, secret)
                    .then((token) => {
                        resolve(token);
                    });
            } else if (service_issuer === 'google') {
                resolve(id_token);
            }
        })
        .then((token) => {
            return knex('user')
                .where({
                    user_id,
                })
                .update({
                    id_token: token,
                })
                .then((result) => {
                    if (!result) return Promise.reject('tokenUpdate Err');
                    return token;
                })
                .catch(handleError);
        })
        .catch(handleError);
};

const checkNickname = (user_id, token) => {
    return new Promise((resolve, reject) => {
        knex('user')
            .where({
                user_id,
            })
            .then((user) => {
                if (!user.length) Promise.reject('checkNickname ERR');
                const check = user[0].nickname !== null;
                const user_id = user[0].user_id;
                const data = {
                    user_id,
                    check,
                    token,
                };
                resolve(data);
            })
            .catch(handleError);
    });
};
/*========================================*/

/*========================================
* PUT          ENOROLL NICNAME
========================================*/
exports.enrollNickname = (req, res) => {
    const { service_issuer, device_info } = req.headers;
    const id_token = req.headers['x-access-token'];
    const { nickname } = req.body;
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };
    const body = {
        nickname,
    };

    if ((handleValidation(req, res, headers, 'headers')) && (handleValidation(req, res, body, 'body'))) {
        knex('user')
            .where({
                id_token,
            })
            .update({
                nickname,
                device_info,
                created_at: config.date,
            })
            .then((result) => {
                if (!result) return Promise.reject('enrollNickname err');
                res.json({
                    msg: `환영합니다. ${nickname}님, wikius와 즐거운 하루되세요.`,
                    logInfo: {
                        nickname,
                        device_info,
                        created_at: config.date,
                    },
                });
            })
            .catch(handleError);
    }
};


/*========================================
* PUT           SIGN OUT
========================================*/
exports.signOut = (req, res) => {
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
            .update({
                id_token: null,
            })
            .then((result) => {
                if (!result) return Promise.reject('sign-out ERR');
                res.json({
                    msg: `${service_issuer}, ${device_info}로 로그아웃 하였습니다.`,
                    logInfo: {
                        date: config.date,
                        device_info,
                    },
                });
            })
            .catch(handleError);
    }
};


/*========================================
* GET        AUTO SIGN-IN
========================================*/
exports.autoSignIn = (req, res) => {
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
                const user_id = user[0].user_id;
                res.json({
                    check: true,
                    msg: `${user_id}님이 ${device_info}로 자동로그인 하셨습니다.`,
                    logInfo: {
                        user_id,
                        device_info,
                    },
                });
            })
            .catch(handleError);
    }
};


/*========================================
* GET        CHECK NICKNAME
========================================*/
exports.checkNickname = (req, res) => {
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
            .then((data) => {
                const check = data[0].nickname !== null;
                if (!check) Promise.reject('checkNickname ERR');
                res.json({
                    check,
                    msg: `check a boolean.`
                });
            })
            .catch(handleError);
    }
};
