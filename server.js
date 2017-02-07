const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

// user body-parser.
const urlencodedParser = bodyParser.urlencoded({
  extended: true,
});
const jsonParser = bodyParser.json();

app.use(urlencodedParser);
app.use(jsonParser);
// use cors.
app.use(cors());

// use express userRouter.
const userRouter = require('./resource/users/userRouter');
app.use('/users', userRouter);

// use express flagRouter.
const flagRouter = require('./resource/flags/flagRouter');
app.use('/flags', flagRouter);

app.get('/', (req, res) => {
  res.send('실행중');
});

app.listen(3333, () => {
  console.log('Example app listening on port 3333!');
});
