"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  ArrowRight,
  Book,
  GraduationCap,
  Users,
  Video,
} from "lucide-react";
import { Client, Databases, Models } from "appwrite";

// This client is still needed to fetch public course data for the landing page
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;

// Images
import schoolLogo from "@/public/logo.webp";

import { FullPageLoader } from "./components/FullPageLoader";

const backgroundImages = [
  "/MISE/image1.JPG",
  "/MISE/image2.JPG",
  "/MISE/image3.JPG",
  "/MISE/image4.JPG",
  "/MISE/image5.JPG",
];

// Type for the course data
interface Course {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface BatchDocument extends Models.Document {
  name: string;
  description: string;
  icon?: string;
}

export default function LandingPage() {
  const { profile, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentBg, setCurrentBg] = useState(0);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (!isAuthLoading) {
      if (profile) {
        if (profile.role === 'super-admin') {
          router.replace('/super-admin');
        } else if (profile.role === 'teacher') {
          router.replace('/admin/upload');
        } else {
          router.replace('/home');
        }
      }
    }
  }, [isAuthLoading, profile, router]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await databases.listDocuments<BatchDocument>(DATABASE_ID, COLLECTION_ID);
        const coursesData: Course[] = response.documents.map((doc) => ({
          id: doc.$id,
          name: doc.name ?? "Untitled",
          description: doc.description ?? "",
          icon: doc.icon ?? "Book",
        }));
        setCourses(coursesData);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "BookOpen":
        return <BookOpen size={40} className="text-blue-600 dark:text-blue-400 mb-2" />;
      case "GraduationCap":
        return <GraduationCap size={40} className="text-blue-600 dark:text-blue-400 mb-2" />;
      case "Users":
        return <Users size={40} className="text-blue-600 dark:text-blue-400 mb-2" />;
      case "Video":
        return <Video size={40} className="text-blue-600 dark:text-blue-400 mb-2" />;
      default:
        return <Book size={40} className="text-blue-600 dark:text-blue-400 mb-2" />;
    }
  };

  if (isAuthLoading || profile) {
    return <FullPageLoader />;
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* ========== HERO + BACKGROUND SECTION ========== */}
      <section className="relative min-h-screen overflow-hidden bg-gray-900">
        {/* Background Carousel */}
        <div className="absolute inset-0 z-0">
          {backgroundImages.map((src, index) => (
            <Image
              key={index}
              src={src}
              alt={`School campus ${index + 1}`}
              fill
              priority={index === 0}
              className={`absolute inset-0 object-cover transition-opacity duration-1000 ${index === currentBg ? "opacity-30" : "opacity-0"
                }`}
            />
          ))}
        </div>


        {/* Foreground Content */}
        <div className="relative z-10 p-4 flex flex-col min-h-screen">
          <header className="flex justify-between items-center py-6 px-4">
            <span className="bg-white">
              <Image src={schoolLogo} alt="MISE Logo" width={300} height={200} />
            </span>
            <Image src={schoolLogo} alt="MISE Logo" width={100} height={100} className="rounded-full" />
          </header>

          <div className="flex-grow flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-20 md:py-32 px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">Welcome to MISE</h1>
            <p className="text-xl md:text-xl text-white mb-8">
              Your journey to academic excellence starts here. Access high-quality video lectures, track your progress, and join a community of learners.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full">
              <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white bg-blue-600 rounded-lg transition-transform transform hover:scale-105 hover:bg-white hover:text-black hover:font-bold hover:text-lg">
                Get Started <ArrowRight size={20} />
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 font-semibold bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-[#EFBF04] hover:font-bold hover:text-lg hover:text-[#000] transition-colors">
                I already have an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== WHAT WE DO ========== */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <BookOpen size={48} className="text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">High-Quality Courses</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Access professionally crafted video lessons and resources.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <GraduationCap size={48} className="text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Expert Instructors</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Learn from experienced educators and industry experts.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <Users size={48} className="text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Community Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Connect with peers and instructors in our vibrant community.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <Video size={48} className="text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Flexible Learning</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Study at your own pace, on your own schedule.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== COURSES ========== */}
      <section className="max-w-full mx-auto py-16 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Our Courses</h2>
        {loadingCourses ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Loading courses...</p>
        ) : (
          <div className="relative overflow-hidden w-full">
            <div className="flex gap-6 pb-4 pt-2 whitespace-nowrap animate-scrolling" style={{ display: "inline-flex", animationDuration: `${courses.length * 5}s` }}>
              {courses.concat(courses).map((course, index) => (
                <div key={`${course.id}-${index}`} className="flex-shrink-0 w-80">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center h-full flex flex-col items-center justify-center">
                    {getIconComponent(course.icon)}
                    <h3 className="font-semibold text-xl my-2 text-gray-900 dark:text-white">{course.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="text-center py-8 text-gray-600 dark:text-gray-400 text-sm bg-white dark:bg-gray-900">
        © 2025 MISE.org.in {"   "} All rights reserved.
      </footer>
    </div>
  );
}