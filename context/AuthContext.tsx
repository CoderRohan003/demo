// context/AuthContext.tsx

'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { account, databases } from '@/lib/appwrite';
import { Models, Query } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const STUDENT_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID!;
const TEACHER_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TEACHER_PROFILES_COLLECTION_ID!;
const SUPER_ADMIN_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SUPER_ADMIN_PROFILES_COLLECTION_ID!;

interface UserProfile extends Models.Document {
  role?: 'student' | 'teacher' | 'admin' | 'super-admin';
  name?: string;
  userId?: string;
  bio?: string;
  title?: string;
  academicLevel?: string;
  avatarS3Key?: string;
  experience?: string;
  qualifications?: string[];
  approved: boolean;
}

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  profile: UserProfile | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refetchProfile: () => Promise<UserProfile | null>;
  setUser: React.Dispatch<React.SetStateAction<Models.User<Models.Preferences> | null>>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = async (currentUser: Models.User<Models.Preferences>) => {
    try {
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
          const foundProfile = response.documents[0] as unknown as UserProfile;
          setProfile(foundProfile);
          return foundProfile;
        }
      }

      // If no profile is found after checking all collections, redirect.
      if (pathname !== '/google-register') {
        router.push('/google-register');
      }
      setProfile(null);
      return null;

    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        await fetchProfile(currentUser);
      } catch (error) {
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const logout = async () => {
    await account.deleteSession('current');
    setUser(null);
    setProfile(null);
    router.push('/login');
  };

  const refetchProfile = async (): Promise<UserProfile | null> => {
    if (user) {
      // Clear profile before refetching to ensure we get the latest
      setProfile(null); 
      return await fetchProfile(user);
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, isLoading, logout, refetchProfile, setUser, setProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};