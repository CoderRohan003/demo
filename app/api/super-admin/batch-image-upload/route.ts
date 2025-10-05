import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import crypto from "crypto";

const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

// Using the same bucket as avatars for simplicity, or you can create a new one.
const BUCKET_NAME = process.env.AWS_S3_AVATAR_BUCKET_NAME!; 

export async function POST(request: Request) {
    try {
        const { filename, contentType } = await request.json();
        
        // Generate a unique key for the file
        const key = `${crypto.randomBytes(16).toString("hex")}-${filename}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 600 });
        
        // Return the pre-signed URL and the key to store in Appwrite
        return NextResponse.json({ url, key });
    } catch (error) {
        console.error("Error creating batch image pre-signed URL", error);
        return NextResponse.json({ error: "Error creating pre-signed URL" }, { status: 500 });
    }
}