




















'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation'; // Added useSearchParams
import { useDate } from '@/context/DateContext';
import withAuth from '@/app/components/auth/withAuth';
import LectureCard from '@/app/components/LectureCard';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { useAuth } from '@/context/AuthContext';
import { CalendarDays, BookOpen, GraduationCap, Clock, Users, CheckCircle, Edit, FileText, Award, TrendingUp, Calendar, ClipboardCheck } from 'lucide-react'; // Added CheckCircle, Edit
import Link from 'next/link';
import { startOfDay, isSameDay, format } from 'date-fns'; // Added date-fns functions

// --- Ensure all Collection IDs are defined and correct in your .env.local ---
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const LECTURES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LECTURES_COLLECTION_ID!;
const PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TEACHER_PROFILES_COLLECTION_ID!;
const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;
const ENROLLMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ENROLLMENTS_COLLECTION_ID!;
const DPPS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DPPS_COLLECTION_ID!;
const DPP_SUBMISSIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DPP_SUBMISSIONS_COLLECTION_ID!;

interface Lecture {
  $id: string;
  title: string;
  subject: string;
  uploaderId: string;
  teacherName: string;
  teacherImage: string;
  lectureDate: string;
}

interface Batch {
  $id: string;
  name: string;
  slug: string;
}

interface Dpp {
  $id: string;
  title: string;
  dppDate: string;
}

interface Submission {
  $id: string;
  dppId: string;
}

