
import React from 'react';
import { ExerciseLog } from '../types';
import VideoCard from './VideoCard';
import Modal from './Modal'; // Reusable Modal component

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  logs: ExerciseLog[];
  onDeleteLog: (logId: string) => void;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({ isOpen, onClose, date, logs, onDeleteLog }) => {
  if (!isOpen || !date) return null;

  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const dailyLogs = logs.filter(log => {
    // Ensure date comparison is accurate, ignoring time parts.
    // Dates from logs are YYYY-MM-DD strings. Convert `date` prop to same format for comparison.
    const logDateObj = new Date(log.loggedDate + "T00:00:00"); // Use T00:00:00 for consistent comparison
    const selectedDateObj = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return logDateObj.getTime() === selectedDateObj.getTime();
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Workouts for ${formattedDate}`}>
      {dailyLogs.length > 0 ? (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
          {dailyLogs.map(log => (
            <VideoCard key={log.id} log={log} onDelete={onDeleteLog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-slate-300 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-500 text-lg">No workouts logged for this day.</p>
          <p className="text-slate-400 text-sm mt-1">Why not add one now?</p>
        </div>
      )}
    </Modal>
  );
};

export default DayDetailModal;
    