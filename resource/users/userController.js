const db = require('../../mysql/knex.js');
const Hangul = require('hangul-js');

/*---------------users---------------*/
/*
 * POST - 유저 등록(회원 가입)
 */
exports.insertUser = (req, res) => {
    const date = new Date();
    date.setHours(date.getHours() + 9);
    db.knex('user')
    .insert({
        id: req.body.id,
        nickname: req.body.nickname,
        state_message: "",
        email: req.body.email,
        img: req.body.img,
        date,
    })
    .then((data) => {
        res.json({
            "message": "환영합니다."
        });
        res.end();
    })
    .catch((err) => {
      console.log("err on insertUser's user table", err);
    });
};

/*
* PUT - 유저 프로필 업데이트(본인)
*/
exports.updateUser = (req, res) => {
 db.knex('user')
 .where({
   id: req.body.id,
 })
 .update({
   nickname: req.body.nickname,
 })
 .then(() => {
   res.json({
     "message": "닉네임 변경 완료.",
   })
   res.end();
 })
 .catch((err) => {
   console.log("err on updateNickname's user table", err);
 })
}

/*
 * DELETE - 유저 삭제(회원 탈퇴)
 */
 exports.deleteUser = (req, res) => {
   db.knex('user_flag')
   .where({
     id: req.params.id,
   })
   .del()
   .then(() => {
     res.json({
       "message": "유저 데이터 삭제 중."
     });
     res.end();
   })
   .catch((err) => {
     console.log("err on deleteUser's user_flag table", err);
   });

   db.knex('user')
   .where({
     id: req.params.id,
   })
   .del()
   .then(() => {
     res.json({
       "message": "유저 데이터 삭제 완료."
     });
     res.end();
   })
   .catch((err) => {
     console.log("err on deleteUser's user table", err);
   });
 }


 /*---------------users/:nickname?id=..--------------*/
 /*
  * GET: 프로필 들어갈 때 자기 프로필인지 아닌지 true, false로 응답
 exports.isMatchUserSelf = (req, res) => {
   db.knex('user')
   .where({
     id: req.query.id,
   })
   .select()
   .then((user) => {
     console.log(user);
     const check = (user[0].nickname === req.params.nickname) ? true : false;
     res.send(check);
   })
   .catch((err) => {
     console.log("err of isMatchUserSelf on userController's onClickUserNickname and onClickId", err);
   });
 }
 */

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
       console.log("err on retrieveUser's user table", err);
     });
   }
}


/*---------------users/search/:word---------------*/
/*
 * GET - 유저 초성 검색(main 화면) - 2.11
 */
exports.searchUser = (req, res) => {
  console.log(req.params);
    db.knex('user')
    .select()
    .then((users) => {
      const searcher = new Hangul.Searcher(`${req.params.word}`);
      const result = [];
      users.forEach((user) => {
        if (searcher.search(user.nickname) !== -1) {
          result.push({
            img: user.img,
            nickname: user.nickname,
            state_message: user.state_message,
          });
        }
      });
      res.send(result);
    });
  }


/*---------------profile/state_message/---------------*/
/*
* PUT - 유저 프로필 상태메세지 업데이트(본인)
*/
exports.updateStateMessage = (req, res) => {
  db.knex('user')
  .where({
    id: req.body.id,
  })
  .select('state_message')
  .update({
    state_message: req.body.state_message,
  })
  .then(() => {
    res.json({
      "message": "상태메세지를 업데이트했습니다."
    })
    res.end();
  })
  .catch((err) => {
    console.log("err on updateStateMessage's user table", err);
  });
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
          console.log("err on checkUserId's user", err);
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
          console.log("err on checkUserNickName", err);
        });
    }
};
