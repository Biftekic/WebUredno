import { Phone, Mail, MapPin } from 'lucide-react';
import { WHATSAPP_PHONE } from '@/lib/constants';
import { formatPhoneNumber } from '@/lib/utils';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">WebUredno</h3>
            <p className="text-gray-400">
              Profesionalne usluge čišćenja za vaš dom ili ured
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Kontakt</h4>
            <div className="space-y-2 text-gray-400">
              <p className="flex items-center gap-2">
                <Phone size={16} />
                {formatPhoneNumber(WHATSAPP_PHONE)}
              </p>
              <p className="flex items-center gap-2">
                <Mail size={16} />
                info@weburedno.hr
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={16} />
                Zagreb, Hrvatska
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Brzi linkovi</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/services" className="hover:text-white">Usluge</a></li>
              <li><a href="/booking" className="hover:text-white">Rezervacija</a></li>
              <li><a href="/about" className="hover:text-white">O nama</a></li>
              <li><a href="/contact" className="hover:text-white">Kontakt</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2024 WebUredno. Sva prava pridržana.</p>
        </div>
      </div>
    </footer>
  );
}