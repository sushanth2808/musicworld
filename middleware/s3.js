require('dotenv').config()
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey
  
})

// uploads a file to s3
exports.uploadFile= (file) =>{
  const fileStream = fs.createReadStream(file.path)
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename
  }

  return s3.upload(uploadParams).promise()
}

// downloads a file from s3
exports.getFileStream=(fileKey)=> {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName
  }
  //return s3.getObject(downloadParams).createReadStream()
  return s3.getObject(downloadParams).promise()
}

var bucketParams = {
  Bucket :bucketName
}

exports.listfiles=()=>{
// Call S3 to obtain a list of the objects in the bucket
 return s3.listObjects(bucketParams).promise();
 }

exports.delBucket=()=>{
  
  return s3.deleteBucket(bucketParams).promise()
}


exports.delObject=(fileKey)=>{
  const delobjectparams = {
    Key: fileKey,
    Bucket: bucketName
  }
  console.log("hurray")
return s3.deleteObject(delobjectparams).promise()
}

const signedUrlExpireSeconds = 60 * 5
exports.url = (fileKey)=>{ 
  const params={ 
    Bucket:bucketName,
    Key: fileKey,
    Expires: signedUrlExpireSeconds}
  return s3.getSignedUrl('getObject', params)
}


exports.all_files = async (req,res,next)=>
    {
        const result = await listfiles()
        arr = result.Contents.map((file)=>{return file.Key})
        req.arr = arr
        next()
    }
