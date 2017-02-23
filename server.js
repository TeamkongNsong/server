const express = require('express');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

/*===========================================
                LOAD the config
===========================================*/
const config = require('./config');

/*===========================================
                INIT App
===========================================*/
const app = express();

/*===========================================
                SET jwt-secret
===========================================*/
app.set('jwt-secret', config.info.secret);

/*===========================================
                USE BodyParser
===========================================*/
const urlencodedParser = bodyParser.urlencoded({
    extended: true,
});
const jsonParser = bodyParser.json();

app.use(urlencodedParser);
app.use(jsonParser);

/*===========================================
                USE Validtaor
===========================================*/
app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        let namespace = param.split('.'),
        root    = namespace.shift(),
        formParam = root;

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

/*===========================================
                USE CORS
===========================================*/
app.use(cors());

/*===========================================
                USE ROUTER
===========================================*/
const authRouter = require('./resource/auth/authRouter');
app.use('/auth', authRouter);

const userRouter = require('./resource/users/userRouter');
app.use('/users', userRouter);

const flagRouter = require('./resource/flags/flagRouter');
app.use('/flags', flagRouter);

const friendRouter = require('./resource/friends/friendRouter');
app.use('/friends', friendRouter);

// const chatRouter = require('./resource/chat/chatRouter');
// app.use('/chats', chatRouter);


/*=========================================================
                USE GET(test), listen server
=========================================================*/
app.get('/', (req, res) => {
    res.send('wikius server 실행');
});
app.listen(3333, () => {
    console.log('================================');
    console.log(' WELCOME TO WIKIUS SERVER, 3333');
    console.log('================================');
});
