const db = require('../../mysql/knex.js');

/*---------------flags---------------*/
/*
 * GET
 */
exports.returnFlags = (req, res) => {
  db.knex("user_flag")
  .select()
  .then((data) => {
    res.send(data);
  })
  .catch((err) => {
    throw err;
  });
}

/*
 * POST
 */
exports.insertFlag = (req, res) => {
  console.log(req.body);
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
      throw err;
    })
  })
  .catch((err) => {
    throw err;
  })
};
