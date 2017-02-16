const knex = require('../../model/knex.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config.js');

/*========================================
* POST        WIKIS SIGN UP
========================================*/
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
                    statusCode: 200,
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

/*========================================
* POST           SIGN IN
========================================*/
exports.signIn = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers['x-access-token'];
    const device_info = req.headers.device_info;
    const secret = req.app.get('jwt-secret');
    const { user_id, password } = req.body;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();
    req.checkBody('user_id', 'user_id is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();

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
};

//wiki
const checkIdAndPassword = (user_id, password) => {
    return knex('user')
    .where({
        user_id,
    })
    .then((user) => {
        const hash = user[0].password;
        return bcrypt.compare(password, hash);
    })
    .catch(handleError);
};

const makeToken = (user_id, secret) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            {
                user_id,
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
    })
    .catch(handleError);
};

const insertUserInfo = (user_id) => {
    return knex('user')
    .insert({
        user_id,
        email: user_id,
    })
    .catch(handleError);
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
        .then(() => {
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
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers['x-access-token'];
    const device_info = req.headers.device_info;
    const { nickname } = req.body;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();
    req.checkBody('nickname', 'nickname is required').notEmpty();

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
                created_at: config.date,
                device_info,
            },
        });
    })
    .catch((err) => {
        console.log("err on updateNickname's user table", err);
    });
};

/*========================================
* PUT           SIGN OUT
========================================*/
exports.signOut = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers["x-access-token"];
    const device_info = req.headers.device_info;

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
    .then(() => {
        res.json({
            msg: `${service_issuer}, ${device_info}로 로그아웃 하였습니다.`,
            logInfo: {
                date: config.date,
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

/*========================================
* GET        AUTO SIGN-IN
========================================*/
exports.autoSignIn = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers['x-access-token'];
    const device_info = req.headers.device_info;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();

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
    });
};


/*========================================
* GET        CHECK NICKNAME
========================================*/
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
    .then((data) => {
        const check = data[0].nickname !== null;
        res.json({
            check,
            msg: `check a boolean.`
        });
    })
    .catch(handleError);
};

const handleError = (err) => {
    console.log(err);
};
