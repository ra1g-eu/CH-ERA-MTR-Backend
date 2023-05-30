const mysql = require('mysql2');

// create the connection to database
const database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ffscheduler',
    multipleStatements: true
});

module.exports = database;