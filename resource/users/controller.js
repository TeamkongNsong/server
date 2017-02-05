const db = require('../../mysql/knex.js');


exports.insertUser = (req, res) => {
  console.log('reqbody',req.body);
  console.log('reqparams',req.params);
  console.log('reqquery',req.query);

  db.knex('user').insert({
    id: req.body.id,
    nickname: req.body.nickname,
    email: req.body.email,
  }).then((data) => {
    console.log(data);
  });

  res.json({ "message": "환영합니다."});
};

exports.searchUserId = (req, res) => {
  console.log('reqbody',req.body);
  console.log('reqparams',req.params);
  console.log('reqquery',req.query);


  if (req.body === undefined) {
    res.send('nothing come in');
    res.end();
  } else {
    db.knex('user').where({
      id: req.params.id,
    })
    .select('id')
    .then((data) => {
      const check = data.length ? true : false;
      res.send(check);
      res.end();
    })
    .catch((err) => {
      throw err;
    });
  }
};

exports.searchUserNickName = (req, res) => {
  if (req.params === undefined) {
    res.send('입력된 유저가 없습니다.');
    res.end();
  } else {
    db.knex('user').where({
      nickname: req.params.nickname,
    })
    .select('nickName')
    .then((data) => {
      const check = data.length ? true : false;
      res.send(check);
      res.end();
    })
    .catch((err) => {
      throw err;
    });
  }
};
