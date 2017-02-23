const knex = require('../../model/knex.js');
const multer = require('multer');
const AWS = require('aws-sdk');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const s3 = new AWS.S3();
const config = require('../../config.js');

exports.saveImage = (req, res) => {
    console.log(req.body, req.headeres);
};
