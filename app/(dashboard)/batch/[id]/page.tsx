'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import withAuth from '@/app/components/auth/withAuth';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import Image from 'next/image';
import {
  CheckCircle,
  Clock,
  Users,
  Award,
  ArrowLeft,
  Download,
  Shield,
  Zap,
  BookOpen
} from 'lucide-react';

// Interfaces and Razorpay setup remain the same
interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface RazorpayOptions {
  key: string; amount: number; currency: string; name: string; description: string; order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill: { name: string; email: string; };
  theme: { color: string; };
}
interface RazorpayInstance {
  open(): void;
  on(eventName: 'payment.failed', handler: (response: { error: { code: string; description: string; source: string; step: string; reason: string; }; }) => void): void;
}
declare global {
  interface Window {
    Razorpay: { new(options: RazorpayOptions): RazorpayInstance; };
  }
}

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;
const ENROLLMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ENROLLMENTS_COLLECTION_ID!;

interface Batch {
  $id: string; name: string; description: string; imageUrl?: string; price: number;
  faculty: string[]; features: string[]; duration: string;
}

const BatchDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { id } = params;

  const [batch, setBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    if (!id || !user) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const batchData = await databases.getDocument(
          DATABASE_ID,
          BATCHES_COLLECTION_ID,
          id as string
        );
        setBatch(batchData as unknown as Batch);

        const enrollmentCheck = await databases.listDocuments(
          DATABASE_ID,
          ENROLLMENTS_COLLECTION_ID,
          [
            Query.equal('userId', user.$id),
            Query.equal('batchId', id as string)
          ]
        );
        if (enrollmentCheck.documents.length > 0) {
          setIsEnrolled(true);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleBuyCourse = async () => {
    if (!user || !batch) return;
    setIsProcessing(true);
    setPaymentError('');
    try {
      await databases.createDocument(
        DATABASE_ID,
        ENROLLMENTS_COLLECTION_ID,
        ID.unique(),
        { userId: user.$id, batchId: batch.$id }
      );
      setIsEnrolled(true);
    } catch (error) {
      console.error("Enrollment process failed:", error);
      if (error instanceof Error) {
        setPaymentError(error.message);
      } else {
        setPaymentError("There was an error processing your enrollment.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-medium text-gray-600 dark:text-gray-300">Loading Course Details...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-12 h-12 text-red-500" />
          </div>
          <p className="text-xl font-medium text-gray-600 dark:text-gray-300">Course not found.</p>
        </div>
      </div>
    );
  }

  return (
    // The root div no longer has min-h-screen, allowing the main layout to control scrolling
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Header Navigation (Not sticky) */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Courses</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
              <div className="relative h-80">
                <Image
                  src={batch.imageUrl ? `/api/super-admin/batch-image-view?s3Key=${batch.imageUrl}` : "/no-dp.png"}
                  alt={batch.name}
                  layout="fill"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                <div className="absolute top-6 left-6">
                  <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium">
                    <Zap className="w-4 h-4" />
                    Premium Course
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
                    {batch.name}
                  </h1>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{batch.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    {batch.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Faculty Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Award className="w-6 h-6 text-blue-600" />
                Expert Instructors
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {batch.faculty.map((name, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Senior Instructor</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                What You'll Get
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {batch.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/40 transition-colors">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* This is the sticky container */}
            <div className="sticky top-0">
              {/* Pricing Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
                  <div className="text-white/80 text-sm font-medium mb-2">Course Price</div>
                  <div className="text-4xl font-bold text-white mb-1">
                    ₹{batch.price.toLocaleString("en-IN")}
                  </div>
                  <div className="text-white/80 text-sm">One-time payment</div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {batch.duration}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Duration</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                        {batch.faculty.length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Instructors</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>30-day money-back guarantee</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Download className="w-4 h-4 text-blue-500" />
                      <span>Lifetime access to materials</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Award className="w-4 h-4 text-purple-500" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <p className="text-sm text-red-600 dark:text-red-400 text-center">{paymentError}</p>
                    </div>
                  )}

                  {isEnrolled ? (
                    <button
                      onClick={() => router.push('/batches')}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Go to My Batches
                    </button>
                  ) : (
                    <button
                      onClick={handleBuyCourse}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Zap className="w-5 h-5" />
                          Join This Course
                        </div>
                      )}
                    </button>
                  )}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      By enrolling, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(BatchDetailPage);