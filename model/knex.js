console.log('knex.js');

const config = require('../config.js');
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: 'wikius.cm5qkmkpq74f.ap-northeast-2.rds.amazonaws.com',
    port: 3306,
    user: config.user,
    password: config.password,
    database: config.database
  },
  pool: { min: 0, max: 500 },
});

module.exports = knex;
