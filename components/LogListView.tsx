
import React from 'react';
import { ExerciseLog } from '../types';
import LogListItem from './LogListItem';

interface LogListViewProps {
  logs: ExerciseLog[];
  onDeleteLog: (id: string) => void;
}

const groupLogsByMonth = (logs: ExerciseLog[]): Array<{ monthYear: string; logs: ExerciseLog[] }> => {
  // Ensure logs are sorted by date descending for correct grouping and intra-month order
  const sortedLogs = [...logs].sort((a, b) => {
    const dateA = new Date(a.loggedDate + "T00:00:00"); // Ensure consistent date parsing
    const dateB = new Date(b.loggedDate + "T00:00:00");
    return dateB.getTime() - dateA.getTime();
  });

  const grouped: Record<string, ExerciseLog[]> = {};

  sortedLogs.forEach(log => {
    const date = new Date(log.loggedDate + "T00:00:00");
    const month = date.toLocaleString('en-US', { month: 'long' }); // e.g., "August"
    const year = date.getFullYear();
    const monthYearKey = `${month} ${year}`; // e.g., "August 2024"

    if (!grouped[monthYearKey]) {
      grouped[monthYearKey] = [];
    }
    grouped[monthYearKey].push(log); // Logs within month are already sorted due to initial sort
  });

  // Convert to array and sort months chronologically (most recent month first)
  return Object.entries(grouped)
    .map(([monthYear, logsInMonth]) => ({
      monthYear,
      logs: logsInMonth,
    }))
    .sort((a, b) => {
      // Create Date objects from "Month YYYY" strings for robust sorting
      const dateA = new Date(`01 ${a.monthYear}`); // e.g., "01 August 2024"
      const dateB = new Date(`01 ${b.monthYear}`);
      return dateB.getTime() - dateA.getTime(); // Descending order for months
    });
};

const LogListView: React.FC<LogListViewProps> = ({ logs, onDeleteLog }) => {
  const groupedLogs = groupLogsByMonth(logs);

  // The global empty state (if logs.length === 0) is handled in App.tsx
  // This component assumes it receives logs if it's rendered.
  // If groupedLogs is empty but logs wasn't, it means an issue in grouping,
  // but that shouldn't happen with current logic.

  return (
    <div className="space-y-8 bg-white p-4 sm:p-6 rounded-xl shadow-xl">
      {groupedLogs.map(({ monthYear, logs: monthLogs }) => (
        <section key={monthYear} aria-labelledby={`month-header-${monthYear.replace(/\s+/g, '-')}`}>
          <h2 
            id={`month-header-${monthYear.replace(/\s+/g, '-')}`}
            className="text-2xl font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200 font-poppins"
          >
            {monthYear}
          </h2>
          {monthLogs.length > 0 ? (
            <ul className="space-y-3">
              {monthLogs.map(log => (
                <LogListItem key={log.id} log={log} onDeleteLog={onDeleteLog} />
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic">No workouts logged for this month.</p> 
          )}
        </section>
      ))}
    </div>
  );
};

export default LogListView;
