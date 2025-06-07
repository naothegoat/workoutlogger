
import React, { useState, useEffect } from 'react';
import { ExerciseLog } from '../types';
import { extractYouTubeVideoId } from '../utils/youtubeUtils';
import { formatDateISO } from '../utils/dateUtils';

interface LogEntryFormProps {
  onSubmit: (log: Omit<ExerciseLog, 'id' | 'thumbnailUrl' | 'videoId'> & { videoId: string | null }) => void;
  onClose: () => void;
  initialDate?: Date;
}

const LogEntryForm: React.FC<LogEntryFormProps> = ({ onSubmit, onClose, initialDate }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | string>('');
  const [loggedDate, setLoggedDate] = useState<string>(formatDateISO(initialDate || new Date()));
  const [title, setTitle] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (initialDate) {
      setLoggedDate(formatDateISO(initialDate));
    }
  }, [initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      setUrlError('Invalid YouTube URL. Please check and try again.');
      return;
    }
    setUrlError(null);

    const duration = typeof durationMinutes === 'string' ? parseInt(durationMinutes, 10) : durationMinutes;
    if (isNaN(duration) || duration <= 0) {
        alert('Please enter a valid duration greater than 0.');
        return;
    }

    onSubmit({
      youtubeUrl,
      durationMinutes: duration,
      loggedDate,
      videoId,
      title: title || `Video from ${loggedDate}`,
    });
    onClose(); // Close form on successful submit
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="youtubeUrl" className="block text-sm font-medium text-slate-700 mb-1">
          YouTube Video URL
        </label>
        <input
          type="url"
          id="youtubeUrl"
          value={youtubeUrl}
          onChange={(e) => { setYoutubeUrl(e.target.value); setUrlError(null); }}
          required
          className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
          placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        />
        {urlError && <p className="text-sm text-red-600 mt-1">{urlError}</p>}
      </div>
      <div>
        <label htmlFor="durationMinutes" className="block text-sm font-medium text-slate-700 mb-1">
          Duration (minutes)
        </label>
        <input
          type="number"
          id="durationMinutes"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10)))}
          required
          min="1"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
          placeholder="e.g., 30"
        />
      </div>
      <div>
        <label htmlFor="loggedDate" className="block text-sm font-medium text-slate-700 mb-1">
          Date of Workout
        </label>
        <input
          type="date"
          id="loggedDate"
          value={loggedDate}
          onChange={(e) => setLoggedDate(e.target.value)}
          required
          className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
        />
      </div>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
          Custom Title (Optional)
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
          placeholder="e.g., Morning Yoga Flow"
        />
      </div>
      <button 
        type="submit" 
        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 font-poppins"
      >
        Add Exercise Log
      </button>
    </form>
  );
};

export default LogEntryForm;
