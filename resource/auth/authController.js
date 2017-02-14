const knex = require('../../model/knex.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config.js');
const checkNickname = require('./check.js').checkNickname;

/*--------------wiki/sign-up/--------------*/
/*
 * POST 위키 유저 생성 및 등록.
 */
exports.signUpByWiki = (req, res) => {
    const { user_id, password, password2 } = req.body;
    const newUser = {
        user_id,
        password,
        password2,
    };

    req.checkBody('user_id', 'user_id is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Connfirm passwords do not match').equals(newUser.password);

    const genSaltForPassword = (newUser) => {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    reject(err);
                } else {
                    const data = {
                    password: newUser.password,
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
            .then((data) => {
                res.json({
                    msg: `${newUser.user_id}님이 가입하셨습니다.`,
                    statusCode: 202,
                });
            })
            .catch((err) => {
                res.json({
                        msg: err
                });
            });
        });
    };

    const errors = req.validationErrors();

    if (errors) {
        res.json({
            msg: errors
        });
    } else {
        genSaltForPassword(newUser)
        .then(hashPassword)
        .catch((err) => {
            res.json({
                msg: `err on getSaltForPassword :: ${err}`,
            });
        });
    }
};

/*--------------wiki/sign-in/--------------*/
/*
 * POST 위키 유저 로그인시 토큰 발행
 */
exports.signInByWiki = (req, res) => {
    const { user_id, password } = req.body;
    const service_issuer = req.headers.service_issuer;
    const device_info = req.headers.device_info;
    const secret = req.app.get('jwt-secret');

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();
    req.checkBody('user_id', 'user_id is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        res.json({
            msg: errors
        });
    } else {
        knex('user')
        .where({
            user_id,
        })
        .then((user) => {
            const hash = user[0].password;
            bcrypt.compare(password, hash, (err, isMatch) => {
                if (err) throw err;
                else if (isMatch) {
                    return new Promise((resolve, reject) => {
                        jwt.sign(
                            {
                                user_id: user.user_id,
                            },
                            secret,
                            {
                                expiresIn: '7d',
                                issuer: 'pmirihss',
                                subject: 'userInfo'
                            },
                            (err, token) => {
                                if (err) reject(err);
                                resolve(token);
                            }
                        );
                    })
                    .then((token) => {
                        knex('user')
                        .where({
                            user_id: user[0].user_id
                        })
                        .update({
                            id_token: token,
                        })
                        .then((data) => {
                            let check;
                            knex('user')
                            .where({
                                user_id,
                            })
                            .select('nickname')
                            .then((data) => {
                                const nickname = data[0].nickname;
                                check = nickname !== null ? true : false;
                                res.json({
                                    msg: 'logged in successfully',
                                    token,
                                    check: `${check}`,
                                });
                            })
                            .catch((err) => {
                                error = err.message;
                            });
                        })
                        .catch((err) => {
                            res.status(403).json({
                                msg: err.message,
                            });
                        });
                    })
                    .catch((err) => {
                        res.status(400).json({
                            msg: err.message,
                        });
                    });
                }
            });
        })
        .catch((err) => {
            res.status(404).json({
                msg: err.message,
            });
        });
    }
};


/*--------------wiki/sign-out/--------------*/
/*
 * DELETE 위키 유저 로그아웃시 토큰 초기화
 */
exports.signOutByWiki = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers["x-access-token"];
    const device_info = req.headers.device_info;
    const { user_id } = req.body;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();
    req.checkBody('user_id', 'user_id is required').notEmpty();

    knex('user')
    .where({
        id_token,
    })
    .update({
        id_token: null,
    })
    .then((data) => {
        console.log(data);
        res.json({
            msg: `${service_issuer}, ${user_id}님이 ${device_info}로 로그아웃 하였습니다.`,
            logInfo: {
                user_id,
                device_info,
            },
            statusCode: 202,
        });
        res.end();
    })
    .catch((err) => {
        res.json({
            msg: err,
            statusCode: 404,
        });
    });
};

