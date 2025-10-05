import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Script from 'next/script';
import { ThemeProvider } from '@/context/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'MISE - Online Learning Platform',
    template: '%s | MISE'
  },
  description: 'An online learning platform for JEE and NEET preparation by Michaelnagar Shikshaniketan(H.S)',
  keywords: ['JEE preparation', 'NEET preparation', 'online learning', 'education'],
  authors: [{ name: 'MISE Team' }],
  creator: 'MISE',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    title: 'MISE - Online Learning Platform',
    description: 'Premier online learning platform for JEE and NEET preparation',
    siteName: 'MISE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MISE - Online Learning Platform',
    description: 'Premier online learning platform for JEE and NEET preparation',
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
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}