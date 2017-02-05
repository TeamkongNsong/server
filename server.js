const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// const cors = require('cors'); // 냐중에 할거임
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

// use express Router.
const userRouter = require ('./resource/users/userRouter');
app.use('/', userRouter);

app.get('/', (req, res) => {
  res.send('Hi!');
});

app.listen(3333, () => {
  console.log('Example app listening on port 3333!');
});
