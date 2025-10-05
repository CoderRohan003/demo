'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FullPageLoader } from '../FullPageLoader';

const withSuperAdminAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const SuperAdminAuthComponent = (props: P) => {
    const { profile, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!profile || profile.role !== 'super-admin') {
          router.replace('/home'); // Redirect if not a super admin
        }
      }
    }, [profile, isLoading, router]);

    if (isLoading || !profile || profile.role !== 'super-admin') {
      return <FullPageLoader />;
    }

    return <WrappedComponent {...props} />;
  };

  return SuperAdminAuthComponent;
};

export default withSuperAdminAuth;