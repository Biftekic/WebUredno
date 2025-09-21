'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700"
        aria-label="Toggle navigation"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg z-50">
          <ul className="flex flex-col p-4 space-y-2">
            <li><a href="/" className="block py-2">Početna</a></li>
            <li><a href="/services" className="block py-2">Usluge</a></li>
            <li><a href="/booking" className="block py-2">Rezervacija</a></li>
            <li><a href="/about" className="block py-2">O nama</a></li>
            <li><a href="/contact" className="block py-2">Kontakt</a></li>
          </ul>
        </div>
      )}
    </nav>
  );
}