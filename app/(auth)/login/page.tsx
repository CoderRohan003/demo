'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { account, databases } from '@/lib/appwrite';
import { useAuth } from '@/context/AuthContext';
import { Query } from 'appwrite';
import { OAuthProvider } from 'node-appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const STUDENT_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID!;
const TEACHER_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TEACHER_PROFILES_COLLECTION_ID!;
const SUPER_ADMIN_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SUPER_ADMIN_PROFILES_COLLECTION_ID!;

// SVG for the colored Google icon
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" width="20px" height="20px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,35.619,44,29.827,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser, setProfile } = useAuth();

  const handleGoogleLogin = () => {
    try {
      account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/home`, // Success URL
        `${window.location.origin}/login`  // Failure URL
      );
    } catch (error) {
      console.error("Failed to initiate Google login", error);
      setError("Could not start Google login process.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);

      let userProfile = null;
      const collectionsToCheck = [
          SUPER_ADMIN_PROFILES_COLLECTION_ID,
          TEACHER_PROFILES_COLLECTION_ID,
          STUDENT_PROFILES_COLLECTION_ID,
      ];

      for (const collectionId of collectionsToCheck) {
          const response = await databases.listDocuments(
              DATABASE_ID,
              collectionId,
              [Query.equal('userId', currentUser.$id)]
          );
          if (response.documents.length > 0) {
              userProfile = response.documents[0];
              break;
          }
      }
      
      setProfile(userProfile);

      if (userProfile?.role === 'super-admin') {
          router.push('/super-admin');
      } else if (userProfile?.role === 'teacher') {
          router.push('/admin/upload');
      } else {
          router.push('/home');
      }

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please check your credentials.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-bold text-[rgb(var(--card-foreground))]">Welcome Back!</h1>
      <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">Enter your credentials to access your account.</p>
      
      <div className="my-6">
        <button 
          onClick={handleGoogleLogin}
          className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 border border-[rgb(var(--border))] rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <GoogleIcon /> Sign in with Google
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[rgb(var(--border))]"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[rgb(var(--card))] px-2 text-[rgb(var(--muted-foreground))]">
            Or continue with
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-[rgb(var(--card-foreground))]">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--input))] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-[rgb(var(--card-foreground))]">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--input))] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
            required
            disabled={isLoading}
          />
        </div>

        {/* --- NEW FORGOT PASSWORD LINK --- */}
        <div className="text-right">
            <Link href="/forgot-password" legacyBehavior>
                <a className="text-sm font-medium text-blue-400 hover:underline">
                    Forgot Password?
                </a>
            </Link>
        </div>

        {error && <p className="text-sm text-[rgb(var(--destructive))] text-center">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 font-bold text-[rgb(var(--primary-foreground))] bg-[rgb(var(--primary))] rounded-md hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-sm text-center text-[rgb(var(--muted-foreground))] mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-[rgb(var(--primary))] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;