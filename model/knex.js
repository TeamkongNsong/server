const config = require('../config.js');
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database
  },
  pool: { min: 0, max: 500 },
});

module.exports = knex;
