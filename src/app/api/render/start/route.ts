import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { s3_bucket, s3_key } = body;

    // Invoke Lambda function
    const command = new InvokeCommand({
      FunctionName: "SubmitBatchJobGLB",
      Payload: JSON.stringify({ s3_bucket, s3_key }),
    });

    const response = await lambdaClient.send(command);
    const payload = JSON.parse(new TextDecoder().decode(response.Payload));
    const { jobId } = JSON.parse(payload.body);

    return NextResponse.json({ jobId });
  } catch (error) {
    console.error("Error starting render:", error);
    return NextResponse.json(
      { error: "Failed to start render" },
      { status: 500 }
    );
  }
}