const BatchLecturesPage = () => {
  const { selectedDate, setSelectedDate } = useDate();
  const params = useParams();
  const searchParams = useSearchParams();
  const { slug } = params as { slug?: string };
  const { user } = useAuth();

  const [allLectures, setAllLectures] = useState<Lecture[]>([]);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedLectures, setCompletedLectures] = useState<string[]>([]);
  const [allDpps, setAllDpps] = useState<Dpp[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingDpps, setIsLoadingDpps] = useState(true);

  useEffect(() => {
    const dateFromUrl = searchParams.get('date');
    if (dateFromUrl) {
      setSelectedDate(startOfDay(new Date(dateFromUrl)));
    }

    if (!slug || !user) return;

    const fetchAllBatchData = async () => {
      setIsLoading(true);
      setIsLoadingDpps(true);
      try {
        const batchResponse = await databases.listDocuments(
          DATABASE_ID, BATCHES_COLLECTION_ID, [Query.equal('slug', slug as string), Query.limit(1)]
        );

        if (batchResponse.documents.length === 0) {
          console.error("Batch not found for this slug.");
          setIsLoading(false);
          setIsLoadingDpps(false);
          return;
        }
        const currentBatch = batchResponse.documents[0] as unknown as Batch;
        setBatch(currentBatch);

        const [enrollmentResponse, lecturesResponse, dppsResponse, submissionsResponse] = await Promise.all([
          databases.listDocuments(DATABASE_ID, ENROLLMENTS_COLLECTION_ID, [
            Query.equal('userId', user.$id),
            Query.equal('batchId', currentBatch.$id),
          ]),
          databases.listDocuments(DATABASE_ID, LECTURES_COLLECTION_ID, [
            Query.equal('batchId', currentBatch.$id),
            Query.orderDesc('lectureDate')
          ]),
          databases.listDocuments(DATABASE_ID, DPPS_COLLECTION_ID, [
            Query.equal('batchId', currentBatch.$id)
          ]),
          databases.listDocuments(DATABASE_ID, DPP_SUBMISSIONS_COLLECTION_ID, [
            Query.equal('studentId', user.$id)
          ])
        ]);

        if (enrollmentResponse.documents.length > 0) {
          setCompletedLectures(enrollmentResponse.documents[0].completedLectures || []);
        }

        const teacherIds = [...new Set(lecturesResponse.documents.map(doc => doc.uploaderId))].filter(Boolean);
        let teacherProfiles = new Map();
        if (teacherIds.length > 0 && PROFILES_COLLECTION_ID) {
          const profileResponse = await databases.listDocuments(
            DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('userId', teacherIds)]
          );
          teacherProfiles = new Map(profileResponse.documents.map(p => [p.userId, p]));
        }
        const enrichedLectures = lecturesResponse.documents.map(doc => {
          const teacher = teacherProfiles.get(doc.uploaderId);
          const teacherImage = teacher?.avatarS3Key ? `/api/avatar-view?s3Key=${teacher.avatarS3Key}` : '/no-dp.png';
          const lecture: Lecture = {
            $id: doc.$id,
            title: doc.title ?? '',
            subject: doc.subject ?? '',
            uploaderId: doc.uploaderId ?? '',
            teacherName: teacher ? teacher.name : 'Unknown Teacher',
            teacherImage,
            lectureDate: doc.lectureDate ?? '',
          };
          return lecture;
        });
        setAllLectures(enrichedLectures);

        setAllDpps(dppsResponse.documents as unknown as Dpp[]);
        setSubmissions(submissionsResponse.documents as unknown as Submission[]);

      } catch (error) {
        console.error("Failed to fetch batch data:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingDpps(false);
      }
    };

    fetchAllBatchData();
  }, [slug, user, searchParams, setSelectedDate]);

  const filteredLectures = allLectures.filter(lecture =>
    isSameDay(new Date(lecture.lectureDate), selectedDate)
  );

  const filteredDpps = allDpps.filter(dpp =>
    isSameDay(new Date(dpp.dppDate), selectedDate)
  );

  const completedCount = allLectures.filter(lec => completedLectures.includes(lec.$id)).length;
  const lecturesToday = filteredLectures.length;
  const progressPercentage = lecturesToday > 0 ? (completedCount / lecturesToday) * 100 : 0;

  const dppsWithStatus = filteredDpps.map(dpp => {
    const submission = submissions.find(s => s.dppId === dpp.$id);
    return {
      ...dpp,
      isAttempted: !!submission,
      submissionId: submission?.$id,
    };
  });

  const formatDate = (date: Date) => {
    const today = startOfDay(new Date());
    const tomorrow = startOfDay(new Date(today.getTime() + 24 * 60 * 60 * 1000));
    const yesterday = startOfDay(new Date(today.getTime() - 24 * 60 * 60 * 1000));
    const inputDay = startOfDay(date);

    if (isSameDay(inputDay, today)) return 'Today';
    if (isSameDay(inputDay, tomorrow)) return 'Tomorrow';
    if (isSameDay(inputDay, yesterday)) return 'Yesterday';
    return format(date, `EEEE, MMMM d${date.getFullYear() !== today.getFullYear() ? ', yyyy' : ''}`);
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Classes Today</h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md">
        Looks like you have a free day! No lectures are scheduled for {format(selectedDate, 'MMMM d')} in {batch?.name || 'this batch'}.
      </p>
    </div>
  );

  if (isLoading && !batch) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!batch && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center py-10 text-red-500">Batch not found or could not be loaded.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          {/* Batch Badge */}
          <div className="flex items-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{batch?.name}</span>
            </div>
          </div>

          {/* Date and Stats Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {formatDate(selectedDate)}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Your learning journey continues</p>
            </div>

            {/* Stats Cards */}
            {!isLoading && lecturesToday > 0 && (
              <div className="flex flex-wrap gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                      <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredLectures.length}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Classes Today</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(progressPercentage)}%</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Progress</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {!isLoading && lecturesToday > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Batch Progress</span>
                </div>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {completedCount} / {lecturesToday}
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Lectures Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Today's Lectures
          </h2>

          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredLectures.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredLectures.map((lecture) => (
                <div key={lecture.$id} className="transform hover:scale-[1.02] transition-transform duration-200">
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

        {/* DPP Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            Daily Practice Problems
          </h2>
          
          {isLoadingDpps ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">Loading DPPs...</p>
            </div>
          ) : dppsWithStatus.length > 0 ? (
            <div className="space-y-3 max-w-4xl">
              {dppsWithStatus.map(dpp => (
                <div 
                  key={dpp.$id} 
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`p-3 rounded-xl ${dpp.isAttempted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                        {dpp.isAttempted ? (
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">{dpp.title}</h3>
                        {dpp.isAttempted && (
                          <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400 mt-1">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {dpp.isAttempted ? (
                      <Link 
                        href={`/dpps/results/${dpp.submissionId}`} 
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                      >
                        View Results
                      </Link>
                    ) : (
                      <Link 
                        href={`/dpps/take/${dpp.$id}`} 
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Start Test
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-w-4xl">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No DPPs assigned for today</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check back later for new practice problems</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(BatchLecturesPage);