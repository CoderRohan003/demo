import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { Readable } from "stream";

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Convert Node.js Readable to Web ReadableStream
function nodeStreamToWeb(stream: Readable): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => controller.enqueue(new Uint8Array(chunk)));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const s3Key = searchParams.get("s3Key");

  if (!s3Key) {
    return new NextResponse("s3Key parameter is required", { status: 400 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_AVATAR_BUCKET_NAME!,
      Key: s3Key,
    });

    const s3Response = await s3Client.send(command);

    if (!s3Response.Body) {
      return new NextResponse("Image not found in S3", { status: 404 });
    }

    // Handle both Node.js Readable and browser ReadableStream
    const body: ReadableStream | Blob | string = s3Response.Body instanceof Readable
      ? nodeStreamToWeb(s3Response.Body)
      : (s3Response.Body as ReadableStream | Blob | string);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": s3Response.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable", // cache for 1 year
      },
    });

  } catch (err: unknown) {
    console.error("Error streaming image from S3:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
