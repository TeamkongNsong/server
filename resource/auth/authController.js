console.log('authController.js');

const db = require('../../model/knex.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = db('user');

/*--------------users/auth/register/--------------*/
/*
 * POST 위키 유저 생성 및 등록.
 */
exports.createWikiUser = (req, res) => {
  const { user_id, nickname, password, password2, device_info } = req.body;
  const date = new Date();
  date.setHours(date.getHours() + 9);

  const newUser = {
    user_id,
    password,
    password2,
    date,
  };

  req.checkBody('user_id', 'user_id is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Connfirm passwords do not match').equals(newUser.password);

  const genSaltForPassword = (newUser) => {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          reject(err);
        } else {
          const data = {
            password: newUser.password,
            salt,
          }
          resolve(data);
        }
      });
    });
  }

  const hashPassword = (data) => {
    bcrypt.hash(data.password, data.salt, (err, hash) => {
        User.insert
        ({
          user_id: newUser.user_id,
          nickname: newUser.nickname,
          password: hash,
        })
        .then(() => {
          res.json({
            msg: `${newUser.user_id}님이 가입하셨습니다.`,
            statusCode: 202,
          });
        })
        .catch((err) => {
          res.json({
            message: err
          });
        });
    });
  }

  const errors = req.validationErrors();

  if (errors) {
    res.json({
      message: errors
    })
  } else {
    genSaltForPassword(newUser)
    .then(hashPassword)
    .catch((err) => {
      res.json({
        messasge: 'err on getSaltForPassword'
      })
    });
  }
}


/*--------------users/auth/login/--------------*/
/*
 * POST 위키 유저 로그인시 토큰 발행
 */
exports.loginWiki = (req, res) => {
  const { user_id, password } = req.body;
  const secret = req.app.get('jwt-secret');

  User.where({
    user_id,
  })
  .select()
  .then((user) => {
    const hash = user[0].password;
    bcrypt.compare(password, hash, (err, isMatch) => {
      if (err) throw err;
      else if (isMatch) {
        return new Promise((resolve, reject) => {
          jwt.sign(
            {
              user_id: user.user_id,
              username: user.user_name,
            },
            secret,
            {
              expiresIn: '7d',
              issuer: 'pmirihss',
              subject: 'userInfo'
            },
            (err, token) => {
              if (err) reject(err);
              resolve(token);
            }
          )
        })
        .then((token) => {
          User.where({
            user_id: user[0].user_id
          })
          .update({
            id_token: token,
          })
          .then(() => {
            res.json({
              message: 'logged in successfully',
              token
            });
          })
          .catch((err) => {
            res.status(403).json({
              message: err
            })
          });
        })
        .catch((err) => {
          res.status(400).json({
            message: err
          })
        });
      }
    });
  })
  .catch((err) => {
    res.status(404).json({
      message: err
    })
  });
}

/*--------------users/auth/login/--------------*/
/*
 * DELETE 위키 유저 로그인시 토큰 발행
 */
exports.logoutWiki = (req, res) => {
  const { id_token } = req.body;
  User.where({
    id_token,
  })
  .select('id_token')
  .del()
  .then(() => {
    res.json({
      msg: 'logged out successfully!',
      statusCode: 202,
    });
  })
  .catch((err) => {
    res.json({
      msg: err,
      statusCode: 404,
    });
  });
}
