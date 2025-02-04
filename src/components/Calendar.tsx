import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'course' | 'meeting';
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Examen de mathématiques',
      date: '2024-01-25',
      type: 'exam',
    },
    {
      id: '2',
      title: 'Cours de programmation',
      date: '2024-01-26',
      type: 'course',
    },
    {
      id: '3',
      title: 'Réunion pédagogique',
      date: '2024-01-27',
      type: 'meeting',
    },
  ]);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const previousMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getEventForDay = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toISOString().split('T')[0];
    return events.find((event) => event.date === date);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5" />
          <span>Calendrier</span>
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium">
            {currentDate.toLocaleDateString('fr-FR', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {previousMonthDays.map((_, index) => (
          <div
            key={`prev-${index}`}
            className="h-24 p-1 text-center text-gray-400 dark:text-gray-600"
          ></div>
        ))}
        {days.map((day) => {
          const event = getEventForDay(day);
          return (
            <div
              key={day}
              className="h-24 p-1 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="text-right text-sm mb-1">{day}</div>
              {event && (
                <div
                  className={`text-xs p-1 rounded-md ${
                    event.type === 'exam'
                      ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                      : event.type === 'course'
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                      : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                  }`}
                >
                  {event.title}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}