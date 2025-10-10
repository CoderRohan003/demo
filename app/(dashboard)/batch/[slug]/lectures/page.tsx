// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams } from 'next/navigation';
// import { useDate } from '@/context/DateContext';
// import withAuth from '@/app/components/auth/withAuth';
// import LectureCard from '@/app/components/LectureCard';
// import { databases } from '@/lib/appwrite';
// import { Query } from 'appwrite';
// import { useAuth } from '@/context/AuthContext';

// const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// const LECTURES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LECTURES_COLLECTION_ID!;
// const PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TEACHER_PROFILES_COLLECTION_ID!;
// const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;
// const ENROLLMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ENROLLMENTS_COLLECTION_ID!;

// interface Lecture {
//   $id: string;
//   title: string;
//   subject: string;
//   uploaderId: string;
//   teacherName: string;
//   teacherImage: string;
// }

// interface Batch {
//     name: string;
// }

// const BatchLecturesPage = () => {
//   const { selectedDate } = useDate();
//   const params = useParams();
//   const { id: batchId } = params;
//   const { user } = useAuth();
//   const [lectures, setLectures] = useState<Lecture[]>([]);
//   const [batch, setBatch] = useState<Batch | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [completedLectures, setCompletedLectures] = useState<string[]>([]);

//   useEffect(() => {
//     if (!batchId || !user) return;

//     const fetchBatchDetails = async () => {
//         try {
//             const batchData = await databases.getDocument(DATABASE_ID, BATCHES_COLLECTION_ID, batchId as string);
//             setBatch({ name: batchData.name } as Batch);
//         } catch (error) {
//             console.error("Failed to fetch batch details:", error);
//         }
//     };

//     const fetchLecturesAndTeachers = async () => {
//       setIsLoading(true);
//       try {
//         const startOfDay = new Date(selectedDate);
//         startOfDay.setHours(0, 0, 0, 0);
//         const endOfDay = new Date(selectedDate);
//         endOfDay.setHours(23, 59, 59, 999);

//         const lectureResponse = await databases.listDocuments(
//           DATABASE_ID,
//           LECTURES_COLLECTION_ID,
//           [
//             Query.equal('batchId', batchId as string),
//             Query.greaterThanEqual('lectureDate', startOfDay.toISOString()),
//             Query.lessThanEqual('lectureDate', endOfDay.toISOString())
//           ]
//         );

//         const enrollmentResponse = await databases.listDocuments(
//           DATABASE_ID,
//           ENROLLMENTS_COLLECTION_ID,
//           [
//             Query.equal('userId', user.$id),
//             Query.equal('batchId', batchId as string),
//           ]
//         );
//         if (enrollmentResponse.documents.length > 0) {
//           setCompletedLectures(enrollmentResponse.documents[0].completedLectures || []);
//         }

//         if (lectureResponse.documents.length === 0) {
//           setLectures([]);
//           setIsLoading(false);
//           return;
//         }

//         const teacherIds = [...new Set(lectureResponse.documents.map(doc => doc.uploaderId))];

//         const profileResponse = await databases.listDocuments(
//           DATABASE_ID,
//           PROFILES_COLLECTION_ID,
//           [Query.equal('userId', teacherIds)]
//         );

//         const teacherProfiles = new Map(profileResponse.documents.map(p => [p.userId, p]));
//         const enrichedLectures = lectureResponse.documents.map(doc => {
//           const teacher = teacherProfiles.get(doc.uploaderId);

//           const teacherImage = teacher?.avatarS3Key
//             ? `/api/avatar-view?s3Key=${teacher.avatarS3Key}`
//             : '/no-dp.png';

//           return {
//             $id: doc.$id,
//             title: doc.title,
//             subject: doc.subject,
//             uploaderId: doc.uploaderId,
//             teacherName: teacher ? teacher.name : 'Unknown Teacher',
//             teacherImage: teacherImage,
//           } as Lecture;
//         });

//         setLectures(enrichedLectures);

//       } catch (error) {
//         console.error("Failed to fetch data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchBatchDetails();
//     fetchLecturesAndTeachers();
//   }, [selectedDate, batchId, user]);

//   return (
//     <div className="w-full h-full flex flex-col">
//       <h1 className="text-3xl font-bold mb-4">
//         Lectures for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
//       </h1>

//       <div className="flex-grow pt-4">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {isLoading ? (
//             <p className="col-span-full">Loading lectures...</p>
//           ) : lectures.length > 0 ? (
//             lectures.map(lecture => (
//               <LectureCard
//                 key={lecture.$id}
//                 id={lecture.$id}
//                 title={lecture.title}
//                 subject={lecture.subject}
//                 teacherName={lecture.teacherName}
//                 teacherImage={lecture.teacherImage}
//                 isCompleted={completedLectures.includes(lecture.$id)}
//               />
//             ))
//           ) : (
//             <p className="col-span-full text-center text-gray-500 dark:text-gray-400 mt-8">No classes scheduled for this day in this batch.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default withAuth(BatchLecturesPage);


























'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDate } from '@/context/DateContext';
import withAuth from '@/app/components/auth/withAuth';
import LectureCard from '@/app/components/LectureCard';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { useAuth } from '@/context/AuthContext';
import { CalendarDays, BookOpen, GraduationCap, Clock, Users } from 'lucide-react';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const LECTURES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LECTURES_COLLECTION_ID!;
const PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TEACHER_PROFILES_COLLECTION_ID!;
const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;
const ENROLLMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ENROLLMENTS_COLLECTION_ID!;

