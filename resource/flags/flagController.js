const db = require('../../mysql/knex.js');

/*---------------flags---------------*/
/*
 * GET
 */
exports.returnAllFlags = (req, res) => {
  console.log('checking returnFlags', req.body);
  db.knex("user_flag")
  .select()
  .then((data) => {
    res.send(data);
  })
  .catch((err) => {
    console.log("err on returnAllFlags's user_flag table.", err);
  });
}

/*
 * POST
 */
exports.pinFlag = (req, res) => {
  console.log('checking insertFlag', req.body);
  const date = new Date();
  date.setHours(date.getHours() + 9);
  db.knex('user')
  .where({
    nickname: req.body.nickname,
  })
  .select('idx')
  .then((data) => {
    db.knex('user_flag')
    .insert({
        user_idx: data[0].idx,
        nickname: req.body.nickname,
        title: req.body.title,
        message: req.body.message,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
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


/*---------------/:nickname/:idx---------------*/
/*
 * DELETE
 */
exports.deleteMapFlag = (req, res) => {
  db.knex('user_flag')
  .where({
    nickname: req.params.nickname,
    idx: req.params.idx
  })
  .del()
  .catch((err) => {
    console.log("err on deleteMapFlag's user_flag table.", err);
  });
}
