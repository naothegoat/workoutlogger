import React, { useEffect, useState, useRef, useCallback } from 'react';
import { PlaylistItem } from '../types';
import Modal from './Modal'; // Assuming Modal is a generic modal component

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

interface YouTubePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoItem: PlaylistItem | null;
  onLogWorkout: (details: { videoId: string; youtubeUrl: string; title: string; durationMinutes: number; thumbnailUrl: string }) => void;
}

const YouTubePlayerModal: React.FC<YouTubePlayerModalProps> = ({ isOpen, onClose, videoItem, onLogWorkout }) => {
  const playerRef = useRef<any>(null); // To store YT.Player instance
  const [playerReady, setPlayerReady] = useState(false);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackTimerRef = useRef<number | null>(null);
  const [showLogPrompt, setShowLogPrompt] = useState(false);
  const lastPlayerStateRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    playbackTimerRef.current = window.setInterval(() => {
      setWatchedSeconds(prev => prev + 1);
    }, 1000);
  }, [clearTimer]);


  const onPlayerStateChange = useCallback((event: any) => {
    lastPlayerStateRef.current = event.data;
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startTimer();
    } else {
      setIsPlaying(false);
      clearTimer();
      if (event.data === window.YT.PlayerState.ENDED) {
        setShowLogPrompt(true);
      }
    }
  }, [startTimer, clearTimer]);
  
  const onPlayerReady = useCallback((event: any) => {
    setPlayerReady(true);
    event.target.playVideo();
  }, []);

  const destroyPlayer = useCallback(() => {
    clearTimer();
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      playerRef.current.destroy();
    }
    playerRef.current = null;
    setPlayerReady(false);
    setIsPlaying(false);
    // Watched seconds reset when a new video is loaded or modal reopens for new video.
    // If modal simply closes and reopens for SAME video, we might want to persist, but for now reset.
  }, [clearTimer]);

  useEffect(() => {
    if (isOpen && videoItem) {
        // Reset state for new video
        setWatchedSeconds(0); 
        setShowLogPrompt(false);
        lastPlayerStateRef.current = null;

      if (typeof window.YT === 'undefined' || typeof window.YT.Player === 'undefined') {
        // API not loaded yet, wait for it.
        // This case should be rare if script is in index.html and loads first.
        // Or, handle loading YT API script dynamically here if preferred.
        console.warn("YouTube API not ready when modal opened.");
        // We could implement a retry or listen for onYouTubeIframeAPIReady more actively here
        return;
      }

      if (!playerRef.current) { // Only create if it doesn't exist or was destroyed
        playerRef.current = new window.YT.Player('youtube-player-embed', {
          videoId: videoItem.videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
          },
        });
      } else { // Player exists, just load new video
         if (playerRef.current.loadVideoById && playerRef.current.getPlayerState) {
            playerRef.current.loadVideoById(videoItem.videoId);
            // Player might be in a playing state from a previous video, ensure timer starts if autoplay works.
            // onPlayerStateChange should handle this.
         }
      }
    } else if (!isOpen) {
        // If modal is closing and video was playing/paused and not ended
        if (playerRef.current && watchedSeconds > 0 && lastPlayerStateRef.current !== window.YT?.PlayerState?.ENDED && !showLogPrompt) {
            setShowLogPrompt(true); // Offer to log if closed prematurely
            // Don't destroy player yet, let user interact with log prompt
            return; 
        }
        destroyPlayer(); // Destroy if not showing prompt or prompt already handled
        setWatchedSeconds(0); // Reset for next time
        setShowLogPrompt(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [isOpen, videoItem, onPlayerReady, onPlayerStateChange, destroyPlayer]); // `destroyPlayer` is stable

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      destroyPlayer();
    };
  }, [destroyPlayer]);


  const handleCloseModal = () => {
    if (isPlaying || (watchedSeconds > 0 && lastPlayerStateRef.current !== window.YT?.PlayerState?.ENDED && !showLogPrompt)) {
        setIsPlaying(false); // Stop playback if any
        if (playerRef.current && playerRef.current.pauseVideo) {
            playerRef.current.pauseVideo();
        }
        clearTimer();
        setShowLogPrompt(true); // Show log prompt before actually closing
    } else {
        // If prompt shown, or nothing to log, or prompt already handled
        onClose(); // This will trigger the useEffect cleanup for !isOpen
    }
  };

  const handleLog = () => {
    if (videoItem) {
      const durationMinutes = Math.max(1, Math.round(watchedSeconds / 60)); // Log at least 1 minute
      onLogWorkout({
        videoId: videoItem.videoId,
        youtubeUrl: videoItem.youtubeUrl,
        title: videoItem.title,
        durationMinutes: durationMinutes,
        thumbnailUrl: videoItem.thumbnailUrl,
      });
    }
    setShowLogPrompt(false);
    onClose(); // Close modal after logging
  };

  const handleDontLog = () => {
    setShowLogPrompt(false);
    onClose(); // Close modal without logging
  };

  if (!isOpen || !videoItem) return null;

  const watchedDurationFormatted = () => {
    const minutes = Math.floor(watchedSeconds / 60);
    const seconds = watchedSeconds % 60;
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}${seconds > 0 ? ` and ${seconds} second${seconds > 1 ? 's' : ''}`: ''}`;
    }
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title={videoItem.title || 'Workout Video'}>
      <div className="aspect-video bg-black rounded-lg mb-4">
        <div id="youtube-player-embed" className="w-full h-full">
            {!playerReady && <div className="w-full h-full flex items-center justify-center text-white"><p>Loading player...</p></div>}
        </div>
      </div>
      
      {showLogPrompt && (
        <div className="p-4 bg-slate-100 rounded-lg text-center">
          <p className="text-slate-700 font-medium mb-1">
            Session Complete!
          </p>
          <p className="text-slate-600 mb-4">
            You watched for {watchedDurationFormatted()}.
          </p>
          <div className="flex justify-center space-x-3">
            <button 
              onClick={handleLog}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              Log Workout
            </button>
            <button 
              onClick={handleDontLog}
              className="px-6 py-2 bg-slate-300 hover:bg-slate-400 text-slate-700 font-semibold rounded-lg shadow-md transition-colors"
            >
              Don't Log
            </button>
          </div>
        </div>
      )}

      {!showLogPrompt && watchedSeconds > 0 && (
         <div className="text-center text-sm text-slate-500 mt-2">
            Watched: {watchedDurationFormatted()}
        </div>
      )}
    </Modal>
  );
};

export default YouTubePlayerModal;
