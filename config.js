exports.info = {
    'secret': 'OhSoRyAnDShIrImP(@($DuO!',
    'client': 'mysql',
    'host': 'wikius.cm5qkmkpq74f.ap-northeast-2.rds.amazonaws.com',
    'port': '3306',
    'user': 'kongNsong',
    'password': '9294duo!',
    'database': 'yoongoodb'
};

exports.dateNow = () => {
    const date = new Date();
    date.setHours(date.getHours() + 9);
    return date;
};
