
const { config } = require('dotenv')

config()

 const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME
 const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION
 const AWS_PUBLIC_KEY_S3 = process.env.AWS_PUBLIC_KEY_S3
 const AWS_SECRET_KEY_S3 = process.env.AWS_SECRET_KEY_S3
 const AWS_PUBLIC_KEY_IA = process.env.AWS_PUBLIC_KEY_IA
 const AWS_SECRET_KEY_IA = process.env.AWS_SECRET_KEY_IA
 const PORT = process.env.PORT || 5001
 const DB_HOST = process.env.DB_HOST || 'localhost'
 const DB_PORT = process.env.DB_PORT || 3306
 const DB_USER = process.env.DB_USER   || 'root'
 const DB_PASSWORD = process.env.DB_PASSWORD || 'coraxbay78452415'
 const DB_BASE = process.env.DB_BASE || 'is1'
module.exports = {
    AWS_BUCKET_NAME,
    AWS_BUCKET_REGION,
    AWS_PUBLIC_KEY_S3,
    AWS_SECRET_KEY_S3,
    AWS_PUBLIC_KEY_IA,
    AWS_SECRET_KEY_IA,
    PORT,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_BASE
};