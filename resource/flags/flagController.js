const knex = require('../../model/knex.js');

/*---------------flags---------------*/
/*
 * GET
 */
exports.returnAllFlags = (req, res) => {
  console.log('checking returnFlags', req.body);
  knex("user_flag")
  .select()
  .then((data) => {
    res.send(data);
  })
  .catch((err) => {
    console.log("err on returnAllFlags's user_flag table.", err);
  });
};

/*
 * POST
 */
exports.pinFlag = (req, res) => {
  console.log('checking insertFlag', req.body);
  const date = new Date();
  date.setHours(date.getHours() + 9);
  knex('user')
  .where({
    nickname: req.body.nickname,
  })
  .select('idx')
  .then((data) => {
    knex('user_flag')
    .insert({
        user_idx: data[0].idx,
        nickname: req.body.nickname,
        title: req.body.title,
        message: req.body.message,
        latitude: req.body.region.latitude,
        longitude: req.body.region.longitude,
        date,
    })
    .then((data) => {
        res.json({
            "message": "깃발을 박았습니다."
        });
        res.end();
    })
    .catch((err) => {
      console.log("err on pinFlag's user_flag table.", err);
    });
  })
  .catch((err) => {
    console.log("err on pinFlag's user table.", err);
  });
};

/*---------------flags/:nickname?idx=--------------*/
/*
 * GET: 깃발 누른 사람과 닉네임이 매치하는 지 true, false로 응답
 */
exports.isMatchUserSelf = (req, res) => {
  knex('user_flag')
  .where({
    idx: req.query.idx,
  })
  .select()
  .then((flag) => {
    console.log(flag);
    const check = (flag[0].nickname === req.params.nickname) ? true : false;
    res.send(check);
  })
  .catch((err) => {
    console.log("err of isMatchUserSelf on flagController's onClickUserNickname and onClickFlagIdx", err);
  });
};


/*---------------flags/:idx---------------*/
/*
 * DELETE
 */
exports.deleteMapFlag = (req, res) => {
  knex('user_flag')
  .where({
    idx: req.params.idx,
  })
  .del()
  .then(() => {
    res.json({
      "message": "deleted message succesfully!"
    });
  })
  .catch((err) => {
    console.log("err on deleteMapFlag's user_flag table.", err);
  });
};
