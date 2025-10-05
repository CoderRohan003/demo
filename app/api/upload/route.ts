// This is to upload lecture

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import crypto from "crypto";

// Initialize the S3 client using your environment variables
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// This function handles POST requests made to /api/upload
export async function POST(request: Request) {
  try {
    // Get the filename and file type from the request sent by the browser
    const { filename, contentType } = await request.json();

    // Generate a unique key for the file to prevent overwriting files with the same name
    const randomBytes = crypto.randomBytes(16);
    const key = `${randomBytes.toString("hex")}-${filename}`;

    // Prepare the command to put an object into your S3 bucket
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    });

    // Generate the secure, pre-signed URL. It's set to expire in 1 hour (3600 seconds).
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Send the URL and the unique key back to the browser
    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("Error creating pre-signed URL", error);
    return NextResponse.json({ error: "Error creating pre-signed URL" }, { status: 500 });
  }
}