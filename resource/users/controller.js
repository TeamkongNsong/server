const db = require('../../mysql/knex.js');

exports.insertUser = (req, res) => {
  const date = new Date().toLocaleString();
    db.knex('user')
        .insert({
            id: req.body.id,
            nickname: req.body.nickname,
            email: req.body.email,
            img: req.body.img,
            date,
        })
        .then((data) => {
            res.json({
                "message": "환영합니다."
            });
            res.end();
        });
};

exports.searchUserId = (req, res) => {
    if (req.body === undefined) {
        res.send('nothing come in');
    } else {
        db.knex('user')
            .where({
                id: req.params.id,
            })
            .select('id')
            .then((data) => {
                const check = data.length ? true : false;
                res.send(check);
            })
            .catch((err) => {
                throw err;
            });
    }
};

exports.searchUserNickName = (req, res) => {
    if (req.params === undefined) {
        res.send('입력된 유저가 없습니다.');
    } else {
        db.knex('user')
            .where({
                nickname: req.params.nickname,
            })
            .select('nickName')
            .then((data) => {
                const check = data.length ? true : false;
                res.send(check);
            })
            .catch((err) => {
                throw err;
            });
    }
};
