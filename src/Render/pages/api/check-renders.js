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

  try {
    const promises = [];
    for (let i = 1; i <= 5; i++) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `renders/${articleID}-${i}.jpg`,
      };
      promises.push(s3.headObject(params).promise());
    }

    await Promise.all(promises);
    // If all promises resolve, all files exist
    res.status(200).json({ exists: true });
  } catch (error) {
    // If any promise rejects, at least one file does not exist
    res.status(200).json({ exists: false });
  }
}