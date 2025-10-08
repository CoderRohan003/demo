// 'use client';

// import { useState, useEffect } from 'react';
// import withAuth from '@/app/components/auth/withAuth';
// import { useAuth } from '@/context/AuthContext';
// import { databases } from '@/lib/appwrite';
// import { Query } from 'appwrite';
// import Link from 'next/link';
// import Image from 'next/image';

// const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;
// const ENROLLMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ENROLLMENTS_COLLECTION_ID! ;

// interface Batch {
//   $id: string;
//   name: string;
//   imageUrl?: string;
// }

// const MyBatchesPage = () => {
//   const { user } = useAuth();
//   const [enrolledBatches, setEnrolledBatches] = useState<Batch[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (!user) return;

//     const fetchEnrolledBatches = async () => {
//       setIsLoading(true);
//       try {
//         const enrollmentResponse = await databases.listDocuments(
//           DATABASE_ID,
//           ENROLLMENTS_COLLECTION_ID,
//           [Query.equal('userId', user.$id)]
//         );

//         if (enrollmentResponse.documents.length === 0) {
//           setEnrolledBatches([]);
//           return;
//         }

//         const batchIds = enrollmentResponse.documents.map(doc => doc.batchId);
//         const batchResponse = await databases.listDocuments(
//           DATABASE_ID,
//           BATCHES_COLLECTION_ID,
//           [Query.equal('$id', batchIds)]
//         );

//         setEnrolledBatches(batchResponse.documents as unknown as Batch[]);
//       } catch (error) {
//         console.error("Failed to fetch enrolled batches:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchEnrolledBatches();
//   }, [user]);

//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6">My Enrolled Batches</h1>
//       {isLoading ? (
//         <p>Loading your batches...</p>
//       ) : enrolledBatches.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {enrolledBatches.map(batch => (
//             <Link key={batch.$id} href={`/batch/${batch.$id}/lectures`} className="block bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700">
//               <div className="h-40 bg-gray-200 dark:bg-gray-700 relative">
//                 <Image src={batch.imageUrl ? `/api/super-admin/batch-image-view?s3Key=${batch.imageUrl}` : '/no-dp.png'} alt={batch.name} layout="fill" objectFit="cover" />
//               </div>
//               <div className="p-4">
//                 <h2 className="text-xl font-bold truncate">{batch.name}</h2>
//               </div>
//             </Link>
//           ))}
//         </div>
//       ) : (
//         <p className="text-gray-500 dark:text-gray-400">You have not enrolled in any batches yet.</p>
//       )}
//     </div>
//   );
// };

// export default withAuth(MyBatchesPage);








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
const ENROLLMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ENROLLMENTS_COLLECTION_ID!;

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
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm h-80 animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 relative"></div>
            <div className="p-6">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
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
        <div className="w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-3xl flex items-center justify-center border border-blue-200 dark:border-blue-800">
          <svg className="w-16 h-16 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
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
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Explore Batches
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.05)_1px,transparent_0)] [background-size:40px_40px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                My Batches
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mt-1">
                Continue your progress in enrolled batches
              </p>
            </div>
          </div>
          
          {!isLoading && enrolledBatches.length > 0 && (
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledBatches.map((batch, index) => (
              <Link 
                key={batch.$id} 
                href={`/batch/${batch.$id}/lectures`}
                className="group relative transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 h-80">
                  {/* Image Container */}
                  <div className="h-48 relative overflow-hidden">
                    <Image 
                      src={batch.imageUrl ? `/api/super-admin/batch-image-view?s3Key=${batch.imageUrl}` : '/no-dp.png'} 
                      alt={batch.name} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col h-32">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 flex-1">
                      {batch.name}
                    </h2>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        
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