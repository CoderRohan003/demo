import { NextResponse } from 'next/server';
import { getAdminDatabases } from '@/lib/appwrite-admin';
import { Query } from 'node-appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const STUDENT_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID!;
const TEACHER_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TEACHER_PROFILES_COLLECTION_ID!;
const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;
const ENROLLMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ENROLLMENTS_COLLECTION_ID!;

export async function GET() {
  try {
    const databases = getAdminDatabases();

    const [studentResponse, teacherResponse, batchResponse] = await Promise.all([
      databases.listDocuments(DATABASE_ID, STUDENT_PROFILES_COLLECTION_ID, [Query.limit(1)]),
      databases.listDocuments(DATABASE_ID, TEACHER_PROFILES_COLLECTION_ID, [Query.limit(1)]),
      databases.listDocuments(DATABASE_ID, BATCHES_COLLECTION_ID),
    ]);

    const batchEnrollments = await Promise.all(
      batchResponse.documents.map(async (batch) => {
        const enrollmentResponse = await databases.listDocuments(
          DATABASE_ID,
          ENROLLMENTS_COLLECTION_ID,
          [Query.equal('batchId', batch.$id), Query.limit(1)]
        );
        return {
          batchName: batch.name,
          enrollmentCount: enrollmentResponse.total,
        };
      })
    );

    const stats = {
      studentCount: studentResponse.total,
      teacherCount: teacherResponse.total,
      batchCount: batchResponse.total,
      batchEnrollments,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}