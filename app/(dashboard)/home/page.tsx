// app/(dashboard)/home/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import withAuth from '@/app/components/auth/withAuth';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { FullPageLoader } from '@/app/components/FullPageLoader';
import BatchCard from '@/app/components/BatchCard';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;

interface Batch {
  $id: string;
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
}

// Skeleton for loading state
const SkeletonCard = () => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse bg-white dark:bg-gray-800 overflow-hidden">
    <div className="h-56 bg-gray-100 dark:bg-gray-700"></div>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-100 dark:bg-gray-600 rounded w-3/4"></div>
      <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-full"></div>
      <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-5/6"></div>
      <div className="pt-4 flex justify-between items-center">
        <div className="h-6 bg-gray-100 dark:bg-gray-600 rounded w-20"></div>
        <div className="h-10 bg-gray-100 dark:bg-gray-600 rounded w-28"></div>
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const { profile, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && profile?.role === 'teacher') {
      router.replace('/admin/upload');
    } else if (!isAuthLoading && profile?.role === 'super-admin') {
      router.replace('/super-admin');
    }
  }, [profile, isAuthLoading, router]);

  useEffect(() => {
    if (!isAuthLoading && profile) {
      setIsReady(true);
    }
  }, [profile, isAuthLoading]);

  useEffect(() => {
    if (!isReady || profile?.role !== 'student' || !profile.academicLevel) return;
    let isMounted = true;
    const fetchBatches = async () => {
      setIsLoadingBatches(true);
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          BATCHES_COLLECTION_ID,
          [Query.equal("targetClasses", Number(profile.academicLevel))]
        );
        if (isMounted) setBatches(response.documents as unknown as Batch[]);
      } catch (error) {
        console.error("Failed to fetch batches:", error);
      } finally {
        if (isMounted) setIsLoadingBatches(false);
      }
    };
    fetchBatches();
    return () => {
      isMounted = false;
    };
  }, [isReady, profile]);

  if (isAuthLoading || !profile || (profile.role !== 'student' && !isReady)) {
    return <FullPageLoader />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Your Batches
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Explore courses for {profile.academicLevel}th Grade
          </p>
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingBatches ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : batches.length > 0 ? (
            batches.map(batch => <BatchCard key={batch.$id} batch={batch} />)
          ) : (
            <div className="col-span-full text-center py-16">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No batches yet
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Check back soon for new courses in your grade.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(HomePage);