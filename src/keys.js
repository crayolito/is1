const {DB_HOST, DB_USER, DB_PASSWORD, DB_BASE, DB_PORT} = require('./config')

module.exports = {
    database: {
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_BASE,
        port : DB_PORT
    }
}