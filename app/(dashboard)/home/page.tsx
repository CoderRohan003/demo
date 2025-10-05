'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import withAuth from '@/app/components/auth/withAuth';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { FullPageLoader } from '@/app/components/FullPageLoader';
import BatchCard from '@/app/components/BatchCard'; // Import the new component

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
  <div className="rounded-xl shadow-2xl animate-pulse bg-gray-200 dark:bg-gray-800 h-[26rem]">
    <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
    </div>
    <div className="px-6 pt-4 pb-6 mt-auto flex justify-between items-center">
      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900 dark:text-white">
        Available Batches for <span className="text-blue-500 dark:text-blue-400">Class {profile.academicLevel}</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
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
            <p className="text-2xl text-gray-500 dark:text-gray-400">
              😕 No batches found for your class yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(HomePage);