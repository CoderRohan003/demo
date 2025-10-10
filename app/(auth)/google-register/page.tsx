'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { FullPageLoader } from '@/app/components/FullPageLoader';
import { ChevronDown, Check } from 'lucide-react';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const STUDENT_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID!;
const TEACHER_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TEACHER_PROFILES_COLLECTION_ID!;

const CompleteGoogleRegistrationPage = () => {
    const { user, profile, isLoading: isAuthLoading, refetchProfile } = useAuth();
    const router = useRouter();

    const [role, setRole] = useState<'student' | 'teacher'>('student');
    const [academicLevel, setAcademicLevel] = useState('');
    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');  // NEW: Phone validation error
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (!isAuthLoading && profile) {
            router.replace('/home');
        }
    }, [profile, isAuthLoading, router]);

    // NEW: Phone validation function
    const validatePhone = (value: string) => {
        let errorMsg = '';
        if (!value) errorMsg = 'Phone number is required.';
        else if (!/^\d{10}$/.test(value))
            errorMsg = 'Phone number must be exactly 10 digits.';
        setPhoneError(errorMsg);
    };

    // UPDATED: Phone onChange with validation
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPhone(value);
        validatePhone(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || phoneError) {  // UPDATED: Include phoneError check
            setError('Please enter a valid phone number.');
            return;
        }
        if (role === 'student' && !academicLevel) {
            setError('Please select your academic level.');
            return;
        }
        setIsLoading(true);
        setError('');

        if (!user) {
            setError('User not found. Please try logging in again.');
            setIsLoading(false);
            return;
        }

        try {
            let profileData;
            const profileCollectionId = role === 'student'
                ? STUDENT_PROFILES_COLLECTION_ID
                : TEACHER_PROFILES_COLLECTION_ID;

            if (role === 'student') {
                profileData = {
                    userId: user.$id,
                    name: user.name,
                    role: 'student',
                    phone: phone,
                    academicLevel: academicLevel,
                    bio: '', avatarS3Key: '',
                };
            } else { // teacher
                profileData = {
                    userId: user.$id,
                    name: user.name,
                    role: 'teacher',
                    phone: phone,
                    bio: '', avatarS3Key: '', title: '', experience: '', qualifications: [],
                    approved: false,
                };
            }

            await databases.createDocument(
                DATABASE_ID,
                profileCollectionId,
                ID.unique(),
                profileData
            );

            await refetchProfile();
            router.push('/home');

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || 'An error occurred while creating your profile.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isAuthLoading || !user) {
        return <FullPageLoader />;
    }

    const formInputStyle = "w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--input))] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] disabled:opacity-50";
    const formInputErrorStyle = phoneError ? 'border-red-500 focus:ring-red-500' : '';  // NEW: Error styling for phone

    return (
        <div className="w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-[rgb(var(--card-foreground))]">Complete Your Profile</h1>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">
                Welcome, {user.name}! Just one more step to get started.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                    <button type="button" onClick={() => setRole('student')} className={`w-1/2 p-2 rounded-md text-sm font-medium transition-colors ${role === 'student' ? 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        I am a Student
                    </button>
                    <button type="button" onClick={() => setRole('teacher')} className={`w-1/2 p-2 rounded-md text-sm font-medium transition-colors ${role === 'teacher' ? 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        I am a Teacher
                    </button>
                </div>

                {role === 'student' && (
                    <div className="relative">
                        <label className="block mb-2 text-sm font-medium">Academic Level</label>
                        <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`${formInputStyle} flex items-center justify-between text-left`}>
                            <span>{academicLevel ? `Class ${academicLevel}` : 'Select your class'}</span>
                            <ChevronDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                        </button>
                        {isDropdownOpen && (
                            <ul className="absolute z-10 w-full mt-1 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-md shadow-lg max-h-65 overflow-auto">
                                {[6, 7, 8, 9, 10, 11, 12].map(cls => (
                                    <li
                                        key={cls}
                                        onClick={() => {
                                            setAcademicLevel(String(cls));
                                            setIsDropdownOpen(false);
                                        }}
                                        className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                                    >
                                        Class {cls}
                                        {academicLevel === String(cls) && <Check size={16} className="text-[rgb(var(--primary))]" />}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <div>
                    <label htmlFor="phone" className="block mb-2 text-sm font-medium">Phone Number</label>
                    <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        placeholder="Enter 10-digit phone number"  // UPDATED: Better placeholder
                        value={phone} 
                        onChange={handlePhoneChange}  // UPDATED: Use handler with validation
                        className={`${formInputStyle} ${formInputErrorStyle}`}  // UPDATED: Add error style
                        required 
                        disabled={isLoading} 
                    />
                    {phoneError && <p className="text-sm text-red-500 mt-1">{phoneError}</p>}  
                </div>

                {error && <p className="text-sm text-center text-[rgb(var(--destructive))]">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading || !!phoneError || (!phone)}  // UPDATED: Disable if phone invalid
                    className="w-full px-4 py-3 font-bold text-[rgb(var(--primary-foreground))] bg-[rgb(var(--primary))] rounded-md hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Saving...' : 'Complete Registration'}
                </button>
            </form>
        </div>
    );
};

export default CompleteGoogleRegistrationPage;