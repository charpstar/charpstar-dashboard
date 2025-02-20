import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const s3Client = new S3Client({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

const lambdaClient = new LambdaClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

export async function POST(request: Request) {
  try {
    console.log('AWS Region:', process.env.AWS_REGION);
    console.log('S3 Bucket:', process.env.S3_BUCKET_NAME);
    console.log('Has AWS Access Key:', !!process.env.AWS_ACCESS_KEY_ID);
    console.log('Has AWS Secret Key:', !!process.env.AWS_SECRET_ACCESS_KEY);
    console.log('Starting render process...');

    const { articleId, renderSettings } = await request.json();
    console.log('Article ID:', articleId);
    console.log('Render Settings:', renderSettings);

    if (!articleId) {
      console.log('Missing articleId');
      return NextResponse.json(
        { error: "Missing articleId" },
        { status: 400 }
      );
    }

    // Test AWS connectivity
    try {
      console.log('Testing S3 connection...');
      const testCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: 'test.txt',
        Body: 'test',
      });
      await s3Client.send(testCommand);
      console.log('S3 connection successful');
    } catch (awsError) {
      console.error('AWS Connection test failed:', awsError);
      return NextResponse.json(
        { error: 'AWS Connection failed', details: String(awsError) },
        { status: 500 }
      );
    }

    const s3Key = `${articleId}.glb`;
    console.log(`Processing render request for article ${articleId}`);

    // Invoke Lambda function with render settings
    console.log('Invoking Lambda function...');
    const command = new InvokeCommand({
      FunctionName: "SubmitBatchJobGLB",
      Payload: JSON.stringify({ 
        s3_bucket: process.env.S3_BUCKET_NAME, 
        s3_key: s3Key,
        renderSettings: {
          RENDER_MARGIN: renderSettings?.margin ?? 90,
          BG_COLOR: renderSettings?.backgroundColor ?? "1,1,1",
          RESOLUTION: renderSettings?.resolution ?? "1920x1080",
          IMAGE_FORMAT: renderSettings?.imageFormat ?? "JPEG"
        }
      }),
    });

    const response = await lambdaClient.send(command);
    
    if (!response.Payload) {
      return NextResponse.json(
        { error: 'No response from Lambda' },
        { status: 500 }
      );
    }
    const payloadText = new TextDecoder().decode(response.Payload);
    
    try {
      const payload = JSON.parse(payloadText);
      const body = JSON.parse(payload.body);
      if (!body.jobId) {
        return NextResponse.json(
          { error: 'No jobId received from Lambda' },
          { status: 500 }
        );
      }
      console.log(`Render job started successfully: ${body.jobId}`);
      return NextResponse.json({ jobId: body.jobId });
    } catch (parseError) {
      console.error('Failed to parse Lambda response:', payloadText);
      return NextResponse.json(
        { error: 'Invalid response from Lambda' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Detailed error in render process:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to start render",
        details: String(error)
      },
      { status: 500 }
    );
  }
}