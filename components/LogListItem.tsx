
import React from 'react';
import { ExerciseLog } from '../types';
import { getYouTubeThumbnailUrl } from '../utils/youtubeUtils';

interface LogListItemProps {
  log: ExerciseLog;
  onDeleteLog: (id: string) => void;
}

const LogListItem: React.FC<LogListItemProps> = ({ log, onDeleteLog }) => {
  const logDate = new Date(log.loggedDate + "T00:00:00"); // Ensure consistent date parsing for local timezone
  const formattedDate = logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // e.g., "Aug 23"

  return (
    <li className="flex items-start sm:items-center space-x-3 sm:space-x-4 p-3 bg-slate-50/50 rounded-lg shadow-sm hover:shadow-md transition-shadow group border border-transparent hover:border-slate-200">
      <a 
        href={log.youtubeUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex-shrink-0 block"
        aria-label={`Watch video: ${log.title || 'YouTube Video'}`}
      >
        <img 
          src={getYouTubeThumbnailUrl(log.videoId, 'mqdefault')} // mqdefault is 320x180, good for lists
          alt={`Thumbnail for ${log.title || 'video'}`} 
          className="w-24 h-auto aspect-video object-cover rounded shadow-sm transition-transform group-hover:scale-105"
          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/320/180?grayscale&blur=1')} // Fallback
        />
      </a>
      <div className="flex-grow min-w-0"> {/* min-w-0 for proper truncation */}
        <a 
          href={log.youtubeUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-base font-medium text-sky-700 hover:text-sky-600 hover:underline block leading-tight"
          title={log.title || 'Watch on YouTube'}
        >
          <span className="block truncate sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg">{log.title || 'YouTube Video'}</span>
        </a>
        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 mr-1 text-slate-400">
              <path fillRule="evenodd" d="M4 1.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V2.5A.75.75 0 0 1 4 1.75ZM3.25 5.5A.75.75 0 0 0 4 6.25h8A.75.75 0 0 0 12 5.5H4a.75.75 0 0 0-.75-.75ZM11.25 1.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V2.5a.75.75 0 0 1 .75-.75ZM2 5.25A2.25 2.25 0 0 1 4.25 3h7.5A2.25 2.25 0 0 1 14 5.25v5.5A2.25 2.25 0 0 1 11.75 13h-7.5A2.25 2.25 0 0 1 2 10.75v-5.5ZM4.25 4.5a.75.75 0 0 0-.75.75v5.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75v-5.5a.75.75 0 0 0-.75-.75h-7.5Z" clipRule="evenodd" />
            </svg>
            {formattedDate}
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 mr-1 text-slate-400">
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Zm7-3.75A.75.75 0 0 0 7.75 5v2.5H5.25a.75.75 0 0 0 0 1.5h3.25A.75.75 0 0 0 9.25 8V5a.75.75 0 0 0-.75-.75Z" />
            </svg>
            {log.durationMinutes} min
          </span>
        </div>
      </div>
      <button 
        onClick={() => onDeleteLog(log.id)} // The confirm dialog is in App.tsx's handleDeleteLog
        className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100 transition-colors flex-shrink-0 self-start sm:self-center"
        aria-label={`Delete log for ${log.title || 'video'} on ${formattedDate}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c-.34-.059-.68-.114-1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </button>
    </li>
  );
};

export default LogListItem;
