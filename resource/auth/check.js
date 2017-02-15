const knex = require('../../model/knex.js');
exports.checkNickname = (issuer, userID) => {
    let check, error;
    if (issuer === 'wiki') {
        knex('user')
        .where({
            user_id: userID,
        })
        .select('nickname')
        .then((data) => {
            check = data.length > 0 ? true : false;
        })
        .catch((err) => {
            error = err.message;
        });
    }
};
                        // 
                        // msg: `${service_issuer}, ${nickname}님이 ${device_info}로 로그인 하였습니다.`,
