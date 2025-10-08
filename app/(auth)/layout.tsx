import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
      {/*
        - Added 'animate-fade-in' class for a subtle entry animation.
        - This custom animation needs to be defined in your tailwind.config.js.
      */}
      <div className="w-full max-w-4xl bg-white dark:bg-slate-950/50 rounded-2xl shadow-2xl grid md:grid-cols-2 animate-fade-in">

        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-blue-700 to-blue-500 dark:from-slate-800 dark:to-slate-900 text-white rounded-l-2xl">
          <Image
            src="/miselogo.png"
            alt="MISE Logo"
            width={200} // Adjusted size for better balance
            height={200}
            className="mb-6" // Replaced mb-15 with a standard Tailwind class
          />
          <h1 className="text-2xl font-bold tracking-tight">
            MICHAELNAGAR INSTITUTE OF SCIENCE & EXCELLENCE
          </h1>
          <p className="mt-2 text-sm text-yellow-200 dark:text-slate-400">
            Join a community of learners dedicated to excellence.
          </p>

          {/* - Added 'mt-auto' to push the collaboration block to the bottom.
            - Grouped the collaboration text in a div for better structure.
          */}
          <div className="mt-auto pt-8">
            <p className="text-xl mb-1 text-yellow-200">In Collaboration with</p>
            <Image
              src="/logo.webp"
              alt="MISE Logo"
              width={250} // Adjusted size for better balance
              height={150}
              className="mb-2 ml-2 bg-amber-50" // Replaced mb-15 with a standard Tailwind class
            />
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          {children}
        </div>

      </div>
    </div>
  );
}