'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { hr } from 'date-fns/locale';
import { generateAvailableDates, TIME_SLOTS, isTimeSlotPast } from '@/lib/booking-utils';
import { getAvailabilityForDates } from '@/lib/db/bookings';
import type { AvailabilitySlot } from '@/types/database';
import LoadingState from '@/components/ui/LoadingState';

interface BookingCalendarProps {
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  onDateTimeSelect: (date: Date, timeSlot: string) => void;
}

export default function BookingCalendar({
  selectedDate,
  selectedTimeSlot,
  onDateTimeSelect,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availability, setAvailability] = useState<Map<string, AvailabilitySlot[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadAvailability();
  }, [currentMonth]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      // Get available dates (excluding Sundays)
      const dates = generateAvailableDates(30);
      setAvailableDates(dates);

      // Format dates for API
      const dateStrings = dates.map(d => format(d, 'yyyy-MM-dd'));

      // Get availability from database
      const availabilityData = await getAvailabilityForDates(dateStrings.slice(0, 10)); // Load first 10 days
      setAvailability(availabilityData);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.some(d => isSameDay(d, date));
  };

  const getDateSlots = (date: Date): AvailabilitySlot[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability.get(dateStr) || [];
  };

  const handleDateClick = async (date: Date) => {
    if (!isDateAvailable(date)) return;

    // Load slots for this date if not already loaded
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!availability.has(dateStr)) {
      setLoading(true);
      try {
        const newAvailability = await getAvailabilityForDates([dateStr]);
        setAvailability(prev => new Map([...prev, ...newAvailability]));
      } catch (error) {
        console.error('Error loading date slots:', error);
      } finally {
        setLoading(false);
      }
    }

    setExpandedDate(isSameDay(expandedDate || new Date(0), date) ? null : date);
  };

  const handleTimeSlotClick = (date: Date, timeSlot: string) => {
    if (isTimeSlotPast(date, timeSlot)) return;
    onDateTimeSelect(date, timeSlot);
  };

  const daysInMonth = getDaysInMonth();
  const firstDayOfWeek = (startOfMonth(currentMonth).getDay() + 6) % 7; // Monday = 0

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          Odaberite datum
        </h3>
        <p className="text-xs sm:text-sm text-gray-600">
          Dostupni termini u sljedećih 30 dana (radimo ponedjeljak - subota)
        </p>
      </div>

      {loading ? (
        <LoadingState message="Učitavanje kalendara..." />
      ) : (
        <>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <button
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
              className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-touch min-w-[44px]"
              aria-label="Prethodni mjesec"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>

            <h4 className="text-sm sm:text-base font-medium text-gray-900 capitalize">
              {format(currentMonth, 'LLLL yyyy', { locale: hr })}
            </h4>

            <button
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
              className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-touch min-w-[44px]"
              aria-label="Sljedeći mjesec"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-3 sm:mb-4">
            {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map(day => (
              <div key={day} className="text-xxs sm:text-xs font-medium text-gray-500 text-center py-1 sm:py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days of month */}
            {daysInMonth.map(date => {
              const available = isDateAvailable(date);
              const selected = selectedDate && isSameDay(date, selectedDate);
              const expanded = expandedDate && isSameDay(date, expandedDate);
              const today = isToday(date);
              const slots = getDateSlots(date);
              const hasAvailableSlots = slots.some(s => s.available_teams > 0);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  disabled={!available}
                  className={`
                    relative aspect-square flex items-center justify-center rounded-md sm:rounded-lg text-xs sm:text-sm
                    transition-all duration-200 min-h-[36px] sm:min-h-[40px]
                    ${!available ? 'text-gray-300 cursor-not-allowed' : ''}
                    ${available && !selected && !expanded ? 'hover:bg-green-50 active:bg-green-100 text-gray-900 cursor-pointer' : ''}
                    ${selected ? 'bg-green-600 text-white font-medium' : ''}
                    ${expanded && !selected ? 'bg-green-100 text-green-900' : ''}
                    ${today && !selected ? 'ring-1 sm:ring-2 ring-green-500 ring-offset-1 sm:ring-offset-2' : ''}
                    ${available && hasAvailableSlots ? 'font-medium' : ''}
                  `}
                  aria-label={`${format(date, 'd. MMMM', { locale: hr })} ${
                    available ? (hasAvailableSlots ? 'dostupno' : 'popunjeno') : 'nedostupno'
                  }`}
                >
                  {format(date, 'd')}
                  {available && hasAvailableSlots && (
                    <span className={`
                      absolute bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full
                      ${selected ? 'bg-white' : 'bg-green-500'}
                    `} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Time Slots for Selected Date */}
          {expandedDate && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                Dostupni termini za {format(expandedDate, 'd. MMMM', { locale: hr })}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                {TIME_SLOTS.map(slot => {
                  const dateSlots = getDateSlots(expandedDate);
                  const slotData = dateSlots.find(s => s.time_slot === slot.value);
                  const available = slotData && slotData.available_teams > 0;
                  const isPast = isTimeSlotPast(expandedDate, slot.value);
                  const selected = selectedTimeSlot === slot.value && selectedDate && isSameDay(selectedDate, expandedDate);

                  return (
                    <button
                      key={slot.value}
                      onClick={() => handleTimeSlotClick(expandedDate, slot.value)}
                      disabled={!available || isPast}
                      className={`
                        p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                        min-h-touch-lg flex flex-col items-center justify-center gap-0.5 sm:gap-1
                        ${!available || isPast ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                        ${available && !selected && !isPast ? 'bg-white border-2 border-gray-200 text-gray-900 hover:border-green-500 hover:bg-green-50 active:bg-green-100' : ''}
                        ${selected ? 'bg-green-600 text-white border-2 border-green-600' : ''}
                      `}
                      aria-label={`${slot.label} ${
                        !available ? 'nedostupno' :
                        isPast ? 'prošlo' :
                        `dostupno (${slotData?.available_teams} tim${slotData?.available_teams === 1 ? '' : 'a'})`
                      }`}
                    >
                      <span className="font-semibold">{slot.label}</span>
                      {available && !isPast && slotData && (
                        <span className={`text-xxs sm:text-xs ${selected ? 'text-green-100' : 'text-gray-500'}`}>
                          {slotData.available_teams} {slotData.available_teams === 1 ? 'tim' : 'tima'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected DateTime Display */}
          {selectedDate && selectedTimeSlot && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs sm:text-sm font-medium text-green-900">
                Odabrani termin:
              </p>
              <p className="text-sm sm:text-base text-green-700 mt-1">
                {format(selectedDate, 'EEEE, d. MMMM yyyy.', { locale: hr })} u {selectedTimeSlot}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}