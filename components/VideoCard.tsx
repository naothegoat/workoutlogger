
import React from 'react';
import { ExerciseLog } from '../types';

interface VideoCardProps {
  log: ExerciseLog;
  onDelete?: (id: string) => void; // Optional delete handler
}

const VideoCard: React.FC<VideoCardProps> = ({ log, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl transform hover:-translate-y-1 duration-300">
      <a href={log.youtubeUrl} target="_blank" rel="noopener noreferrer" className="block aspect-video overflow-hidden">
        <img 
          src={log.thumbnailUrl} 
          alt={log.title || 'Exercise video thumbnail'} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
        />
      </a>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-800 mb-1 truncate" title={log.title || 'YouTube Video'}>
          {log.title || 'YouTube Video'}
        </h3>
        <p className="text-sm text-sky-600 mb-2 truncate hover:underline">
          <a href={log.youtubeUrl} target="_blank" rel="noopener noreferrer" title={log.youtubeUrl}>
            Watch on YouTube
          </a>
        </p>
        <div className="flex justify-between items-center text-sm text-slate-600">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 inline-block mr-1 text-slate-400">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
            </svg>
            {log.durationMinutes} min
          </span>
          {onDelete && (
             <button 
                onClick={() => onDelete(log.id)} 
                className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-100 text-xs"
                aria-label="Delete log"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c-.34-.059-.68-.114-1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
    