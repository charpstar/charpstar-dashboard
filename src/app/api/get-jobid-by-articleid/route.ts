import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";
import { isJobActive } from "@/lib/render/status";

const dynamoClient = new DynamoDBClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const articleID = searchParams.get('articleID');

  if (!articleID) {
    return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
  }

  try {
    const command = new QueryCommand({
      TableName: "BatchJobProgress",
      IndexName: "articleID-index",
      KeyConditionExpression: "articleID = :articleID",
      ExpressionAttributeValues: {
        ":articleID": articleID,
      },
      ScanIndexForward: false, // Get most recent first
      Limit: 1,
    });

    const { Items } = await docClient.send(command);
    
    if (!Items?.length) {
      return NextResponse.json({ error: 'No job found' }, { status: 404 });
    }

    const job = Items[0];
    
    // Only return active jobs
    if (!isJobActive(job)) {
      return NextResponse.json({ error: 'No active job found' }, { status: 404 });
    }

    return NextResponse.json({ jobId: job.jobId });
  } catch (error) {
    console.error('DynamoDB Error:', error);
    return NextResponse.json({ error: 'Failed to fetch job ID' }, { status: 500 });
  }
}