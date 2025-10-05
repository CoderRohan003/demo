import { NextResponse } from 'next/server';
import { getAdminDatabases } from '@/lib/appwrite-admin';
import { ID } from 'node-appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;

export async function GET() {
  try {
    const databases = getAdminDatabases();
    const batches = await databases.listDocuments(
      DATABASE_ID,
      BATCHES_COLLECTION_ID
    );
    return NextResponse.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log("🔹 POST /api/super-admin/batches called");

    const batchData = await request.json();
    console.log("📩 Request body:", batchData);

    const databases = getAdminDatabases();
    console.log("✅ Admin Databases client initialized");

    // Make sure batchData has all required fields
    if (!batchData.name) {
      console.error("❌ Batch name is missing");
      return NextResponse.json({ error: "Batch name is required" }, { status: 400 });
    }

    const newBatch = await databases.createDocument(
      DATABASE_ID,
      BATCHES_COLLECTION_ID,
      ID.unique(),
      batchData
    );

    console.log("✅ Batch created successfully:", newBatch);

    return NextResponse.json(newBatch);
  } catch (error: any) {
    console.error("❌ Error creating batch:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to create batch", details: error?.message },
      { status: 500 }
    );
  }
}


export async function DELETE(request: Request) {
  try {
    const { batchId } = await request.json();
    const databases = getAdminDatabases();
    await databases.deleteDocument(DATABASE_ID, BATCHES_COLLECTION_ID, batchId);
    return NextResponse.json({ success: true, message: 'Batch deleted.' });
  } catch (error) {
    console.error('Error deleting batch:', error);
    return NextResponse.json({ error: 'Failed to delete batch' }, { status: 500 });
  }
}