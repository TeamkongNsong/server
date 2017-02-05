const knex = require('knex')({
  client: 'mysql',
  connection: {
    host : 'wikius.cm5qkmkpq74f.ap-northeast-2.rds.amazonaws.com',
    port : '3306',
    user : 'kongNsong',
    password : '9294duo!',
    database : 'yoongoodb'
  },
  pool: { min: 0, max: 500 },
});

exports.knex = knex;
