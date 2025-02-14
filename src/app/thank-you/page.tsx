"use client";
import React from 'react';
import { useEffect } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ThankYouPage() {
  const router = useRouter();
  useEffect(() => {
    // Simulating a delay for loading effect
    const timer = setTimeout(() => router.push("./"), 7500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="relative bg-gray-800/80 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden border border-indigo-500/30 p-8 max-w-md w-full text-center">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800/50 pointer-events-none" />
        
        {/* Success icon */}
        <div className="mb-6 relative">
          <div className="w-20 h-20 mx-auto bg-indigo-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-indigo-400" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl font-bold text-white mb-4 relative">
          Thank You!
        </h1>
        <p className="text-indigo-200 mb-8 text-lg">
          Your assessment has been successfully submitted. We appreciate your time and effort.
        </p>

        {/* Additional feedback */}
        <div className="bg-indigo-500/10 rounded-xl p-4 mb-8">
          <p className="text-indigo-100 text-sm">
            You'll receive your results via email shortly. Make sure to check your inbox!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-4">
          
          
        </div>
      </div>
    </div>
  );
}