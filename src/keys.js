const {PORT,DB_HOST, DB_USER, DB_PASSWORD, DB_BASE, DB_PORT} = require('./lib/config')

module.exports = {
    database: {
        host: DB_HOST,
        user: DB_USER,
        post: DB_PORT,
        password: DB_PASSWORD,
        database: DB_BASE,
    }

}
