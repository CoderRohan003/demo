// //app/components/auth/withAuth.tsx

// 'use client';

// import { useEffect } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
// import { FullPageLoader } from '../FullPageLoader';

// const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
//   const AuthComponent = (props: P) => {
//     const { user, isLoading } = useAuth();
//     const router = useRouter();
//     const pathname = usePathname();

//     // In withAuth.tsx, update the useEffect:
// useEffect(() => {
//   console.log('withAuth effect running:', { isLoading, hasUser: !!user, pathname }); // Log dependencies
//   if (!isLoading && !user && pathname !== '/login' && pathname !== '/register') {
//     console.log('Triggering redirect to /login'); // Confirm trigger
//     router.replace('/login');
//   }
// }, [user, isLoading, router, pathname]);

//     if (isLoading || (!user && pathname !== '/login' && pathname !== '/register')) {
//       return <FullPageLoader />;
//     }

//     return <WrappedComponent {...props} />;
//   };

//   return AuthComponent;
// };

// export default withAuth;



// app/components/auth/withAuth.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FullPageLoader } from '../FullPageLoader';

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return function AuthenticatedComponent(props: P) {
    const { user, profile, isLoading, refetchProfile } = useAuth();
    const router = useRouter();

    useEffect(() => {
      console.log('withAuth effect running:', { isLoading, hasUser: !!user, hasProfile: !!profile, pathname: window.location.pathname });
      
      // Wait for full loading to complete (user + profile)
      if (isLoading) {
        return;  // Still loading, don't redirect yet
      }

      if (!user) {
        // No user, redirect to login
        router.push('/login');
        return;
      }

      if (!profile) {
        // User exists but no profile, refetch or redirect to register
        refetchProfile().then((fetchedProfile) => {
          if (!fetchedProfile) {
            router.push('/google-register');
          }
        });
        return;
      }

      // Full state loaded: user + profile present
      // For dashboard pages, let the page handle role-based redirects
      // But ensure we're not stuck - if on /home and should redirect, page will handle
    }, [isLoading, user, profile, router, refetchProfile]);

    // Render loader until full state is ready
    if (isLoading || !user || !profile) {
      return (
        <FullPageLoader />
      );
    }

    // Full auth state ready: render the wrapped component
    return <WrappedComponent {...props} />;
  };
};

export default withAuth;