import Link from 'next/link';
import { Home, Search, ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50/30 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-9xl font-bold text-gray-200">404</div>
            <Sparkles className="absolute top-4 right-4 h-8 w-8 text-green-600 animate-pulse" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Stranica Nije Pronađena
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Ups! Izgleda da stranica koju tražite ne postoji ili je premještena.
        </p>

        {/* Helpful Links */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Možda tražite:
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            <Link
              href="/services"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50 transition-colors"
            >
              <Search className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Naše Usluge</div>
                <div className="text-sm text-gray-600">Pregled svih usluga čišćenja</div>
              </div>
            </Link>
            <Link
              href="/booking"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50 transition-colors"
            >
              <Sparkles className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Rezervacija</div>
                <div className="text-sm text-gray-600">Zakažite termin čišćenja</div>
              </div>
            </Link>
            <Link
              href="/about"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50 transition-colors"
            >
              <Search className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">O Nama</div>
                <div className="text-sm text-gray-600">Saznajte više o WebUredno</div>
              </div>
            </Link>
            <Link
              href="/contact"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50 transition-colors"
            >
              <Search className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Kontakt</div>
                <div className="text-sm text-gray-600">Javite nam se</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Početna Stranica
          </Link>
          <button
            onClick={() => window.history.back()}
            className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Natrag
          </button>
        </div>
      </div>
    </div>
  );
}