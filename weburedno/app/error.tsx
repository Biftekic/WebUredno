'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-red-50/30 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="bg-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Nešto je pošlo po zlu
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Ispričavamo se zbog neugodnosti. Dogodila se greška prilikom učitavanja stranice.
        </p>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-gray-900 mb-2">Detalji greške:</h2>
            <pre className="text-sm text-red-600 overflow-x-auto whitespace-pre-wrap">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Pokušaj Ponovno
          </button>
          <Link
            href="/"
            className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Početna Stranica
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 mb-2">
            Ako se problem nastavi, molimo vas da nas kontaktirate:
          </p>
          <a
            href="tel:+385958581508"
            className="text-green-600 font-semibold hover:text-green-700"
          >
            095 858 1508
          </a>
          <span className="mx-2 text-gray-400">|</span>
          <a
            href="mailto:info@weburedno.hr"
            className="text-green-600 font-semibold hover:text-green-700"
          >
            info@weburedno.hr
          </a>
        </div>
      </div>
    </div>
  );
}