'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black relative overflow-hidden">
      {/* Animated background elements - optimized for mobile */}
      <div className="absolute inset-0">
        <div className="hidden sm:block">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-gray-400/10 dark:bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-gray-300/8 dark:bg-white/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] bg-gradient-to-r from-gray-200/5 dark:from-white/2 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 pt-24 sm:pt-28 md:pt-32 lg:pt-32 relative z-10">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
          
          {/* Glass morphism container */}
          <div className="bg-white/30 dark:bg-white/10 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 lg:p-12 border border-white/40 dark:border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgba(255,255,255,0.1)] ring-1 ring-white/20 dark:ring-white/10 max-w-2xl w-full mx-auto">
            
            {/* 404 Image */}
            <div className="mb-8 sm:mb-10 flex justify-center">
              <div className="relative w-full max-w-md">
                <Image
                  src="/NotFoundImage.svg"
                  alt="404 - Page Not Found"
                  width={451}
                  height={283}
                  className="w-full h-auto filter drop-shadow-lg"
                  priority
                />
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white/90 mb-4 font-montserrat">
                Oops! Page Not Found
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-white/70 leading-relaxed max-w-lg mx-auto">
                The page you're looking for seems to have wandered off into the digital wilderness. 
                Don't worry, even the best stories sometimes take unexpected turns!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <button
                onClick={handleGoHome}
                className="bg-white/40 dark:bg-white/10 backdrop-blur-2xl border border-white/60 dark:border-white/20 hover:bg-white/60 dark:hover:bg-white/20 hover:border-white/80 dark:hover:border-white/30 text-gray-800 dark:text-white/90 font-semibold py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.05)] ring-1 ring-white/20 dark:ring-white/10 w-full sm:w-auto"
              >
                🏠 Go Home
              </button>
            </div>
          </div>

          {/* Floating decorative elements */}
          <div className="absolute top-20 left-10 w-4 h-4 bg-white/20 dark:bg-white/10 rounded-full animate-bounce delay-300 hidden lg:block"></div>
          <div className="absolute bottom-32 right-16 w-6 h-6 bg-white/15 dark:bg-white/8 rounded-full animate-bounce delay-700 hidden lg:block"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-white/25 dark:bg-white/12 rounded-full animate-bounce delay-500 hidden lg:block"></div>
        </div>
      </div>
    </div>
  );
}