interface Lecture {
  $id: string;
  title: string;
  subject: string;
  uploaderId: string;
  teacherName: string;
  teacherImage: string;
}

interface Batch {
  $id: string; // Keep the ID for fetching lectures
  name: string;
  slug: string;
}

const BatchLecturesPage = () => {
  const { selectedDate } = useDate();
  const params = useParams();
  const { id: batchId, slug } = params as { id?: string; slug?: string }; // Extract slug
  const { user } = useAuth();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedLectures, setCompletedLectures] = useState<string[]>([]);

  // --- OPTIMIZATION 1: Fetch batch details and enrollment only once ---
  useEffect(() => {
    if (!slug || !user) return;

    const fetchBatchAndEnrollment = async () => {
      try {
        // Fetch batch details using the slug
        const batchResponse = await databases.listDocuments(
          DATABASE_ID, BATCHES_COLLECTION_ID, [Query.equal('slug', slug as string), Query.limit(1)]
        );

        if (batchResponse.documents.length === 0) {
          console.error("Batch not found for this slug.");
          return;
        }
        const currentBatch = batchResponse.documents[0] as unknown as Batch;
        setBatch(currentBatch);

        // Fetch the user's progress for this batch
        const enrollmentResponse = await databases.listDocuments(
          DATABASE_ID, ENROLLMENTS_COLLECTION_ID, [
          Query.equal('userId', user.$id),
          Query.equal('batchId', currentBatch.$id), // Use the fetched batch ID
        ]
        );
        if (enrollmentResponse.documents.length > 0) {
          setCompletedLectures(enrollmentResponse.documents[0].completedLectures || []);
        }
      } catch (error) {
        console.error("Failed to fetch batch details:", error);
      }
    };

    fetchBatchAndEnrollment();
  }, [slug, user]); // This hook runs only when the slug or user changes

  // --- OPTIMIZATION 2: Fetch lectures only when the date or batch changes ---
  useEffect(() => {
    if (!batch) return; // Don't run until the batch is loaded

    const fetchLecturesForDate = async () => {
      setIsLoading(true);
      try {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch lectures for the specific batch and date
        const lectureResponse = await databases.listDocuments(
          DATABASE_ID, LECTURES_COLLECTION_ID, [
          Query.equal('batchId', batch.$id), // Use the loaded batch's ID
          Query.greaterThanEqual('lectureDate', startOfDay.toISOString()),
          Query.lessThanEqual('lectureDate', endOfDay.toISOString())
        ]
        );

        if (lectureResponse.documents.length === 0) {
          setLectures([]);
          return;
        }

        // --- This logic for enriching with teacher data is excellent, no changes needed ---
        const teacherIds = [...new Set(lectureResponse.documents.map(doc => doc.uploaderId))];
        const profileResponse = await databases.listDocuments(
          DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('userId', teacherIds)]
        );
        const teacherProfiles = new Map(profileResponse.documents.map(p => [p.userId, p]));

        const enrichedLectures = lectureResponse.documents.map(doc => {
          const teacher = teacherProfiles.get(doc.uploaderId);
          const teacherImage = teacher?.avatarS3Key ? `/api/avatar-view?s3Key=${teacher.avatarS3Key}` : '/no-dp.png';
          return {
            $id: doc.$id,
            title: doc.title,
            subject: doc.subject,
            uploaderId: doc.uploaderId,
            teacherName: teacher ? teacher.name : 'Unknown Teacher',
            teacherImage: teacherImage,
          } as Lecture;
        });
        setLectures(enrichedLectures);
      } catch (error) {
        console.error("Failed to fetch lectures:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLecturesForDate();
  }, [selectedDate, batch]); // This hook runs only when the date or batch changes


  const completedCount = completedLectures.length;
  const totalLectures = lectures.length;
  const progressPercentage = totalLectures > 0 ? (completedCount / totalLectures) * 100 : 0;

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 animate-pulse border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg mb-2"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg w-2/3"></div>
            </div>
          </div>
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg mb-3"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg w-1/2"></div>
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-blue-500 dark:text-blue-400" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
          <CalendarDays className="w-4 h-4 text-white" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        No Classes Today
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md leading-relaxed">
        Looks like you have a free day! No lectures are scheduled for {formatDate(selectedDate)} in {batch?.name || 'this batch'}.
      </p>

      <div className="mt-8 flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800">
        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Time to catch up or relax
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-indigo-950/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.1)_1px,transparent_0)] [background-size:20px_20px] pointer-events-none"></div>

      <div className="relative w-full max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-800">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {batch?.name || 'Loading batch...'}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-3 leading-tight">
                {formatDate(selectedDate)}
              </h1>

            </div>

            {/* Stats Cards */}
            {!isLoading && lectures.length > 0 && (
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl px-6 py-4 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {totalLectures}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Lectures
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl px-6 py-4 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round(progressPercentage)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Progress
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {!isLoading && lectures.length > 0 && (
            <div className="mt-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Today&apos;s Progress
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {completedCount} of {totalLectures} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="relative">
          {isLoading ? (
            <LoadingSkeleton />
          ) : lectures.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {lectures.map((lecture, index) => (
                <div
                  key={lecture.$id}
                  className="transform hover:scale-105 transition-all duration-300"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <LectureCard
                    id={lecture.$id}
                    title={lecture.title}
                    subject={lecture.subject}
                    teacherName={lecture.teacherName}
                    teacherImage={lecture.teacherImage}
                    isCompleted={completedLectures.includes(lecture.$id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default withAuth(BatchLecturesPage);