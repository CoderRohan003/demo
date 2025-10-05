'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { account } from '@/lib/appwrite';
import Link from 'next/link';

const ResetPasswordContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [userId, setUserId] = useState('');
    const [secret, setSecret] = useState('');

    useEffect(() => {
        const userIdParam = searchParams.get('userId');
        const secretParam = searchParams.get('secret');

        if (userIdParam && secretParam) {
            setUserId(userIdParam);
            setSecret(secretParam);
        } else {
            setError("Invalid or expired password reset link.");
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            await account.updateRecovery(userId, secret, password);
            setSuccess("Your password has been reset successfully! You can now log in.");
            setTimeout(() => router.push('/login'), 3000);
        } catch (err) {
            setError("Failed to reset password. The link may be invalid or expired.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center text-white">Reset Your Password</h1>
            
            {success ? (
                 <div className="text-center">
                    <p className="text-green-400">{success}</p>
                    <Link href="/login" legacyBehavior>
                        <a className="mt-4 inline-block font-medium text-blue-400 hover:underline">
                            Go to Login
                        </a>
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">New Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" required disabled={isLoading || !userId} />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-300">Confirm New Password</label>
                        <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" required disabled={isLoading || !userId} />
                    </div>
                    
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                    <button type="submit" disabled={isLoading || !userId} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500">
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            )}
        </div>
    );
};

// Use Suspense to handle the useSearchParams hook
const ResetPasswordPage = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordContent />
    </Suspense>
);

export default ResetPasswordPage;