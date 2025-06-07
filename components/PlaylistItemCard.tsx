import React from 'react';
import { PlaylistItem } from '../types';

interface PlaylistItemCardProps {
  item: PlaylistItem;
  onPlay: (item: PlaylistItem) => void;
  onRemove: (itemId: string) => void;
}

const PlaylistItemCard: React.FC<PlaylistItemCardProps> = ({ item, onPlay, onRemove }) => {
  return (
    <li className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <img
        src={item.thumbnailUrl}
        alt={`Thumbnail for ${item.title}`}
        className="w-full sm:w-40 h-auto aspect-video object-cover rounded-lg shadow-md flex-shrink-0"
        onError={(e) => (e.currentTarget.src = 'https://picsum.photos/320/180?grayscale&blur=1')}
      />
      <div className="flex-grow min-w-0 text-center sm:text-left">
        <h3 className="text-lg font-semibold text-slate-800 truncate" title={item.title}>
          {item.title}
        </h3>
        <a
          href={item.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-sky-600 hover:underline truncate block"
          title={`Watch "${item.title}" on YouTube`}
        >
          {item.youtubeUrl}
        </a>
      </div>
      <div className="flex flex-shrink-0 space-x-2 mt-3 sm:mt-0">
        <button
          onClick={() => onPlay(item)}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 flex items-center"
          aria-label={`Play video: ${item.title}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1.5">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
          Play
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105"
          aria-label={`Remove video: ${item.title} from playlist`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c-.34-.059-.68-.114-1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
    </li>
  );
};

export default PlaylistItemCard;
