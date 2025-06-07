
import React from 'react';
import { ExerciseLog } from '../types';
import { formatDateISO, getDaysInMonth, getMonthName, getDayShortName, isSameDay } from '../utils/dateUtils';

interface CalendarViewProps {
  currentDisplayDate: Date;
  logs: ExerciseLog[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (newDate: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ currentDisplayDate, logs, onDateSelect, onMonthChange }) => {
  const year = currentDisplayDate.getFullYear();
  const month = currentDisplayDate.getMonth(); // 0-11

  const daysInCurrentMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
  
  const dayNames = Array.from({ length: 7 }, (_, i) => getDayShortName((i + 0) % 7)); // Adjust if week starts Monday

  const today = new Date();

  const loggedDatesInMonth = new Set(
    logs
      .filter(log => {
        const logDate = new Date(log.loggedDate + 'T00:00:00'); // Ensure local timezone interpretation
        return logDate.getFullYear() === year && logDate.getMonth() === month;
      })
      .map(log => new Date(log.loggedDate + 'T00:00:00').getDate())
  );

  const handlePrevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={handlePrevMonth} 
          className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-sky-600"
          aria-label="Previous month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-2xl font-semibold text-slate-700 font-poppins">
          {getMonthName(month)} {year}
        </h2>
        <button 
          onClick={handleNextMonth} 
          className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-sky-600"
          aria-label="Next month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-slate-500 mb-2">
        {dayNames.map(dayName => <div key={dayName}>{dayName}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-prev-${index}`} className="p-2"></div>
        ))}
        {daysInCurrentMonth.map(dayDate => {
          const day = dayDate.getDate();
          const isToday = isSameDay(dayDate, today);
          const hasLog = loggedDatesInMonth.has(day);
          
          let cellClasses = "p-2 h-14 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 ease-in-out ";
          if (isToday) {
            cellClasses += "bg-sky-100 text-sky-700 font-bold ";
          } else {
            cellClasses += "hover:bg-slate-100 ";
          }
          if (hasLog) {
            cellClasses += "bg-green-400 text-white font-semibold hover:bg-green-500 ";
            if(isToday) cellClasses += " ring-2 ring-sky-500 ring-offset-1";
          } else if (isToday) {
             // Already handled
          }
           else {
            cellClasses += "text-slate-700 ";
          }

          return (
            <div 
              key={day} 
              className={cellClasses.trim()}
              onClick={() => onDateSelect(dayDate)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onDateSelect(dayDate);}}
              aria-label={`Date ${day}, ${hasLog ? 'has logs' : 'no logs'}`}
            >
              {day}
            </div>
          );
        })}
         {Array.from({ length: (7 - (firstDayOfMonth + daysInCurrentMonth.length) % 7) % 7 }).map((_, index) => (
          <div key={`empty-next-${index}`} className="p-2"></div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
