const knex = require('../../model/knex.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

/*========================================
* POST        SEND MESSAGE
========================================*/
exports.sendMessage = (req, res) => {
    const headers = {
        service_issuer: req.headers.service_issuer,
        id_token: req.headers['x-access-token'],
        device_info: req.headers.device_info,
    };

    const body = {
        message: req.body.message,
    };

    if (handleValidation(req, res, headers, 'headers') && handleValidation(req, res, body, 'body')) {

    }
};
