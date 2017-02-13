console.log('server.js');

const express = require('express');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
// load the config
const config = require('./config');

// init app
const app = express();

//set port, jwt-secret
app.set('jwt-secret', config.secret);


// user body-parser.
const urlencodedParser = bodyParser.urlencoded({
  extended: true,
});
const jsonParser = bodyParser.json();

app.use(urlencodedParser);
app.use(jsonParser);

//init validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// use cors.
app.use(cors());

/*--------------------USE ROUTER--------------------*/
const authRouter = require('./resource/auth/authRouter');
app.use('/auth', authRouter);

const userRouter = require('./resource/users/userRouter');
app.use('/users', userRouter);

const flagRouter = require('./resource/flags/flagRouter');
app.use('/flags', flagRouter);

app.get('/', (req, res) => {
  res.send('wikius server 실행');
});
app.listen(3333, () => {
  console.log(`Example app listening on port, 3333!`)
});
