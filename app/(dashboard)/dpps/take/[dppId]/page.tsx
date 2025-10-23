'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import withAuth from '@/app/components/auth/withAuth';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { FullPageLoader } from '@/app/components/FullPageLoader';
import { ArrowLeft, ArrowRight, Check, Send, AlertCircle } from 'lucide-react';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const DPPS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DPPS_COLLECTION_ID!;
const DPP_SUBMISSIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DPP_SUBMISSIONS_COLLECTION_ID!;

interface Question {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
}

interface DppData {
    $id: string;
    title: string;
    questions: Question[];
}

const TakeDppPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const { dppId } = params;

    const [dpp, setDpp] = useState<DppData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!dppId || !user) return;

        const initializeTest = async () => {
            try {
                const existingSubmission = await databases.listDocuments(
                    DATABASE_ID,
                    DPP_SUBMISSIONS_COLLECTION_ID,
                    [
                        Query.equal('dppId', dppId as string),
                        Query.equal('studentId', user.$id)
                    ]
                );

                if (existingSubmission.total > 0) {
                    router.replace(`/dpps/results/${existingSubmission.documents[0].$id}`);
                    return;
                }

                const dppDocument = await databases.getDocument(DATABASE_ID, DPPS_COLLECTION_ID, dppId as string);

                // Normalize the document into the DppData shape
                let questions: Question[] = [];
                if (typeof dppDocument.questions === 'string') {
                    try {
                        questions = JSON.parse(dppDocument.questions);
                    } catch {
                        questions = [];
                    }
                } else if (Array.isArray(dppDocument.questions)) {
                    questions = dppDocument.questions as Question[];
                }

                const parsedDpp: DppData = {
                    $id: dppDocument.$id,
                    title: typeof dppDocument.title === 'string' ? dppDocument.title : String(dppDocument.title ?? ''),
                    questions,
                };

                setDpp(parsedDpp);
            } catch (err) {
                console.error("Failed to load DPP:", err);
                setError("Could not load the test. It might not exist or you may not have permission.");
            } finally {
                setIsLoading(false);
            }
        };

        initializeTest();
    }, [dppId, user, router]);

    const handleSelectAnswer = (questionIndex: number, answerIndex: number) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [questionIndex]: answerIndex,
        });
    };

    const handleSubmit = async () => {
        if (!dpp || !user) return;
        
        if (Object.keys(selectedAnswers).length !== dpp.questions.length) {
            if (!confirm("You have not answered all questions. Are you sure you want to submit?")) {
                return;
            }
        }
        setIsSubmitting(true);
        setError('');

        try {
            let score = 0;
            dpp.questions.forEach((q, index) => {
                if (selectedAnswers[index] === q.correctAnswerIndex) {
                    score++;
                }
            });

            const submissionData = {
                dppId: dpp.$id,
                studentId: user.$id,
                answers: JSON.stringify(selectedAnswers),
                score: score,
                totalQuestions: dpp.questions.length,
            };

            const newSubmission = await databases.createDocument(
                DATABASE_ID,
                DPP_SUBMISSIONS_COLLECTION_ID,
                ID.unique(),
                submissionData
            );

            router.push(`/dpps/results/${newSubmission.$id}`);

        } catch (err) {
            console.error("Failed to submit DPP:", err);
            setError("There was an error submitting your test. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <FullPageLoader />;
    if (error) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
            <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
            </div>
        </div>
    );
    if (!dpp) return null;

    const currentQuestion = dpp.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === dpp.questions.length - 1;
    const answeredCount = Object.keys(selectedAnswers).length;
    const progressPercentage = (answeredCount / dpp.questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        {dpp.title}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Question {currentQuestionIndex + 1}</span>
                        <span>of</span>
                        <span className="font-medium">{dpp.questions.length}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{answeredCount} / {dpp.questions.length} answered</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-blue-600 transition-all duration-300 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mb-6">
                    {/* Question Header */}
                    <div className="bg-gray-50 dark:bg-gray-800 px-6 sm:px-8 py-5 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold">{currentQuestionIndex + 1}</span>
                            </div>
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white pt-1.5">
                                {currentQuestion.questionText}
                            </h2>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="p-6 sm:p-8 space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedAnswers[currentQuestionIndex] === index;
                            
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleSelectAnswer(currentQuestionIndex, index)}
                                    className={`w-full p-4 sm:p-5 border-2 rounded-xl transition-all text-left flex items-center gap-4 group ${
                                        isSelected
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                                    }`}
                                >
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                        isSelected 
                                            ? 'border-blue-600 bg-blue-600' 
                                            : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                                    }`}>
                                        {isSelected && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                    <span className={`flex-1 ${
                                        isSelected 
                                            ? 'text-gray-900 dark:text-white font-medium' 
                                            : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                        {option}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Question Navigator */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 sm:p-6 mb-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Jump to question:</p>
                    <div className="flex flex-wrap gap-2">
                        {dpp.questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestionIndex(index)}
                                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                                    currentQuestionIndex === index
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : selectedAnswers[index] !== undefined
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-4">
                    <button 
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        disabled={currentQuestionIndex === 0}
                        className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-900 transition-all flex items-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" /> 
                        <span className="hidden sm:inline">Previous</span>
                    </button>

                    {isLastQuestion ? (
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-3 font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Submit Test
                                </>
                            )}
                        </button>
                    ) : (
                        <button 
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="px-5 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <span className="sm:hidden">Next</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default withAuth(TakeDppPage);