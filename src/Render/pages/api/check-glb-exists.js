import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export default async function handler(req, res) {
  const { articleID } = req.query;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${articleID}.glb`,
  };

  s3.headObject(params, function(err, data) {
    if (err && err.code === 'NotFound') {
      // GLB file does not exist
      res.status(200).json({ exists: false });
    } else {
      // GLB file exists
      res.status(200).json({ exists: true });
    }
  });
}