"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import productsData from "@/data/products.json";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      lastError = error;
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw lastError;
}

function findGlbLink(articleId: string): string | null {
  // Search through all clients
  for (const clientProducts of Object.values(productsData.clients)) {
    const product = clientProducts.find(p => p.articleID === articleId);
    if (product) {
      return product.glbLink;
    }
  }
  return null;
}

export async function startRender(articleId: string) {
  try {
    // Find GLB link from products data
    const glbUrl = findGlbLink(articleId);
    if (!glbUrl) {
      throw new Error(`No GLB link found for article ID: ${articleId}`);
    }

    console.log(`Attempting to fetch GLB from: ${glbUrl}`);
    const response = await fetchWithRetry(glbUrl);
    const glbFile = await response.blob();

    console.log("Successfully fetched GLB file");

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `${articleId}.glb`,
      ContentType: "model/gltf-binary",
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // Upload the file
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      body: glbFile,
      headers: {
        "Content-Type": "model/gltf-binary",
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload to S3: ${uploadResponse.statusText}`);
    }

    console.log("Successfully uploaded to S3");

    // Invoke Lambda function
    const invokeCommand = new InvokeCommand({
      FunctionName: "SubmitBatchJobGLB",
      Payload: JSON.stringify({
        s3_bucket: process.env.S3_BUCKET_NAME,
        s3_key: `${articleId}.glb`,
      }),
    });

    const lambdaResponse = await lambdaClient.send(invokeCommand);
    const payload = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
    const { jobId } = JSON.parse(payload.body);

    console.log("Successfully started render job:", jobId);

    return jobId;
  } catch (error) {
    console.error("Error starting render:", error);
    throw error;
  }
}