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
    // Don't log the actual keys, just check if they exist
    console.log('Has AWS Access Key:', !!process.env.AWS_ACCESS_KEY_ID);
    console.log('Has AWS Secret Key:', !!process.env.AWS_SECRET_ACCESS_KEY);

    // Get the GLB file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const articleId = formData.get('articleId') as string;

    if (!file || !articleId) {
      return NextResponse.json(
        { error: "Missing file or articleId" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size === 0) {
      return NextResponse.json(
        { error: "GLB file is empty" },
        { status: 400 }
      );
    }

    console.log(`Processing render request for article ${articleId}`);
    console.log(`File size: ${file.size} bytes`);

    // Upload to S3
    const s3Key = `${articleId}.glb`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: s3Key,
      Body: buffer,
      ContentType: 'model/gltf-binary'
    });

    await s3Client.send(uploadCommand);
    console.log(`Uploaded GLB to S3: ${s3Key}`);

    // Invoke Lambda function
    console.log('Invoking Lambda function...');
    const command = new InvokeCommand({
      FunctionName: "SubmitBatchJobGLB",
      Payload: JSON.stringify({ 
        s3_bucket: process.env.S3_BUCKET_NAME, 
        s3_key: s3Key
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
    console.error("Error starting render:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start render" },
      { status: 500 }
    );
  }
}