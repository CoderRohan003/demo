


'use client';

import { useState, useEffect } from 'react';
import withAuth from '@/app/components/auth/withAuth';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import Link from 'next/link';
import Image from 'next/image';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;
const ENROLLMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_ENROLLMENTS_COLLECTION_ID!;

interface Batch {
  $id: string;
  name: string;
  imageUrl?: string;
}

const MyBatchesPage = () => {
  const { user } = useAuth();
  const [enrolledBatches, setEnrolledBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchEnrolledBatches = async () => {
      setIsLoading(true);
      try {
        const enrollmentResponse = await databases.listDocuments(
          DATABASE_ID,
          ENROLLMENTS_COLLECTION_ID,
          [Query.equal('userId', user.$id)]
        );

        if (enrollmentResponse.documents.length === 0) {
          setEnrolledBatches([]);
          return;
        }

        const batchIds = enrollmentResponse.documents.map(doc => doc.batchId);
        const batchResponse = await databases.listDocuments(
          DATABASE_ID,
          BATCHES_COLLECTION_ID,
          [Query.equal('$id', batchIds)]
        );

        setEnrolledBatches(batchResponse.documents as unknown as Batch[]);
      } catch (error) {
        console.error("Failed to fetch enrolled batches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrolledBatches();
  }, [user]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="group relative">
                      <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-lg h-80">
            <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div className="p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2" />
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center">
          <svg className="w-16 h-16 text-blue-400 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">0</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        No Batches Yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
        You haven't enrolled in any batches yet. Start your learning journey by exploring our available courses.
      </p>
      <Link 
        href="/batches"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Explore Batches
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                My Batches
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mt-1">
                Continue your progress in enrolled batches
              </p>
            </div>
          </div>
          
          {!isLoading && enrolledBatches.length > 0 && (
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {enrolledBatches.length} Active {enrolledBatches.length === 1 ? 'Batch' : 'Batches'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : enrolledBatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrolledBatches.map((batch, index) => (
              <Link 
                key={batch.$id} 
                href={`/batch/${batch.$id}/lectures`}
                className="group relative transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 h-80">
                  {/* Image Container */}
                  <div className="h-48 relative overflow-hidden">
                    <Image 
                      src={batch.imageUrl ? `/api/super-admin/batch-image-view?s3Key=${batch.imageUrl}` : '/no-dp.png'} 
                      alt={batch.name} 
                      layout="fill" 
                      objectFit="cover"
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col h-32">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 flex-1">
                      {batch.name}
                    </h2>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>In Progress</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:gap-2 transition-all duration-200">
                        <span>Continue</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default withAuth(MyBatchesPage);