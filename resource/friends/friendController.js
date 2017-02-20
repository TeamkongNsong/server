const knex = require('../../model/knex.js');
const config = require('../../config.js');


/*
 * 친구 status 정의
 * status: -1 // 차단
 * status: 0 // 신청
 * status: 1 // 수락
 */
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

const getMyIdx = (id_token) => {
    return knex('user')
        .where({
            id_token,
        })
        .then((user) => {
            if(!user) return Promise.reject('getMyIdx ERR');
            return user;
        })
        .catch(handleError);
};

const handleError = (err) => {
    console.log('err', err);
};

// exports.getAllFriends = (req, res) => {
//     const { service_issuer, device_info } = req.headers;
//     const id_token = req.headers['x-access-token'];
//     const headers = {
//         service_issuer,
//         id_token,
//         device_info,
//     };
//
//     if (handleValidation(req, res, headers, 'headers')) {
//         knex('friends')
//             .then((friends) => {
//                 if (!friends.length) Promise.reject('getAllFriends ERR');
//                 res.json({
//                     friends,
//                     logInfo: {
//                         device_info,
//                     },
//                 });
//             })
//             .catch(handleError);
//     }
// };

exports.getMyFriends = (req, res) => {
    const { service_issuer, device_info, status } = req.headers;
    const id_token = req.headers['x-access-token'];
    const headers = {
        service_issuer,
        id_token,
        device_info,
        status,
    };

    if (handleValidation(req, res, headers, 'headers')) {
        getMyIdx(id_token)
        .then((user) => {
            return knex('friend')
                .where({
                    from: user[0].idx,
                }).orWhere({
                    to: user[0].idx,
                })
                .then((friendsInfo) => {

                    console.log('==================================');
                    console.log('f', friendsInfo);
                    console.log('==================================');
                    if(!friendsInfo.length) return Promise.reject('getMyFriends ERR');
                    res.json({
                        friendsInfo,
                        logInfo: {
                            device_info,
                        },
                    });
                });
        })
        .catch(handleError);
    }
};





exports.addFriend = (req, res) => {
    const { service_issuer, device_info } = req.headers;
    const id_token = req.headers['x-access-token'];
    const { friend } = req.body;
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };
    const body = {
        friend,
    };

    if (handleValidation(req, res, headers, 'headers') &&
    handleValidation(req, res, body, 'body')) {
        const assignFromTo = (id_token, friend) => {
            return knex('user')
                .where({
                    id_token,
                }).orWhere({
                    nickname: friend,
                })
                .then((users) => {
                    if(!users.length) Promise.reject('checkStatus ERR');
                    let from,
                        to = null;
                    users.forEach((user) => {
                        if (user.id_token === id_token) {
                            from = user.idx;
                        } else if (user.nickname === friend) {
                            to = user.idx;
                        }
                    });
                    const them = {
                        from,
                        to,
                    };
                    return Promise.resolve(them);
                })
                .catch(handleError);
        };

        const checkStatus = (them) => {
            return knex('friend')
                .where({
                    from: them.from,
                    to: them.to,
                })
                .then((statusInfo) => {
                    them = {
                        from: them.from,
                        to: them.to,
                        status: statusInfo,
                    };
                    return them;
                });
        };

        const addStatus = (them) => {
            if (!them.status.length) {
                knex('friend')
                .insert({
                    from: them.from,
                    to: them.to,
                    status: 0,
                })
                .then((result) => {
                    if (!result) Promise.reject('친구추가 ERR');
                    res.json({
                        logInfo: {
                            device_info,
                        },
                    });
                })
                .catch(handleError);
            }
            res.json({
                status: them.status,
                logInfo: {
                    device_info,
                },
            });
        };

        assignFromTo(id_token, friend)
        .then(checkStatus)
        .then(addStatus);
    }
};
