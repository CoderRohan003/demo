// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import './globals.css';
// import { AuthProvider } from '@/context/AuthContext';
// import Script from 'next/script';
// import { ThemeProvider } from '@/context/ThemeProvider';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: {
//     default: 'MISE - Online Learning Platform',
//     template: '%s | MISE'
//   },
//   description: 'An online learning platform for JEE and NEET preparation by Michaelnagar Shikshaniketan(H.S)',
//   keywords: ['JEE preparation', 'NEET preparation', 'online learning', 'education'],
//   authors: [{ name: 'MISE Team' }],
//   creator: 'MISE',
//   openGraph: {
//     type: 'website',
//     locale: 'en_US',
//     url: 'https://your-domain.com',
//     title: 'MISE - Online Learning Platform',
//     description: 'Premier online learning platform for JEE and NEET preparation',
//     siteName: 'MISE',
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: 'MISE - Online Learning Platform',
//     description: 'Premier online learning platform for JEE and NEET preparation',
//   },
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={`${inter.className} bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300`}>
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="system"
//           enableSystem
//           disableTransitionOnChange
//         >
//           <AuthProvider>
//             {children}
//           </AuthProvider>
//         </ThemeProvider>
//         <Script src="https://checkout.razorpay.com/v1/checkout.js" />
//       </body>
//     </html>
//   );
// }





import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Script from 'next/script';
import { ThemeProvider } from '@/context/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  // Enhanced title: Keeps template for dynamic pages
  title: {
    default: 'MISE - Online Education for Classes 6-12: JEE, NEET, Olympiads & Coding',
    template: '%s | MISE'
  },
  // Expanded description: Covers full scope (foundation to AI/coding) for better snippet appeal
  description: 'MISE: Premier online platform for Classes 6-12. Expert courses in JEE Main/Advanced, NEET, Olympiads, foundation building, plus coding & AI in C, C++, Python, Java from beginner to advanced. By Michaelnagar Shikshaniketan (H.S).',
  // Keywords: Long-tail for education niche; focus on high-intent searches like "online JEE coaching India"
  keywords: [
    'online JEE preparation', 'NEET online courses', 'Olympiad preparation class 6-12',
    'foundation courses India', 'coding for students C++ Python Java', 'AI courses beginners',
    'JEE Main mock tests', 'NEET syllabus online', 'school education platform'
  ],
  // Authors/creator: Good for attribution; add URL if you have a team page
  authors: [{ name: 'MISE Team', url: 'https://www.mise.org.in' }],
  creator: 'MISE - Michaelnagar Shikshaniketan (H.S)',
  // Robots: Allow indexing; noindex sensitive pages if needed via child metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Alternates: Canonical for main domain; helps with www/non-www duplicates
  alternates: {
    canonical: 'https://www.mise.org.in',
  },
  // Open Graph: Updated URL; add images for social shares (e.g., course previews)
  openGraph: {
    type: 'website',
    locale: 'en_IN', // India-specific for better regional targeting
    url: 'https://www.mise.org.in',
    siteName: 'MISE',
    images: [
      {
        url: 'https://www.mise.org.in/og-image.jpg', // Upload a 1200x630 hero image
        width: 1200,
        height: 630,
        alt: 'MISE Online Learning Platform',
      },
    ],
    title: 'MISE - Online Courses for JEE, NEET, Coding & More',
    description: 'Affordable, expert-led online education for Classes 6-12: JEE/NEET prep, Olympiads, foundation, C/Python/Java coding, AI basics.',
  },
  // Twitter: Align with OG; add creator handle if you have @MISEofficial
  twitter: {
    card: 'summary_large_image',
    site: '@miseofficial', // Update with your handle
    creator: '@miseofficial',
    title: 'MISE - Online Courses for JEE, NEET, Coding & More',
    description: 'Expert online prep for JEE Main/Advanced, NEET, Olympiads, plus coding in Python/Java. Enroll now!',
    images: ['https://www.mise.org.in/twitter-image.jpg'], // 1200x675 optimized
  },
  // Icons: Essential for PWA-like behavior and branded search results
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  // Verification: Add Google Search Console if verified
  verification: {
    google: 'your-google-site-verification-code', // From GSC
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        {/* Razorpay script: Defer for perf; no SEO impact but keeps load fast */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}