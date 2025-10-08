// app/api/announcements/route.ts
import { NextResponse } from 'next/server';
import { getAdminDatabases } from '@/lib/appwrite-admin';
import { Query } from 'node-appwrite';
import { headers } from 'next/headers';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const NOTIFICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!;
const ENROLLMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ENROLLMENTS_COLLECTION_ID!;

export async function GET() {
  try {
    const headersList = headers();
    const userId = (await headersList).get('X-User-Id');

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const databases = getAdminDatabases();

    // 1. Find the batches the user is enrolled in
    const enrollmentResponse = await databases.listDocuments(
        DATABASE_ID,
        ENROLLMENTS_COLLECTION_ID,
        [Query.equal('userId', userId)]
    );
    const enrolledBatchIds = enrollmentResponse.documents.map(doc => doc.batchId);

    // 2. Fetch announcements targeted at 'global' or the user's specific batches
    const announcementResponse = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [
        Query.equal('type', 'announcement'),
        Query.equal('targetId', ['global', ...enrolledBatchIds]),
        Query.orderDesc('$createdAt'),
        Query.limit(50) // Fetch the 50 most recent announcements
      ]
    );

    return NextResponse.json(announcementResponse.documents);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}