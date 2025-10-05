// app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import { getAdminDatabases } from '@/lib/appwrite-admin';
import { Query } from 'node-appwrite';
import { headers } from 'next/headers';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// Make sure to create this collection in your Appwrite console
const NOTIFICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!;

export async function GET() {
  try {
    const headersList = headers();
    const userId = (await headersList).get('X-User-Id');

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const databases = getAdminDatabases();
    const response = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(15) // Fetch the 15 most recent notifications
      ]
    );

    return NextResponse.json(response.documents);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}