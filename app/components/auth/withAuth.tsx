//app/components/auth/withAuth.tsx

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

    // In withAuth.tsx, update the useEffect:
useEffect(() => {
  console.log('withAuth effect running:', { isLoading, hasUser: !!user, pathname }); // Log dependencies
  if (!isLoading && !user && pathname !== '/login' && pathname !== '/register') {
    console.log('Triggering redirect to /login'); // Confirm trigger
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
