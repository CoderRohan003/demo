import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-4xl bg-[rgb(var(--card))] rounded-2xl shadow-2xl grid md:grid-cols-2">
        
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-blue-700 to-blue-500 dark:from-slate-800 dark:to-slate-900 text-white">
          <Image
            src="/logo.webp"
            alt="MISE Logo"
            width={200}
            height={100}
            className="mb-4"
          />
          <h1 className="text-3xl font-bold tracking-tight">
            Unlock Your Potential
          </h1>
          <p className="mt-2 text-blue-200 dark:text-slate-400">
            Join a community of learners dedicated to excellence.
          </p>
        </div>

        {/* Right Side: Form Content */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          {children}
        </div>

      </div>
    </div>
  );
}