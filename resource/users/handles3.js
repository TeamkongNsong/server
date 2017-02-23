const knex = require('../../model/knex.js');
const multer = require('multer');
const AWS = require('aws-sdk');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const s3 = new AWS.S3();
const config = require('../../config.js');

/*===========================================
/*===========================================
/*===========================================
                   COMMON
/*===========================================
/*===========================================
*===========================================*/
const handleValidation = (req, res, keyValues, locatedIn) => {
    if (locatedIn === 'headers') {
        const headers = keyValues;
        for (let key in headers) {
            if (key === 'id_token') {
                key = 'x-access-token';
            }
            req.checkHeaders(`${key}`, `${key} is required`).notEmpty();
        }
    } else if (locatedIn === 'params') {
        const params = keyValues;
        for (let key in params) {
            req.checkParams(`${key}`, `${key} is required`).notEmpty();
        }
    } else if (locatedIn === 'body') {
        const body = keyValues;
        for (let key in body) {
            if (key === body.password2) {
                req.checkBody(`${key}`, `${key} is required`).equal(body.password);
            }
            req.checkBody(`${key}`, `${key} is required`).notEmpty();
        }
    } else if (locatedIn === 'query') {
        const query = keyValues;
        for (let key in query) {
            req.checkQuery(`${key}`, `${key} is required`).notEmpty();
        }
    }

    const err = req.validationErrors();
    if (err) {
        handleError(err);
        res.status(400).json({
            msg: 'validation errors!',
            err: err.message,
            statusCode: 400,
        });
    }
    return true;
};

const handleError = (err) => {
    console.log('err', err);
};

/*================================================
                 PROFILE IMAGE
================================================*/
/*
 * PUT - 유저 프로필 image 업데이트.
  */
exports.saveImage = (req, res) => {
    const { service_issuer, device_info } = req.headers;
    const id_token = req.headers['x-access-token'];
    const { image } = req.body;
    const headers = {
        service_issuer,
        id_token,
        device_info,
    };
    const body = {
        image,
    };
    console.log(body.image);

    if ((handleValidation(req, res, headers, 'headers')) &&
    (handleValidation(req, res, body, 'body'))) {
        knex('user')
            .where({
                id_token,
            })
            .select('img')
            .update({
                img: image,
            })
            .then((result) => {
                console.log(result);
                if (!result) return Promise.reject('saveImage ERR');
                res.end();
            })
            .catch((err) => {
                handleError(err);
                res.end();
            });
    }
};
