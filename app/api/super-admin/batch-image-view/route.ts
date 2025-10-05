import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Using the avatar bucket, as configured in the batch image upload route
const BUCKET_NAME = process.env.AWS_S3_AVATAR_BUCKET_NAME!; 

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const s3Key = searchParams.get('s3Key');

  if (!s3Key) {
    return new NextResponse("s3Key parameter is required", { status: 400 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const s3Response = await s3Client.send(command);

    if (!s3Response.Body) {
      return new NextResponse("Image not found in S3", { status: 404 });
    }

    // Stream the image data directly back to the client
    return new NextResponse(s3Response.Body as any, {
      status: 200,
      headers: {
        "Content-Type": s3Response.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for a year
      },
    });

  } catch (error) {
    console.error("Error streaming batch image from S3:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}