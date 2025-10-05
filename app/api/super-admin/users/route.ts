import { NextResponse } from 'next/server';
import { getAdminDatabases, getAdminUsers, getAdminTeams } from '@/lib/appwrite-admin';
import { Query, Role } from 'node-appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const STUDENT_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID!;
const TEACHER_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TEACHER_PROFILES_COLLECTION_ID!;
const TEACHERS_TEAM_ID = process.env.APPWRITE_TEACHERS_TEAM_ID!;

export async function GET() {
  try {
    const databases = getAdminDatabases();
    const teams = getAdminTeams();
    const usersApi = getAdminUsers();

    const [studentsResponse, teachersResponse] = await Promise.all([
      databases.listDocuments(DATABASE_ID, STUDENT_PROFILES_COLLECTION_ID),
      databases.listDocuments(DATABASE_ID, TEACHER_PROFILES_COLLECTION_ID),
    ]);

    const teacherMemberships = await teams.listMemberships(TEACHERS_TEAM_ID);
    const memberIds = new Set(teacherMemberships.memberships.map(m => m.userId));

    const teachersWithEmail = await Promise.all(
      teachersResponse.documents.map(async (t) => {
        try {
          const user = await usersApi.get(t.userId);
          return {
            ...t,
            email: user.email, // attach email
            isTeamMember: memberIds.has(t.userId),
          };
        } catch {
          // fallback if user not found
          return {
            ...t,
            email: "",
            isTeamMember: memberIds.has(t.userId),
          };
        }
      })
    );

    // Same for students if needed
    const studentsWithEmail = await Promise.all(
      studentsResponse.documents.map(async (s) => {
        try {
          const user = await usersApi.get(s.userId);
          return {
            ...s,
            email: user.email,
          };
        } catch {
          return { ...s, email: "" };
        }
      })
    );

    return NextResponse.json({ students: studentsWithEmail, teachers: teachersWithEmail });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    console.log("🔹 POST /api/super-admin/users called");

    const body = await request.json();
    console.log("📩 Request body:", body);

    const { userId, email } = body;
    if (!userId) {
      console.error("❌ Missing userId in request body");
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const teams = getAdminTeams();
    console.log("✅ Admin Teams client initialized");

    console.log("➡️ Adding user to Teachers team", {
      TEACHERS_TEAM_ID,
      userId,
    });

    const membership = await teams.createMembership({
      teamId: TEACHERS_TEAM_ID,
      roles: ["teacher"],
      userId, // direct add (admin only)
    });

    console.log("✅ Membership created successfully:", membership);

    return NextResponse.json({
      success: true,
      message: "Teacher added to team.",
      membership,
    });
  } catch (error: unknown) { // ✅ FIX: Changed 'any' to 'unknown'
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("❌ Error adding teacher to team:", message);
    return NextResponse.json(
      { error: "Failed to add teacher to team", details: message },
      { status: 500 }
    );
  }
}


export async function DELETE(request: Request) {
  try {
    const { userId, profileId, role } = await request.json();
    const users = getAdminUsers();
    const databases = getAdminDatabases();

    // 1. Delete Appwrite Auth user
    await users.delete(userId);

    // 2. Delete profile document
    const collectionId = role === 'student' ? STUDENT_PROFILES_COLLECTION_ID : TEACHER_PROFILES_COLLECTION_ID;
    await databases.deleteDocument(DATABASE_ID, collectionId, profileId);

    return NextResponse.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}