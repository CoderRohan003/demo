'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import withAuth from '@/app/components/auth/withAuth';
import { databases } from '@/lib/appwrite';
import { FullPageLoader } from '@/app/components/FullPageLoader';
import { Award, Check, X, ArrowLeft, Trophy, Target, TrendingUp } from 'lucide-react';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const DPPS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DPPS_COLLECTION_ID!;
const DPP_SUBMISSIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DPP_SUBMISSIONS_COLLECTION_ID!;

interface Question {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
}

interface DppData {
    title: string;
    questions: Question[];
}

interface SubmissionData {
    dppId: string;
    answers: { [key: number]: number };
    score: number;
    totalQuestions: number;
}

const DppResultsPage = () => {
    const router = useRouter();
    const params = useParams();
    const { submissionId } = params;

    const [submission, setSubmission] = useState<SubmissionData | null>(null);
    const [dpp, setDpp] = useState<DppData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!submissionId) return;

        const fetchResults = async () => {
            try {
                const submissionDoc = await databases.getDocument(
                    DATABASE_ID,
                    DPP_SUBMISSIONS_COLLECTION_ID,
                    submissionId as string
                );
                const submissionData: SubmissionData = {
                    ...submissionDoc,
                    answers: JSON.parse(submissionDoc.answers),
                } as unknown as SubmissionData;
                setSubmission(submissionData);

                const dppDoc = await databases.getDocument(
                    DATABASE_ID,
                    DPPS_COLLECTION_ID,
                    submissionData.dppId
                );
                const dppData: DppData = {
                    ...dppDoc,
                    questions: JSON.parse(dppDoc.questions),
                } as unknown as DppData;
                setDpp(dppData);

            } catch (err) {
                console.error("Failed to load results:", err);
                setError("Could not load the results for this submission.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [submissionId]);

    if (isLoading) return <FullPageLoader />;
    if (error) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
            <div className="text-center">
                <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
            </div>
        </div>
    );
    if (!submission || !dpp) return null;

    const percentage = Math.round((submission.score / submission.totalQuestions) * 100);
    const incorrectCount = submission.totalQuestions - submission.score;

    // Determine performance level
    let performanceColor = 'blue';
    let performanceText = 'Good Effort!';
    if (percentage >= 90) {
        performanceColor = 'green';
        performanceText = 'Outstanding!';
    } else if (percentage >= 75) {
        performanceColor = 'blue';
        performanceText = 'Great Job!';
    } else if (percentage >= 50) {
        performanceColor = 'yellow';
        performanceText = 'Keep Practicing!';
    } else {
        performanceColor = 'orange';
        performanceText = 'Keep Improving!';
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span className="font-medium">Back</span>
                </button>

                {/* Results Summary Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mb-8">
                    {/* Header Section */}
                    <div className="bg-blue-600 dark:bg-blue-700 px-6 sm:px-8 py-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                            {dpp.title}
                        </h1>
                        <p className="text-blue-100">Your submission results</p>
                    </div>

                    {/* Stats Section */}
                    <div className="p-6 sm:p-8">
                        {/* Main Score */}
                        <div className="text-center mb-8">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Your Score</p>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white">
                                    {percentage}
                                </span>
                                <span className="text-2xl sm:text-3xl font-semibold text-gray-500 dark:text-gray-400">%</span>
                            </div>
                            <p className={`text-lg font-semibold text-${performanceColor}-600 dark:text-${performanceColor}-400`}>
                                {performanceText}
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Correct</span>
                                </div>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {submission.score}
                                </p>
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    <span className="text-sm font-medium text-red-700 dark:text-red-300">Incorrect</span>
                                </div>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                    {incorrectCount}
                                </p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total</span>
                                </div>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {submission.totalQuestions}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Review Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-900 dark:bg-gray-800 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Detailed Review</h2>
                    </div>

                    <div className="space-y-4">
                        {dpp.questions.map((question, index) => {
                            const userAnswerIndex = submission.answers[index];
                            const isCorrect = userAnswerIndex === question.correctAnswerIndex;

                            return (
                                <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                                    {/* Question Header */}
                                    <div className={`px-6 py-4 border-l-4 ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-red-500 bg-red-50 dark:bg-red-900/10'}`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm ${
                                                    isCorrect 
                                                        ? 'bg-green-600 text-white' 
                                                        : 'bg-red-600 text-white'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <p className="font-medium text-gray-900 dark:text-white pt-1">
                                                    {question.questionText}
                                                </p>
                                            </div>
                                            <div className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                                                isCorrect 
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                            }`}>
                                                {isCorrect ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        <span className="text-sm font-semibold">Correct</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <X className="w-4 h-4" />
                                                        <span className="text-sm font-semibold">Incorrect</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Options */}
                                    <div className="p-6 space-y-3">
                                        {question.options.map((option, optIndex) => {
                                            const isUserAnswer = userAnswerIndex === optIndex;
                                            const isCorrectAnswer = question.correctAnswerIndex === optIndex;
                                            
                                            let optionClass = 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
                                            let iconColor = '';
                                            
                                            if (isCorrectAnswer) {
                                                optionClass = 'border-green-500 bg-green-50 dark:bg-green-900/20';
                                                iconColor = 'text-green-600 dark:text-green-400';
                                            }
                                            if (isUserAnswer && !isCorrect) {
                                                optionClass = 'border-red-500 bg-red-50 dark:bg-red-900/20';
                                                iconColor = 'text-red-600 dark:text-red-400';
                                            }

                                            return (
                                                <div key={optIndex} className={`p-4 border-2 rounded-xl flex items-center gap-3 transition-all ${optionClass}`}>
                                                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                                        {isCorrectAnswer && (
                                                            <div className="w-6 h-6 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center">
                                                                <Check className="w-4 h-4 text-white" />
                                                            </div>
                                                        )}
                                                        {isUserAnswer && !isCorrect && (
                                                            <div className="w-6 h-6 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center">
                                                                <X className="w-4 h-4 text-white" />
                                                            </div>
                                                        )}
                                                        {!isCorrectAnswer && !isUserAnswer && (
                                                            <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                                                        )}
                                                    </div>
                                                    <span className="text-gray-900 dark:text-white flex-1">
                                                        {option}
                                                    </span>
                                                    {isCorrectAnswer && (
                                                        <span className="text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-md">
                                                            Correct Answer
                                                        </span>
                                                    )}
                                                    {isUserAnswer && !isCorrect && (
                                                        <span className="text-xs font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded-md">
                                                            Your Answer
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withAuth(DppResultsPage);