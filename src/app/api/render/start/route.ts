import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
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

    // Verify the upload
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: s3Key
      });
      const headResponse = await s3Client.send(headCommand);
      console.log(`Verified S3 upload: ${s3Key}, Size: ${headResponse.ContentLength} bytes`);
    } catch (error) {
      console.error('Failed to verify S3 upload:', error);
      throw new Error('Failed to verify file upload to S3');
    }

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
      throw new Error('No payload received from Lambda');
    }

    const payload = JSON.parse(new TextDecoder().decode(response.Payload));
    
    if (response.FunctionError) {
      console.error('Lambda execution failed:', response.FunctionError);
      throw new Error(`Lambda execution failed: ${response.FunctionError}`);
    }

    const { jobId } = JSON.parse(payload.body);

    if (!jobId) {
      throw new Error('No jobId received from Lambda');
    }

    console.log(`Render job started successfully: ${jobId}`);
    return NextResponse.json({ jobId });
  } catch (error) {
    console.error("Error starting render:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start render" },
      { status: 500 }
    );
  }
}