// app/(dashboard)/super-admin/create-announcement/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import withSuperAdminAuth from '@/app/components/auth/withSuperAdminAuth';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';

const ANNOUNCEMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ANNOUNCEMENTS_COLLECTION_ID!;
const NOTIFICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!;
const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

interface Batch {
    $id: string;
    name: string;
}

const CreateAnnouncementPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [batches, setBatches] = useState<Batch[]>([]);
    const [targetBatch, setTargetBatch] = useState('global'); // 'global' or a specific batchId

    useEffect(() => {
        // Fetch all batches to populate the dropdown
        const fetchBatches = async () => {
            try {
                const response = await databases.listDocuments(DATABASE_ID, BATCHES_COLLECTION_ID);
                setBatches(response.documents as unknown as Batch[]);
            } catch (err) {
                console.error("Failed to fetch batches:", err);
            }
        };
        fetchBatches();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message || !user) {
            setError('Please enter a message.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            // This creates ONE notification document.
            // The navbar on the client-side will determine who should see it.
            await databases.createDocument(
                DATABASE_ID,
                NOTIFICATIONS_COLLECTION_ID,
                ID.unique(),
                {
                    targetId: targetBatch, // This is either 'global' or a batchId
                    message: message,
                    type: 'announcement',
                }
            );
            
            setSuccess('Announcement sent successfully!');
            setTimeout(() => {
                router.push('/super-admin');
            }, 3000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Create New Announcement</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
                Select a target audience and write a message to be sent as a notification.
            </p>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                
                {/* Target Audience Dropdown */}
                <div>
                    <label htmlFor="targetBatch" className="block mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Send To
                    </label>
                    <select
                        id="targetBatch"
                        value={targetBatch}
                        onChange={(e) => setTargetBatch(e.target.value)}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="global">📢 All Batches (Global)</option>
                        {batches.map(batch => (
                            <option key={batch.$id} value={batch.$id}>🎓 {batch.name}</option>
                        ))}
                    </select>
                </div>

                {/* Message Textarea */}
                <div>
                    <label htmlFor="message" className="block mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Message
                    </label>
                    <textarea
                        id="message"
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                        placeholder="Enter your announcement here..."
                    />
                </div>
                
                {error && <p className="text-red-500 text-center">{error}</p>}
                {success && <p className="text-green-500 text-center">{success}</p>}

                <button 
                    type="submit" 
                    disabled={isLoading || !!success} 
                    className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Sending...' : 'Send Announcement'}
                </button>
            </form>
        </div>
    );
};

export default withSuperAdminAuth(CreateAnnouncementPage);