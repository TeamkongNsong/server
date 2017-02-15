const knex = require('../../model/knex.js');
const Hangul = require('hangul-js');
const config = require('../../config.js');


/*================================================
                      COMMON
================================================*/
const handleError = (err) => {
    console.log(err);
};

/*================================================
                      USERS
================================================*/
/*
 * GET - 모든 유저 정보 가져오기
 */
exports.getAllUsers = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers["x-access-token"];
    const device_info = req.headers.device_info;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();

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
};

/*================================================
                        ME
================================================*/
/*
 * GET - 내 정보 가져오기
 */
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
        .select()
        .then((user) => {
            console.log(user);
            res.json({
                user: user[0],
                logInfo: {
                    device_info,
                },
            });
        })
        .catch(handleError);
};

/* TODO: 보류
 * DELETE - 유저 삭제
 */
exports.deleteUser = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers["x-access-token"];
    const device_info = req.headers.device_info;
    const {
        user_id
    } = req.body;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();
    req.checkBody('user_id', 'user_id is required').notEmpty();

    knex('user_flag')
        .where({
            user_id,
        })
        .del()
        .then(() => {
            db.knex('user')
                .where({
                    user_id,
                })
                .del()
                .then(() => {
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
};


/*================================================
                    ONE OTHER
================================================*/
/*---------------users/:idx---------------*/
/*
 * GET - 다른 *한 사람* 유저 정보 get하기
 */
exports.getUserInfo = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers["x-access-token"];
    const device_info = req.headers.device_info;
    const {
        idx
    } = req.params;
    console.log(idx);
    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();
    req.checkParams('idx', 'idx is required').notEmpty();

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
};


/*================================================
                      SEARCH
================================================*/
/*---------------users/search/:word---------------*/
/*
 * GET - 유저 초성 검색(main 화면) - 2.11
 */
exports.searchUser = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const id_token = req.headers["x-access-token"];
    const device_info = req.headers.device_info;
    const {
        word
    } = req.params;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();
    req.checkParams('word', 'word is required').notEmpty();

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
        })
        .catch(handleError);
};


/*================================================
                    MATCH_USER
================================================*/
/*---------------matchuser/:user_id---------------*/
/*
 * GET - 유저 user_id 중복 확인
 */
exports.checkDuplicatedUserId = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const device_info = req.headers.device_info;
    const {
        user_id
    } = req.params;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();
    req.checkBody('user_id', 'user_id is required').notEmpty();

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
};
/*---------------matchuser/:nickname---------------*/
/*
 * GET - 유저 닉네임 중복 확인
 */
exports.checkDuplicatedUserNickname = (req, res) => {
    const service_issuer = req.headers.service_issuer;
    const device_info = req.headers.device_info;
    const {
        nickname
    } = req.params;

    req.checkHeaders('service_issuer', 'service_issuer is required').notEmpty();
    req.checkHeaders('x-access-token', 'x-access-token is required').notEmpty();
    req.checkHeaders('device_info', 'device_info is required').notEmpty();
    req.checkBody('nickname', 'nickname is required').notEmpty();

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
};
