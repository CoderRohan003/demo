// This is to view the lecture resources

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { s3Key } = await request.json();

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_RESOURCES_BUCKET_NAME!, // Assumes a new bucket for resources
      Key: s3Key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error creating pre-signed view URL for resource", error);
    return NextResponse.json({ error: "Error creating pre-signed view URL for resource" }, { status: 500 });
  }
}