// /*--------------google/register/--------------*/
// /*
//  * POST - 구글의 토큰 등록.
//  */
exports.registerToken = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers['x-access-token'];
    const device_info = req.headers.device_info;
    const { username } = req.body;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();
    req.checkBody('username', 'username is required').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        res.json({
            errors,
        });
        res.end();
    } else {
        knex('user')
        .insert({
            id_token,
        })
        .then(() => {
            res.json({
                msg: 'thanks',
                logInfo: {
                    username,
                    device_info,
                },
            });
        })
        .catch((err) => {
            res.json({
                err: err.message,
            });
        });
    }
};

/*--------------google/sign-up/--------------*/
/*
 * PUT 닉네임 및 유저 정보 등록.
 */
exports.signUpBygoogle = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers["x-access-token"];
    const device_info = req.headers.device_info;
    const { nickname, username, email } = req.body;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();

    knex('user')
    .where({
        id_token,
    })
    .update({
        user_id: email,
        nickname,
        username,
        email,
    })
    .then((result) => {
        res.json({
            msg: `${service_issuer}(을)를 통해 ${nickname}님이 ${device_info}로 로그인 하였습니다.`,
            logInfo: {
                user_id: email,
                device_info,
            },
        });
    })
    .catch((err) => {
        console.log(err);
        res.json({
            msg: err.message
        });
    });
};

/*--------------google/sign-out/--------------*/
/*
 * PUT - sign out by User Logged in Google
 */
exports.signOutByGoogle = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers["x-access-token"];
    const device_info = req.headers.device_info;
    const { user_id } = req.body;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();
    req.checkBody('user_id', 'user_id is required').notEmpty();

    knex('user')
    .where({
        id_token,
    })
    .select('id_token')
    .update({
        id_token: null,
    })
    .then(() => {
        res.json({
            msg: `${service_issuer}, ${user_id}님이 ${device_info}로 로그아웃 하였습니다.`,
            logInfo: {
                user_id,
                device_info,
            },
        });
    })
    .catch((err) => {
        res.json({
            msg: err.message
        });
    });
};

/*--------------google/sign-out/--------------*/
/*
 * PUT - 새 토큰 발행.
 */
exports.newToken = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers["x-access-token"];
    const device_info = req.headers.device_info;
    const { email } = req.body;
    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();
    console.log(id_token);
    knex('user')
    .where({
        email,
    })
    .update({
        id_token,
    })
    .then(() => {
        res.json({
            msg: `새 토큰을 발행했습니다.`,
            logInfo: {
                user_id: email,
                device_info,
            },
        });
    })
    .catch((err) => {
        res.json({
            msg: err.message
        });
    });

};

/*---------------/common/check/nickname---------------*/
/*
* GET - 유저 닉네임 확인
*/
exports.checkNickname = (req, res) => {
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
    .select('nickname')
    .then((data) => {
        console.log(data);
        const check = data[0].nickname !== null ? true : false;
        res.json({
            msg: 'this check is what has checked whether already existed nickname.',
            check,
            logInfo: {
                device_info,
            },
        });
    })
    .catch((err) => {
        res.json({
            msg: err.message,
        });
    });
};

/*---------------/common/nickname---------------*/
/*
* PUT - 유저 닉네임 등록
*/
exports.enrollNickname = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers["x-access-token"];
    const device_info = req.headers.device_info;
    const { nickname } = req.body;

    knex('user')
    .where({
        id_token,
    })
    .update({
        nickname,
        device_info,
        created_at: config.date,
    })
    .then(() => {
        res.json({
            msg: `${service_issuer}, ${nickname}님이 ${device_info}로 회원가입을 완료하였습니다.`,
            logInfo: {
                nickname,
                device_info,
            },
        });
    })
    .catch((err) => {
        console.log("err on updateNickname's user table", err);
    });
};
