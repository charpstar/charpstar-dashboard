import AWS from 'aws-sdk';

AWS.config.update({
  region: 'eu-north-1',
});

export default async function handler(req, res) {
  const { articleID } = req.query;
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'BatchJobProgress',
    IndexName: 'articleID-index',  // Assuming 'articleID-index' GSI is correctly set up in DynamoDB
    KeyConditionExpression: 'articleID = :articleID',
    ExpressionAttributeValues: {
      ':articleID': articleID,
    },
  };

  try {
    const { Items } = await dynamoDb.query(params).promise();
    // Check if Items are found and modelStatus is not 'Finished'
    if (Items.length > 0 && Items[0].modelStatus !== 'Finished') {
        res.status(200).json({ jobId: Items[0].jobId });
    } else {
      // Respond with an error if no items are found or modelStatus is 'Finished'
      res.status(404).json({ error: 'JobID not found for the given ArticleID or job is already finished' });
    }
  } catch (error) {
    console.error('DynamoDB Error:', error);
    res.status(500).json({ error: 'Failed to fetch JobID by ArticleID' });
  }
}