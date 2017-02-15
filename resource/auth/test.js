const knex = require('../../model/knex.js');
const bcrypt = require('bcryptjs');
const config = require('../../config.js');
const jwt = require('jsonwebtoken');


/*========================================
                SIGN IN
========================================*/
exports.signIn = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers['x-access-token'];
    const device_info = req.headers.device_info;
    const secret = req.app.get('jwt-secret');

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();

    return new Promise((resolve, reject) => {
        if (service_issuer === 'wiki') {
            const { user_id, password } = req.body;
            return checkIdAndPassword(user_id, password)
                .then((isMatch) => {
                    if (!isMatch) return res.send(isMatch);
                    resolve(user_id);
                });
        } else if (service_issuer === 'google') {
            const { user_id } = req.body;
            return hasAlreadyUser(user_id)
            .then((check) => {
                if (check) return resolve(user_id);
                insertUserInfo(user_id)
                .then((user_id) => {
                    resolve(user_id);
                });
            });
        }
    })
    .then((user_id) => tokenUpdate(user_id, service_issuer, secret, id_token))
    .then((user_id) => checkNickname(user_id))
    .then((check) => {
        res.json({
            check,
            msg: `check a boolean.`
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
            console.log(user_id, service_issuer, id_token);
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
        });
    })
    .then(() => {
        return user_id;
    })
    .catch(handleError);
};

const checkNickname = (user_id) => {
    return new Promise((resolve, reject) => {
        knex('user')
        .where({
            user_id,
        })
        .then((user) => {
            const check = user[0].nickname !== null;
            resolve(check);
        })
        .catch(handleError);
    });
};

const handleError = (err) => {
    console.log(err);

};
/*========================================*/
