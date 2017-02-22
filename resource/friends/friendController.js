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

const getIdx = (id_token) => {
    return knex('user')
        .where({
            id_token,
        })
        .then((user) => {
            if (!user) return Promise.reject('getIdx ERR');
            return user;
        })
        .catch(handleError);
};

const handleError = (err) => {
    console.log('err', err);
};

const assignFromTo = (id_token, friend) => {
    return knex('user')
        .where({
            id_token,
        }).orWhere({
            nickname: friend,
        })
        .then((users) => {
            console.log('users',users);
            if (!users.length) return Promise.reject('assignFromTo ERR');
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
        });
};


/*========================================
* GET     GET MY FRIENDS STATUS
========================================*/
exports.getMyFriends = (req, res) => {
    const {
        service_issuer,
        device_info
    } = req.headers;
    const id_token = req.headers['x-access-token'];
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };

    if (handleValidation(req, res, headers, 'headers')) {
        const getMyFriendsData = (user) => {
            return knex('friend')
                .where({
                    from: user[0].idx,
                }).orWhere({
                    to: user[0].idx,
                })
                .then((friendsInfo) => {
                    res.json({
                        friendsInfo,
                        logInfo: {
                            device_info,
                        },
                    });
                });
        };
        getIdx(id_token)
            .then(getMyFriendsData);
    }
};

/*========================================
* POST         ADD FRINED
========================================*/

exports.addFriend = (req, res) => {
    const {
        service_issuer,
        device_info
    } = req.headers;
    const id_token = req.headers['x-access-token'];
    const {
        friend
    } = req.body;
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
        const insertFriend = (them) => {
            return knex('friend')
                .where({
                    from: them.from,
                    to: them.to,
                })
                .select('status')
                .then((status) => {
                    if (!status.length) {
                        knex('friend')
                            .insert({
                                from: them.from,
                                to: them.to,
                                status: 0,
                            })
                            .then((result) => {
                                if (!result) return Promise.reject('insertFriend ERR');
                                res.json({
                                    msg: 'insert friend request succesfully.',
                                    logInfo: {
                                        device_info,
                                    },
                                });
                            })
                            .catch(handleError);
                    } else {
                        res.json({
                            msg: 'you already got a request.',
                            logInfo: {
                                device_info,
                            },
                        });
                    }
                });
        };
        assignFromTo(id_token, friend)
            .then(insertFriend);
    }
};

/*========================================
* PUT        FRINEDS'S STATUS
========================================*/
exports.handleFriendStatus = (req, res) => {
    const {
        service_issuer,
        device_info
    } = req.headers;
    const id_token = req.headers['x-access-token'];
    const {
        friend,
        status
    } = req.body;
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };
    const body = {
        friend,
        status,
    };

    if ((handleValidation(req, res, headers, 'headers')) &&
        (handleValidation(req, res, body, 'body'))) {
        const updateFriendStatuts = (them) => {
            return knex('friend')
                .where({
                    from: them.from,
                    to: them.to,
                })
                .then((friendsInfo) => {
                    return knex('friend')
                        .update({
                            status,
                        })
                        .then((result) => {
                            if (!result) return Promise.reject('updateFriendStatuts ERR');
                            res.json({
                                msg: 'status updated successfully!',
                                logInfo: {
                                    device_info,
                                },
                            });
                        });
                });
        };

        assignFromTo(id_token, friend)
            .then(updateFriendStatuts)
            .catch(handleError);
    }
};

exports.deleteFriendStatus = (req, res) => {
    const {
        service_issuer,
        device_info
    } = req.headers;
    const id_token = req.headers['x-access-token'];
    const {
        friend
    } = req.body;
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };
    const body = {
        friend,
    };

    if ((handleValidation(req, res, headers, 'headers')) &&
        (handleValidation(req, res, body, 'body'))) {
        const deleteFrinedStatus = (them) => {
            return knex('friend')
                .where({
                    from: them.from,
                    to: them.to,
                })
                .del()
                .then((result) => {
                    if (!result) return Promise.reject('deleteFrinedStatus ERR');
                    res.json({
                        logInfo: {
                            msg: 'deleted successfully!',
                            device_info,
                        },
                    });
                });
        };

        assignFromTo(id_token, friend)
            .then(deleteFrinedStatus)
            .catch(handleError);
    }
};


/*========================================
* GET           IS MY FRINED
========================================*/
exports.isMyFriend = (req, res) => {
    const {
        service_issuer,
        device_info
    } = req.headers;
    const id_token = req.headers['x-access-token'];
    const {
        friend
    } = req.params;
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };
    const params = {
        friend,
    };

    if ((handleValidation(req, res, headers, 'headers')) &&
        (handleValidation(req, res, params, 'params'))) {
        const checkStatus = (them) => {
            console.log('them1', them);
            return knex('friend')
                .where({
                    from: them.from,
                    to: them.to,
                }).orWhere({
                    from: them.to,
                    to: them.from,
                })
                .then((friendsInfo) => {
                    console.log('result', friendsInfo);
                    res.json({
                        friendsInfo,
                        logInfo: {
                            device_info,
                        },
                    });
                });
        };
        assignFromTo(id_token, friend)
            .then(checkStatus)
            .catch(handleError);
    }
};
