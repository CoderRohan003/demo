'use client';

import { useAuth } from '@/context/AuthContext';
import withAuth from '@/app/components/auth/withAuth';
import StudentProfile from '@/app/components/profiles/StudentProfile';
import TeacherProfile from '@/app/components/profiles/TeacherProfile';
import { FullPageLoader } from '@/app/components/FullPageLoader';
import SuperAdminProfile from '@/app/components/profiles/SuperAdminProfile';

const ProfilePage = () => {
  const { profile, isLoading } = useAuth();

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <FullPageLoader />
      </div>
    );
  }

  switch (profile.role) {
    case 'student':
      return <StudentProfile />;
    case 'teacher':
      return <TeacherProfile />;
    case 'super-admin':
      return <SuperAdminProfile />;
    default:
      return <div>Could not determine user role.</div>;
  }
};

export default withAuth(ProfilePage);