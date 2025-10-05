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

// This is a separate bucket for avatars
const AVATAR_BUCKET_NAME = 'mise-avatars-2025';

export async function POST(request: Request) {
    try {
        const { filename, contentType } = await request.json();
        const randomBytes = crypto.randomBytes(16);
        const key = `${randomBytes.toString("hex")}-${filename}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_AVATAR_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 600 });
        return NextResponse.json({ url, key });
    } catch (error) {
        console.error("Error creating avatar pre-signed URL", error);
        return NextResponse.json({ error: "Error creating avatar pre-signed URL" }, { status: 500 });
    }
}