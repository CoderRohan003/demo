'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FullPageLoader } from '../FullPageLoader';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!isLoading && !user && pathname !== '/login' && pathname !== '/register') {
        router.replace('/login');
      }
    }, [user, isLoading, router, pathname]);

    if (isLoading || (!user && pathname !== '/login' && pathname !== '/register')) {
      return <FullPageLoader />;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
