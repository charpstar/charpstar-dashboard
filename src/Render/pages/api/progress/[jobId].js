import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
  region: 'eu-north-1',  // Update with your AWS region
  // credentials, if necessary
});

export default async function handler(req, res) {
  const { jobId } = req.query;
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'BatchJobProgress',  // Update with your DynamoDB table name
    Key: { jobId },
  };

  try {
    const { Item } = await dynamoDb.get(params).promise();
    res.status(200).json(Item || {});
  } catch (error) {
    console.error('DynamoDB Error:', error);
    res.status(500).json({ error: 'Failed to fetch job progress' });
  }
}