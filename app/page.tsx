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
import { FullPageLoader } from "./components/FullPageLoader";

// This client is still needed to fetch public course data for the landing page
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;
const WEBSITE_VERSION = "1.1.0"; 

// Images
import schoolLogo from "@/public/logo.webp";
import miseLogo from "@/public/miselogo.png";

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

// --- NEW: Helper function to truncate text ---
const truncateWords = (text: string, limit: number) => {
  const words = text.split(" ");
  if (words.length > limit) {
    return words.slice(0, limit).join(" ") + "...";
  }
  return text;
};

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
          description: doc.description ?? "No description available.", // Ensure description has a fallback
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
        return <BookOpen size={40} className="text-blue-600 dark:text-blue-400 mb-4" />;
      case "GraduationCap":
        return <GraduationCap size={40} className="text-blue-600 dark:text-blue-400 mb-4" />;
      case "Users":
        return <Users size={40} className="text-blue-600 dark:text-blue-400 mb-4" />;
      case "Video":
        return <Video size={40} className="text-blue-600 dark:text-blue-400 mb-4" />;
      default:
        return <Book size={40} className="text-blue-600 dark:text-blue-400 mb-4" />;
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
              className={`absolute inset-0 object-cover transition-opacity duration-1000 ${
                index === currentBg ? "opacity-30" : "opacity-0"
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
            <Image src={miseLogo} alt="MISE Logo" width={250} height={250} className="rounded-full" />
          </header>

          <div className="flex-grow flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-20 md:py-32 px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">Welcome to MISE</h1>
            <p className="text-xl md:text-xl text-white mb-8">
              Step into academic excellence with our insightful guidance and blend the best of both worlds of personalized offline learning and digital access to expert-led recorded lectures.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full">
              <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white bg-blue-600 rounded-lg transition-transform transform hover:scale-105 hover:bg-white hover:text-black hover:font-bold hover:text-lg">
                Get Started <ArrowRight size={20} />
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 font-semibold bg-white text-black border border-blue-600 rounded-lg hover:bg-[#EFBF04] hover:font-bold hover:text-lg hover:text-[#000] transition-colors">
                Sign In
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
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Offline Classes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Participate in engaging offline classes for a face-to-face learning experience.</p>
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
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-center text-gray-600 dark:text-gray-400 text-lg">Loading courses...</p>
          </div>
        ) : (
          <div className="relative overflow-hidden w-full group">
            <style jsx>{`
              @keyframes scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-scrolling {
                animation: scroll linear infinite;
              }
              .group:hover .animate-scrolling {
                animation-play-state: paused;
              }
              .card-gradient {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
            `}</style>
            
            <div 
              className="flex gap-8 pb-6 pt-4 animate-scrolling" 
              style={{ 
                display: "inline-flex",
                animationDuration: `${courses.length * 6}s`
              }}
            >
              {courses.concat(courses).map((course, index) => (
                <a 
                  href="/login" 
                  key={`${course.id}-${index}`} 
                  className="flex-shrink-0 w-96 group/card cursor-pointer"
                >
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden h-full transition-all duration-300 group-hover/card:shadow-2xl group-hover/card:-translate-y-2 border border-gray-200 dark:border-gray-700">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover/card:from-blue-500/5 group-hover/card:to-purple-500/5 transition-all duration-300"></div>
                    
                    {/* Content */}
                    <div className="relative p-8 flex flex-col items-center text-center h-full">
                      {/* Icon container with animated background */}
                      {/* <div className="relative mb-4">
                        <div className="absolute inset-0 bg-blue-500 rounded-full opacity-10 group-hover/card:opacity-20 transition-opacity blur-xl"></div>
                        <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-2xl group-hover/card:scale-110 transition-transform duration-300">
                          {getIconComponent(course.icon)}
                        </div>
                      </div> */}
                      
                      <h3 className="font-bold text-2xl mb-3 text-gray-900 dark:text-white group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors">
                        {course.name}
                      </h3>
                      <br />
                      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 h-20 overflow-y-visible mb-4">
                        {truncateWords(course.description, 20)}
                      </p>
                      
                      {/* Hover indicator */}
                      <div className="mt-auto pt-1 flex items-center gap-2 text-blue-600 dark:text-blue-400 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                        <span className="text-sm font-semibold">Learn More</span>
                        <svg className="w-4 h-1 group-hover/card:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover/card:scale-x-100 transition-transform duration-300"></div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="text-center py-8 text-gray-600 dark:text-gray-400 text-sm bg-white dark:bg-gray-900">
        © {new Date().getFullYear()} MISE.org.in {"  "} All rights reserved.
      </footer>
      {/* --- MODIFICATION: Added version number below footer --- */}
      <div className="text-center pb-4 text-xs text-gray-500 dark:text-gray-500 bg-white dark:bg-gray-900">
        Version {WEBSITE_VERSION}
      </div>
    </div>
  );
}