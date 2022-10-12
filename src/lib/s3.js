const { S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const  {getSignedUrl} = require('@aws-sdk/s3-request-presigner')
const { AWS_BUCKET_REGION, AWS_PUBLIC_KEY_S3, AWS_SECRET_KEY_S3, AWS_BUCKET_NAME } = require('./config')
const fs = require ('fs')


const client = new S3Client({
    region: AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: AWS_PUBLIC_KEY_S3,
        secretAccessKey: AWS_SECRET_KEY_S3
    }
})
//SUBIR ARCHIVO A S3
 async function uploadFile(file) {
    const stream = fs.createReadStream(file.tempFilePath)
    console.log(AWS_BUCKET_REGION);
    const uploadParams = {
        Bucket: AWS_BUCKET_NAME,
        Key: file.name,
        Body: stream
    }
    const command = new PutObjectCommand(uploadParams)
    return await client.send(command)
}
// OBTENER TODOS LOS ARCHIVOS DE S3
 async function getFiles(){
   const commad = new ListObjectsCommand({
    Bucket: AWS_BUCKET_NAME
   })
   return await client.send(commad)
}

// OBTENER UN SOLO ARCHIVO DE S3 "APARTIR DE UN KEY(NOMBRE DEL ARCHIVO) Q ESTA EN S3"
 async function getFile(filename) {
    const command = new GetObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: filename
    })
    return await client.send(command)
}

// DESCARGAR UN ARCHIVO X UN KEY(NOMBRE ARCHIVO) SUBIDO A S3
 async function dowloadFile(filename) {
    const command = new GetObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: filename
    })
    const result = await client.send(command)
    console.log(result);
    result.Body.pipe(fs.createWriteStream(`./images/${filename}`))
}

// OBTENER UNA URL PARA DESCARGAR EL ARCHIVO KEY(NOMBRE ARCHIVO)
// SE PUEDE USAR PARA IMAGENES
 async function getFileURL(filename) {
    const command = new GetObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: filename
    })
    return await getSignedUrl(client,command,{expiresIn: 36000})
}

module.exports ={
    uploadFile,
    getFiles,
    getFile,
    dowloadFile,
    getFileURL
}