

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import withAuth from '@/app/components/auth/withAuth';
import { databases } from '@/lib/appwrite';
import { useAuth } from '@/context/AuthContext';
import { Query } from 'appwrite';
import { FileText, Play, CheckCircle, Circle, Download, BookOpen, Clock, Award } from 'lucide-react';
import { FullPageLoader } from '@/app/components/FullPageLoader';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const LECTURES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LECTURES_COLLECTION_ID!;
const LECTURE_RESOURCES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LECTURE_RESOURCES_COLLECTION_ID!;
const ENROLLMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_ENROLLMENTS_COLLECTION_ID!;

interface Lecture {
  $id: string;
  title: string;
  subject: string;
  s3Key: string;
  description: string;
  batchId: string;
}

interface LectureResource {
  $id: string;
  title: string;
  fileS3Key: string;
}

const LecturePage = () => {
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [resources, setResources] = useState<LectureResource[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [completedLectures, setCompletedLectures] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Convert id to string and ensure it's properly handled
  const lectureId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    if (!lectureId || !user) return;

    const fetchLectureAndResources = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching lecture with ID:', lectureId);
        
        const lectureData = await databases.getDocument(
          DATABASE_ID,
          LECTURES_COLLECTION_ID,
          lectureId
        ) as unknown as Lecture;
        setLecture(lectureData);

        const response = await fetch('/api/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ s3Key: lectureData.s3Key }),
        });
        if (!response.ok) throw new Error('Failed to get video URL.');
        const { url } = await response.json();
        setVideoUrl(url);

        const resourceResponse = await databases.listDocuments(
          DATABASE_ID,
          LECTURE_RESOURCES_COLLECTION_ID,
          [Query.equal('lectureId', lectureId)]
        );
        setResources(resourceResponse.documents as unknown as LectureResource[]);

        const enrollmentResponse = await databases.listDocuments(
          DATABASE_ID,
          ENROLLMENTS_COLLECTION_ID,
          [
            Query.equal('userId', user.$id),
            Query.equal('batchId', lectureData.batchId),
          ]
        );

        if (enrollmentResponse.documents.length > 0) {
          const enrollment = enrollmentResponse.documents[0];
          setEnrollmentId(enrollment.$id);
          const completed = enrollment.completedLectures || [];
          console.log('Current completed lectures:', completed);
          console.log('Checking if lecture is completed:', lectureId, completed.includes(lectureId));
          
          setCompletedLectures(completed);
          setIsCompleted(completed.includes(lectureId));
        }

      } catch (error) {
        console.error('Error fetching lecture data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLectureAndResources();
  }, [lectureId, user]);

  const handleResourceDownload = async (s3Key: string) => {
    try {
      const response = await fetch('/api/resources/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3Key }),
      });
      if (!response.ok) throw new Error('Failed to get resource URL.');
      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to download resource:', error);
      alert('Could not download resource.');
    }
  };

  const toggleComplete = async () => {
    if (!enrollmentId || !lectureId || isUpdating) return;
    
    setIsUpdating(true);
    
    const newCompletedLectures = isCompleted
      ? completedLectures.filter(id => id !== lectureId)
      : [...completedLectures, lectureId];

    console.log('Updating completion status:', {
      lectureId,
      isCompleted,
      oldCompleted: completedLectures,
      newCompleted: newCompletedLectures
    });

    try {
      await databases.updateDocument(
        DATABASE_ID,
        ENROLLMENTS_COLLECTION_ID,
        enrollmentId,
        { completedLectures: newCompletedLectures }
      );
      
      setCompletedLectures(newCompletedLectures);
      setIsCompleted(!isCompleted);
      console.log('Successfully updated completion status');
    } catch (error) {
      console.error('Failed to update completion status:', error);
      alert('Failed to update completion status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center">
        <FullPageLoader />
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-16 h-16 text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lecture Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The requested lecture could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-indigo-950/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.1)_1px,transparent_0)] [background-size:20px_20px] pointer-events-none"></div>
      
      <div className="relative w-full max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-800">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {lecture.subject}
                </span>
              </div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-2">
              {lecture.title}
            </h1>
          </div>

          {/* Completion Toggle Button */}
          <button
            onClick={toggleComplete}
            disabled={isUpdating}
            className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
              isCompleted
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                : 'bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUpdating ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : isCompleted ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
            <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
          </button>
        </div>

        {/* Video Player */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-3xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl mb-8">
          <div className="bg-black aspect-video rounded-2xl flex items-center justify-center overflow-hidden relative">
            {videoUrl ? (
              <>
                <ReactPlayer
                  src={videoUrl}
                  controls={true}
                  width="100%"
                  height="100%"
                />
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                  <div className="flex items-center space-x-2">
                    <Play className="w-4 h-4 text-white" />
                    <span className="text-sm text-white font-medium">Now Playing</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white text-lg font-medium">Loading video player...</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notes Section */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-3xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl h-fit">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notes</h2>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-700/50">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {lecture.description || 'No notes available for this lecture.'}
              </p>
            </div>
          </div>

          {/* Resources Section */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-3xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl h-fit">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resources</h2>
            </div>
            
            {resources.length > 0 ? (
              <div className="space-y-3">
                {resources.map((resource, index) => (
                  <button
                    key={resource.$id}
                    onClick={() => handleResourceDownload(resource.fileS3Key)}
                    className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-2xl flex items-center gap-4 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-300 text-left border border-blue-200/50 dark:border-blue-700/50 group transform hover:scale-105"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-gray-900 dark:text-white block truncate">
                        {resource.title}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Click to download
                      </span>
                    </div>
                    <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No resources available</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Check back later for additional materials</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        {isCompleted && (
          <div className="mt-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-3xl p-6 border border-green-200/50 dark:border-green-700/50">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-green-700 dark:text-green-300">
                  Lecture Completed!
                </h3>
                <p className="text-green-600 dark:text-green-400">
                  Great job on finishing this lecture
                </p>
              </div>
            </div>
          </div>
        )}
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
      `}</style>
    </div>
  );
};

export default withAuth(LecturePage);