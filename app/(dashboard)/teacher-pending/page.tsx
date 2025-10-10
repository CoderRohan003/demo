'use client';

import { useAuth } from '@/context/AuthContext';
import withAuth from '@/app/components/auth/withAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FullPageLoader } from '@/app/components/FullPageLoader';

const TeacherPendingPage = () => {
  const { profile, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && profile) {
      if (profile.role !== 'teacher' || profile.approved) {
        router.replace('/home');
      }
    }
  }, [profile, isAuthLoading, router]);

  if (isAuthLoading || !profile || profile.role !== 'teacher' || profile.approved) {
    return <FullPageLoader />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Registration Pending
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Thank you for registering as a teacher, {profile.name}. Your account is under review by the super admin. 
          You will be notified once approved and can start uploading lectures.
        </p>
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <p>• Please check back later or refresh the page</p>
          <p>• Approval typically takes 24-48 hours</p>
        </div>
      </div>
    </div>
  );
};

export default withAuth(TeacherPendingPage);