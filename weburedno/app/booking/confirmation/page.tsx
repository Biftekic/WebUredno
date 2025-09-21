'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, MessageCircle, Phone, Mail, Calendar, Home, Clock, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/ui/LoadingState';
import { getBooking } from '@/lib/db/bookings';
import { formatDateHr, formatPhoneForWhatsApp } from '@/lib/booking-utils';
import type { Booking } from '@/types/database';

function BookingConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [whatsappMessage, setWhatsappMessage] = useState('');

  useEffect(() => {
    loadBooking();
  }, [searchParams]);

  const loadBooking = async () => {
    const bookingId = searchParams.get('id');
    const whatsapp = searchParams.get('whatsapp');

    if (!bookingId) {
      router.push('/booking');
      return;
    }

    if (whatsapp) {
      setWhatsappMessage(decodeURIComponent(whatsapp));
    }

    try {
      const bookingData = await getBooking(bookingId);
      if (bookingData) {
        setBooking(bookingData);
      } else {
        router.push('/booking');
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      router.push('/booking');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    const phone = formatPhoneForWhatsApp('385915551234'); // Company WhatsApp number
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  const handleCallClick = () => {
    window.location.href = 'tel:+385915551234';
  };

  const handleEmailClick = () => {
    const subject = `Potvrda rezervacije - ${booking?.booking_number}`;
    const body = `Poštovani,\n\nHvala vam na rezervaciji. Vaš broj rezervacije je ${booking?.booking_number}.\n\nS poštovanjem,\nWebUredno tim`;
    window.location.href = `mailto:info@weburedno.hr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) {
    return <LoadingState message="Učitavanje potvrde..." />;
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Rezervacija nije pronađena</p>
          <Button onClick={() => router.push('/booking')}>
            Nova rezervacija
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rezervacija uspješno poslana!
          </h1>
          <p className="text-gray-600">
            Hvala vam što ste odabrali WebUredno
          </p>
        </div>

        {/* Booking Number */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Broj rezervacije</p>
            <p className="text-2xl font-bold text-green-600 font-mono">
              {booking.booking_number}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Sačuvajte ovaj broj za buduću komunikaciju
            </p>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Detalji rezervacije
          </h2>

          <div className="space-y-4">
            {/* Date and Time */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatDateHr(booking.booking_date)}
                </p>
                <p className="text-sm text-gray-600">{booking.time_slot}</p>
              </div>
            </div>

            {/* Service */}
            <div className="flex items-start gap-3">
              <Home className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {booking.service?.name || booking.service_type}
                </p>
                {booking.property_type && (
                  <p className="text-sm text-gray-600">
                    {booking.property_type === 'apartment' ? 'Stan' :
                     booking.property_type === 'house' ? 'Kuća' : 'Ured'}
                    {booking.property_size && ` • ${booking.property_size} m²`}
                  </p>
                )}
              </div>
            </div>

            {/* Customer Info */}
            {booking.customer && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {booking.customer.first_name} {booking.customer.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{booking.customer.email}</p>
                  <p className="text-sm text-gray-600">{booking.customer.phone}</p>
                  {booking.customer.address && (
                    <p className="text-sm text-gray-600">
                      {booking.customer.address}, {booking.customer.city}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-gray-900">
                  Ukupna cijena
                </p>
                <p className="text-xl font-bold text-green-600">
                  {booking.total_price || 0} EUR
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">
                Plaćanje nakon završene usluge
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="text-base font-semibold text-blue-900 mb-3">
            Što dalje?
          </h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-semibold">1.</span>
              <span>Kontaktirat ćemo vas u roku od 2 sata radi potvrde termina</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">2.</span>
              <span>Dan prije usluge dobit ćete SMS podsjetnik</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">3.</span>
              <span>Naš tim će doći u dogovoreno vrijeme s potrebnom opremom</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">4.</span>
              <span>Plaćanje se vrši nakon završene usluge</span>
            </li>
          </ol>
        </div>

        {/* Contact Options */}
        <div className="space-y-3">
          <Button
            variant="primary"
            fullWidth
            onClick={handleWhatsAppClick}
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Pošaljite poruku na WhatsApp
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleCallClick}
            >
              <Phone className="w-4 h-4 mr-2" />
              Nazovite nas
            </Button>

            <Button
              variant="outline"
              onClick={handleEmailClick}
            >
              <Mail className="w-4 h-4 mr-2" />
              Pošaljite email
            </Button>
          </div>

          <Button
            variant="ghost"
            fullWidth
            onClick={() => router.push('/')}
          >
            Povratak na početnu
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Important Notice */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-800 leading-relaxed">
            <strong>Napomena:</strong> Rezervaciju možete otkazati najkasnije 24 sata prije termina
            pozivom ili porukom. Za sve izmjene kontaktirajte nas što prije.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<LoadingState message="Učitavanje..." />}>
      <BookingConfirmationContent />
    </Suspense>
  );
}