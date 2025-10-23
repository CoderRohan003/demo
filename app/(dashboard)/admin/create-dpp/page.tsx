'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import { useRouter } from 'next/navigation';
import withAuth from '@/app/components/auth/withAuth';
import { Plus, Trash2, Calendar, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;
const DPPS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DPPS_COLLECTION_ID!;

interface Batch {
    $id: string;
    name: string;
}

interface Question {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
}

const CreateDppPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [title, setTitle] = useState('');
    const [dppDate, setDppDate] = useState('');
    const [questions, setQuestions] = useState<Question[]>([
        { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!user) return;
        const fetchBatches = async () => {
            try {
                const response = await databases.listDocuments(DATABASE_ID, BATCHES_COLLECTION_ID, [
                    Query.contains('teacherIds', user.$id)
                ]);
                setBatches(response.documents as unknown as Batch[]);
            } catch (error) {
                console.error("Failed to fetch batches:", error);
                setError("Could not load your assigned batches.");
            }
        };
        fetchBatches();
    }, [user]);

    const handleQuestionChange = (index: number, field: 'questionText' | 'correctAnswerIndex', value: string | number) => {
        const newQuestions = [...questions];
        if (field === 'questionText') {
            newQuestions[index].questionText = value as string;
        } else if (field === 'correctAnswerIndex') {
            newQuestions[index].correctAnswerIndex = value as number;
        }
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 }]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dppDate) { setError('Please select a date for the DPP.'); return; }
        if (!title || !selectedBatch || questions.some(q => !q.questionText || q.options.some(o => !o))) {
            setError('Please fill all fields for the title, batch, and all questions/options.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const dppData = {
                title,
                batchId: selectedBatch,
                dppDate: new Date(dppDate).toISOString(),
                questions: JSON.stringify(questions),
            };

            await databases.createDocument(
                DATABASE_ID,
                DPPS_COLLECTION_ID,
                ID.unique(),
                dppData
            );

            setSuccess('DPP created successfully!');
            setTitle('');
            setSelectedBatch('');
            setDppDate('');
            setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 }]);
        } catch (error) {
            setError('Failed to create DPP. Please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Header */}
                <div className="mb-8 sm:mb-12">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-blue-600 rounded-xl">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Create DPP</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base ml-0 sm:ml-14">Design and assign daily practice problems to your batches</p>
                </div>

                {/* Alert Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-green-800 dark:text-green-300 text-sm">{success}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Basic Information</h2>
                        
                        <div className="space-y-5">
                            {/* Title Input */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    DPP Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="e.g., Algebra Week 1"
                                    required
                                />
                            </div>

                            {/* Batch Selection */}
                            <div>
                                <label htmlFor="batch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Assign to Batch
                                </label>
                                <select
                                    id="batch"
                                    value={selectedBatch}
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                                    required
                                >
                                    <option value="" disabled>Select one of your batches</option>
                                    {batches.map(batch => (
                                        <option key={batch.$id} value={batch.$id}>{batch.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Input */}
                            <div>
                                <label htmlFor="dppDate" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    DPP Date
                                </label>
                                <input
                                    type="date"
                                    id="dppDate"
                                    value={dppDate}
                                    onChange={(e) => setDppDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Questions</h2>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
                        </div>

                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
                                {/* Question Header */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{qIndex + 1}</span>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Question {qIndex + 1}</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(qIndex)}
                                        disabled={questions.length <= 1}
                                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                                        title="Remove question"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Question Text */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Question Text
                                    </label>
                                    <textarea
                                        value={q.questionText}
                                        onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Enter the question text"
                                        rows={3}
                                        required
                                    />
                                </div>

                                {/* Options */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Answer Options <span className="text-gray-500 dark:text-gray-400 font-normal">(select correct answer)</span>
                                    </label>
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-3 group">
                                            <div className="flex-shrink-0">
                                                <input
                                                    type="radio"
                                                    name={`correct_answer_${qIndex}`}
                                                    checked={q.correctAnswerIndex === oIndex}
                                                    onChange={() => handleQuestionChange(qIndex, 'correctAnswerIndex', oIndex)}
                                                    className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                        q.correctAnswerIndex === oIndex
                                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                                    }`}
                                                    placeholder={`Option ${oIndex + 1}`}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Add Question Button */}
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="w-full px-6 py-4 bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Add Another Question
                        </button>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating DPP...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Create DPP
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default withAuth(CreateDppPage);