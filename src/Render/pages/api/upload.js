import AWS from 'aws-sdk';
import formidable from 'formidable-serverless';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Something went wrong during the file upload' });
      return;
    }

    // Configure AWS SDK for S3
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    const s3 = new AWS.S3();
    const fileStream = fs.createReadStream(files.file.path);
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${files.file.name}`,
      Body: fileStream,
    };

    // Upload the file to S3
    s3.upload(params, async function(s3Err, data) {
      if (s3Err) {
        res.status(500).json({ error: 'Failed to upload file to S3' });
        return;
      }
      
      // After successful upload to S3
// Inside the s3.upload callback, after successfully uploading the file to S3

      const lambda = new AWS.Lambda();
      const customPayload = {
        s3_bucket: process.env.S3_BUCKET_NAME,
        s3_key: data.Key,
      };

      const lambdaParams = {
        FunctionName: 'SubmitBatchJobGLB', // Your Lambda function's name or ARN
        InvocationType: 'RequestResponse', // Changed to synchronous invocation
        Payload: JSON.stringify(customPayload),
      };

      lambda.invoke(lambdaParams, function(err, lambdaResponse) {
        if (err) {
          console.error('Error invoking Lambda:', err);
          res.status(500).json({ error: 'Failed to invoke Lambda function' });
          return;
        }
        // Lambda invoked successfully, parse the response to get the jobId
        const responsePayload = JSON.parse(lambdaResponse.Payload);
        console.log(responsePayload); // Log to verify structure
        
        // Since the jobId is within the 'body' as a stringified JSON, parse 'body' to get jobId
        const body = JSON.parse(responsePayload.body); // Parse the 'body' to access 'jobId'
        const jobId = body.jobId;
        console.log('Lambda invoked, jobId:', jobId); // Verify jobId value
      
        if (!jobId) {
          console.error('JobId is undefined or not present in the Lambda response');
          res.status(500).json({ error: 'JobId is undefined or not present in the Lambda response' });
          return;
        }
      
        res.status(200).json({ message: 'File uploaded and Lambda invoked successfully', jobId: jobId });
      });
    });
  });
}