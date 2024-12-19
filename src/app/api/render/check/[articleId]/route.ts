import { NextResponse } from "next/server";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  request: Request,
  { params }: { params: { articleId: string } }
) {
  try {
    const { articleId } = params;
    const promises = [];

    // Check if all 5 renders exist
    for (let i = 1; i <= 5; i++) {
      const command = new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `renders/${articleId}-${i}.jpg`,
      });
      promises.push(s3Client.send(command));
    }

    try {
      await Promise.all(promises);
      return NextResponse.json({ exists: true });
    } catch {
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking renders:", error);
    return NextResponse.json({ error: "Failed to check renders" }, { status: 500 });
  }
}