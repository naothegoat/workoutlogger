import React, { useState } from 'react';
import { PlaylistItem } from '../types';
import { extractYouTubeVideoId, fetchYouTubeVideoInfo } from '../utils/youtubeUtils';
import PlaylistItemCard from './PlaylistItemCard';

interface PlaylistViewProps {
  playlistItems: PlaylistItem[];
  onAddItem: (itemData: { videoUrl: string; videoId: string; title: string; thumbnailUrl: string }) => void;
  onRemoveItem: (itemId: string) => void;
  onPlayItem: (item: PlaylistItem) => void;
}

const PlaylistView: React.FC<PlaylistViewProps> = ({ playlistItems, onAddItem, onRemoveItem, onPlayItem }) => {
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newVideoUrl.trim()) {
      setError('Please enter a YouTube video URL.');
      return;
    }

    const videoId = extractYouTubeVideoId(newVideoUrl);
    if (!videoId) {
      setError('Invalid YouTube URL or could not extract Video ID.');
      return;
    }
    
    // Check if video already exists in playlist
    if (playlistItems.some(item => item.videoId === videoId)) {
        setError('This video is already in your playlist.');
        setNewVideoUrl('');
        return;
    }

    setIsAdding(true);
    try {
      const videoInfo = await fetchYouTubeVideoInfo(newVideoUrl);
      if (videoInfo) {
        onAddItem({
          videoUrl: newVideoUrl, // Store original URL for consistency or use a canonical one
          videoId: videoInfo.videoId,
          title: videoInfo.title,
          thumbnailUrl: videoInfo.thumbnailUrl,
        });
        setNewVideoUrl('');
      } else {
        setError('Could not fetch video information. Please check the URL.');
      }
    } catch (err) {
      console.error("Error adding video to playlist:", err);
      setError('An error occurred while adding the video.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleAddVideo} className="bg-white p-6 rounded-xl shadow-xl space-y-4">
        <h2 className="text-2xl font-semibold text-slate-700 font-poppins mb-1">Add to Playlist</h2>
        <p className="text-sm text-slate-500 mb-4">Add your favorite YouTube workout videos here for quick access.</p>
        <div>
          <label htmlFor="newVideoUrl" className="block text-sm font-medium text-slate-700 mb-1">
            YouTube Video URL
          </label>
          <div className="flex space-x-2">
            <input
              type="url"
              id="newVideoUrl"
              value={newVideoUrl}
              onChange={(e) => { setNewVideoUrl(e.target.value); setError(null);}}
              placeholder="e.g., https://www.youtube.com/watch?v=VIDEO_ID"
              required
              className="flex-grow w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
            />
            <button
              type="submit"
              disabled={isAdding}
              className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
            >
              {isAdding ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1.5">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
              )}
              {isAdding ? 'Adding...' : 'Add'}
            </button>
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      </form>

      {playlistItems.length > 0 ? (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-700 font-poppins mb-6">Your Playlist</h2>
            <ul className="space-y-4">
            {playlistItems.map(item => (
                <PlaylistItemCard
                key={item.id}
                item={item}
                onPlay={onPlayItem}
                onRemove={onRemoveItem}
                />
            ))}
            </ul>
        </div>
      ) : (
         !isAdding && ( // Don't show "empty" message while an item is being added initially.
            <div className="text-center py-10 bg-white rounded-xl shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-slate-300 mx-auto mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5M3 3h2.25M3 7.5h2.25M3 12h2.25m15-7.5l-7.5 7.5 7.5 7.5M21 3h-2.25m2.25 4.5h-2.25m2.25 4.5h-2.25" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5h7.5v9h-7.5z" />
                </svg>
                <p className="text-slate-500 text-xl">Your playlist is empty.</p>
                <p className="text-slate-400 mt-1">Add some YouTube videos above to get started!</p>
            </div>
         )
      )}
    </div>
  );
};

export default PlaylistView;
