// This is to view the lecture

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// This function handles POST requests made to /api/view
export async function POST(request: Request) {
  try {
    // Get the unique key of the video the student wants to watch
    const { s3Key } = await request.json();

    // **IMPORTANT**: In a real-world app, you would add security logic here
    // to verify the logged-in user is actually enrolled in the course
    // before generating a link.

    // Prepare the command to get an object from your S3 bucket
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: s3Key,
    });

    // Generate the secure, pre-signed URL. It's set to expire in 10 minutes (600 seconds).
    const url = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    // Send the temporary viewing URL back to the browser
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error creating pre-signed view URL", error);
    return NextResponse.json({ error: "Error creating pre-signed view URL" }, { status: 500 });
  }
}