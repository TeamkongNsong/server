const db = require('../../mysql/knex.js');

/*---------------users---------------*/
/*
 * POST - 유저 등록
 */
exports.insertUser = (req, res) => {
  const date = new Date();
  date.setHours(date.getHours() + 9);
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


/*---------------users/:id---------------*/
/*
 * GET - 유저 검색
 */
 exports.retrieveUser = (req, res) => {
   console.log('checking retrieveUser: ', req.params);
   if (req.params === undefined) {
     res.send('nothing come in');
   } else {
     db.knex('user')
     .where({
       id: req.params.id,
     })
     .select()
     .then((data) => {
       console.log(data);
       res.send(data[0]);
     })
     .catch((err) => {
       throw err;
     });
   }
 }


/*---------------matchuser_id---------------*/
/*
 * GET - 유저 id 중복 확인
 */
exports.checkUserId = (req, res) => {
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



/*---------------matchuser_nickname---------------*/
/*
 * GET - 유저 닉네임 중복 확인
 */
exports.checkUserNickName = (req, res) => {
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
