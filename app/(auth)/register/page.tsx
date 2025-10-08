'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { account, databases } from '@/lib/appwrite';
import { useAuth } from '@/context/AuthContext';
import { AppwriteException, ID, OAuthProvider } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const STUDENT_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID!;
const TEACHER_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TEACHER_PROFILES_COLLECTION_ID!;

// SVG for Google icon
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" width="20px" height="20px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12
      c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20
      s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12
      c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4
      C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238
      C29.211,35.091,26.715,36,24,36
      c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303
      c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238
      C39.902,35.619,44,29.827,44,24
      C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  academicLevel: string;
}

interface FieldErrors {
  email: string;
  password: string;
  phone: string;
}

interface StudentProfile {
  userId: string;
  name: string;
  role: 'student';
  phone: string;
  bio: string;
  avatarS3Key: string;
  academicLevel: string;
}

interface TeacherProfile {
  userId: string;
  name: string;
  role: 'teacher';
  phone: string;
  bio: string;
  avatarS3Key: string;
  title: string;
  experience: string;
  qualifications: string[];
}

type Profile = StudentProfile | TeacherProfile;

const RegisterPage = () => {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    academicLevel: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    email: '',
    password: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const router = useRouter();
  const { setUser, setProfile, refetchProfile } = useAuth();

  useEffect(() => {
    const isDataFilled =
      formData.name &&
      formData.email &&
      formData.password &&
      formData.phone &&
      (role === 'teacher' || formData.academicLevel);

    const hasNoErrors =
      !fieldErrors.email && !fieldErrors.password && !fieldErrors.phone;

    setIsFormValid(Boolean(isDataFilled && hasNoErrors)); // ✅ Fixed line
  }, [formData, fieldErrors, role]);

  const handleGoogleLogin = () => {
    try {
      account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/home`,
        `${window.location.origin}/register`
      );
    } catch (error) {
      console.error('Failed to initiate Google login', error);
      setError('Could not start Google login process.');
    }
  };

  const validateField = (name: string, value: string) => {
    let errorMsg = '';
    switch (name) {
      case 'email':
        if (!value) errorMsg = 'Email is required.';
        else if (!/^[^\s@]+@gmail\.com$/.test(value))
          errorMsg = 'Must be a valid @gmail.com address.';
        break;
      case 'password':
        if (!value) errorMsg = 'Password is required.';
        else if (value.length < 8)
          errorMsg = 'Password must be at least 8 characters long.';
        else if (!/[A-Z]/.test(value))
          errorMsg = 'Password must contain an uppercase letter.';
        else if (!/[0-9]/.test(value))
          errorMsg = 'Password must contain a number.';
        else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
          errorMsg = 'Password must contain a special character.';
        break;
      case 'phone':
        if (!value) errorMsg = 'Phone number is required.';
        else if (!/^\d{10}$/.test(value))
          errorMsg = 'Phone number must be exactly 10 digits.';
        break;
      default:
        break;
    }
    setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setError('Please fix the errors before submitting.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');
    let newUser = null;

    try {
      newUser = await account.create(ID.unique(), formData.email, formData.password, formData.name);

      let profileData: Profile;
      if (role === 'student') {
        profileData = {
          userId: newUser.$id,
          name: formData.name,
          role: 'student',
          phone: formData.phone,
          bio: '',
          avatarS3Key: '',
          academicLevel: formData.academicLevel,
        };
      } else {
        profileData = {
          userId: newUser.$id,
          name: formData.name,
          role: 'teacher',
          phone: formData.phone,
          bio: '',
          avatarS3Key: '',
          title: '',
          experience: '',
          qualifications: [],
        };
      }

      const profileCollectionId =
        role === 'student' ? STUDENT_PROFILES_COLLECTION_ID : TEACHER_PROFILES_COLLECTION_ID;

      await databases.createDocument(DATABASE_ID, profileCollectionId, ID.unique(), profileData);
      await account.createEmailPasswordSession(formData.email, formData.password);

      const currentUser = await account.get();
      setUser(currentUser);
      const updatedProfile = await refetchProfile();
      setProfile(updatedProfile);

      setMessage('Registration successful! Redirecting...');
      window.location.href = role === 'teacher' ? '/admin/upload' : '/home';
    } catch (err: unknown) {
      if (newUser) {
        console.error('CRITICAL: User was created in Auth, but profile creation failed.', err);
        setError('Registration incomplete. Please contact support.');
      } else {
        if (err instanceof AppwriteException && err.code === 409) {
          setError('A user with this email already exists.');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred during account creation.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formInputStyle =
    'w-full px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--input))] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] disabled:opacity-50';
  const formInputErrorStyle = 'border-red-500 focus:ring-red-500';

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-bold text-[rgb(var(--card-foreground))]">
        Create an Account
      </h1>
      <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">
        Join us to start your learning journey.
      </p>

      <div className="my-6">
        <button
          onClick={handleGoogleLogin}
          className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 border border-[rgb(var(--border))] rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <GoogleIcon /> Sign up with Google
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[rgb(var(--border))]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[rgb(var(--card))] px-2 text-[rgb(var(--muted-foreground))]">
            Or continue with
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`w-1/2 p-2 rounded-md text-sm font-medium ${
              role === 'student'
                ? 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            I am a Student
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`w-1/2 p-2 rounded-md text-sm font-medium ${
              role === 'teacher'
                ? 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            I am a Teacher
          </button>
        </div>

        <div>
          <label htmlFor="name" className="block mb-2 text-sm font-medium">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={formInputStyle}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`${formInputStyle} ${fieldErrors.email ? formInputErrorStyle : ''}`}
            required
            disabled={isLoading}
          />
          {fieldErrors.email && <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block mb-2 text-sm font-medium">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`${formInputStyle} ${fieldErrors.password ? formInputErrorStyle : ''}`}
            required
            disabled={isLoading}
          />
          {fieldErrors.password && <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block mb-2 text-sm font-medium">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`${formInputStyle} ${fieldErrors.phone ? formInputErrorStyle : ''}`}
            required
            disabled={isLoading}
          />
          {fieldErrors.phone && <p className="text-sm text-red-500 mt-1">{fieldErrors.phone}</p>}
        </div>

        {role === 'student' && (
          <div>
            <label htmlFor="academicLevel" className="block mb-2 text-sm font-medium">
              Academic Level
            </label>
            <select
              id="academicLevel"
              name="academicLevel"
              value={formData.academicLevel}
              onChange={handleChange}
              className={formInputStyle}
              required
              disabled={isLoading}
            >
              <option value="" disabled>
                Select your class
              </option>
              {[6, 7, 8, 9, 10, 11, 12].map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="text-sm text-[rgb(var(--destructive))] text-center">{error}</p>}
        {message && <p className="text-sm text-green-500 text-center">{message}</p>}

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full px-4 py-3 font-bold text-[rgb(var(--primary-foreground))] bg-[rgb(var(--primary))] rounded-md hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-sm text-center text-[rgb(var(--muted-foreground))] mt-6">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-[rgb(var(--primary))] hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
