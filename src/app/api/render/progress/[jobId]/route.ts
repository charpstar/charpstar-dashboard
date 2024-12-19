import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    const command = new GetCommand({
      TableName: "BatchJobProgress",
      Key: { jobId },
    });

    const response = await docClient.send(command);
    const item = response.Item;

    if (!item) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      progress: item.progress,
      status: item.status,
      modelStatus: item.modelStatus,
    });
  } catch (error) {
    console.error("Error getting job progress:", error);
    return NextResponse.json(
      { error: "Failed to get job progress" },
      { status: 500 }
    );
  }
}