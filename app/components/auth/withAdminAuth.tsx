'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { FullPageLoader } from '../FullPageLoader';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// FIX: Define both collection IDs
const STUDENT_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID!;
const TEACHER_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TEACHER_PROFILES_COLLECTION_ID!;

const withAdminAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AdminAuthComponent = (props: P) => {
    const { user, profile, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isCheckingRole, setIsCheckingRole] = useState(true);

    useEffect(() => {
      if (!isAuthLoading && user) {
        const checkRole = async () => {
          try {
            // ✅ First trust profile from context
            if (profile?.role === 'teacher' || profile?.role === 'admin') {
              setIsAuthorized(true);
              setIsCheckingRole(false);
              return;
            }

            // If profile not loaded yet, query Appwrite as fallback
            let response = await databases.listDocuments(
              DATABASE_ID,
              TEACHER_PROFILES_COLLECTION_ID,
              [Query.equal('userId', user.$id)]
            );

            let userProfile = response.documents.length > 0 ? response.documents[0] : null;

            if (!userProfile) {
              response = await databases.listDocuments(
                DATABASE_ID,
                STUDENT_PROFILES_COLLECTION_ID,
                [Query.equal('userId', user.$id)]
              );
              userProfile = response.documents.length > 0 ? response.documents[0] : null;
            }

            if (userProfile && (userProfile.role === 'teacher' || userProfile.role === 'admin')) {
              setIsAuthorized(true);
            } else {
              router.replace('/home');
            }
          } catch (error) {
            console.error("Failed to fetch user role:", error);
            router.replace('/home');
          } finally {
            setIsCheckingRole(false);
          }
        };

        checkRole();
      } else if (!isAuthLoading && !user) {
        router.replace('/login');
      }
    }, [user, profile, isAuthLoading, router]);


    if (isAuthLoading || isCheckingRole) {
      return <FullPageLoader />;
    }

    return isAuthorized ? <WrappedComponent {...props} /> : null;
  };

  return AdminAuthComponent;
};

export default withAdminAuth;