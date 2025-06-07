import React, { useState, useEffect, useCallback } from 'react';
import { ExerciseLog, PlaylistItem } from './types';
import { LOCAL_STORAGE_KEY_LOGS, LOCAL_STORAGE_KEY_LAST_REMINDER, LOCAL_STORAGE_KEY_PLAYLIST } from './constants';
import useLocalStorage from './hooks/useLocalStorage';

import CalendarView from './components/CalendarView';
import LogListView from './components/LogListView';
import PlaylistView from './components/PlaylistView'; // New
import LogEntryForm from './components/LogEntryForm';
import DayDetailModal from './components/DayDetailModal';
import Modal from './components/Modal';
import YouTubePlayerModal from './components/YouTubePlayerModal'; // New

import { getYouTubeThumbnailUrl, fetchYouTubeVideoInfo } from './utils/youtubeUtils';
import { getDaysDifference, formatDateISO } from './utils/dateUtils';


type ViewMode = 'calendar' | 'list' | 'playlist'; // Added 'playlist'

const App: React.FC = () => {
  const [logs, setLogs] = useLocalStorage<ExerciseLog[]>(LOCAL_STORAGE_KEY_LOGS, []);
  const [playlistItems, setPlaylistItems] = useLocalStorage<PlaylistItem[]>(LOCAL_STORAGE_KEY_PLAYLIST, []);
  const [lastReminderTimestamp, setLastReminderTimestamp] = useLocalStorage<number | null>(LOCAL_STORAGE_KEY_LAST_REMINDER, null);
  
  const [currentDisplayDate, setCurrentDisplayDate] = useState<Date>(new Date());
  const [selectedDateForDetail, setSelectedDateForDetail] = useState<Date | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formInitialDate, setFormInitialDate] = useState<Date>(new Date());
  
  const [viewMode, setViewMode] = useState<ViewMode>('calendar'); 

  // Playlist Player Modal State
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState<boolean>(false);
  const [currentVideoForPlayer, setCurrentVideoForPlayer] = useState<PlaylistItem | null>(null);


  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log("This browser does not support desktop notification");
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  const showReminderNotification = useCallback(() => {
    new Notification("Don't forget your workout!", {
      body: "It's been a little while. Let's get moving today!",
      icon: 'https://picsum.photos/seed/%EC%9A%B4%EB%8F%99/128/128', 
    });
  }, []);

  const checkAndSendReminder = useCallback(() => {
    if (logs.length === 0) return;
    const sortedLogs = [...logs].sort((a, b) => new Date(b.loggedDate).getTime() - new Date(a.loggedDate).getTime());
    const mostRecentLogDate = new Date(sortedLogs[0].loggedDate + "T00:00:00");
    const today = new Date();
    today.setHours(0,0,0,0); 

    const daysSinceLastLog = getDaysDifference(today, mostRecentLogDate);

    if (daysSinceLastLog >= 2) { 
      const now = Date.now();
      if (!lastReminderTimestamp || (now - lastReminderTimestamp > 20 * 60 * 60 * 1000)) {
        requestNotificationPermission().then(granted => {
          if (granted) {
            showReminderNotification();
            setLastReminderTimestamp(now);
          }
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, lastReminderTimestamp]); // Removed setters from deps as per lint suggestion

  useEffect(() => {
    requestNotificationPermission(); 
    checkAndSendReminder();
    const intervalId = setInterval(checkAndSendReminder, 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkAndSendReminder]); // checkAndSendReminder is now stable

  const handleAddLog = (newLogData: Omit<ExerciseLog, 'id' | 'thumbnailUrl'>) => {
    if (!newLogData.videoId) {
        alert("Could not extract video ID. Please check the URL.");
        return;
    }
    const newLog: ExerciseLog = {
      ...newLogData,
      id: crypto.randomUUID(),
      thumbnailUrl: getYouTubeThumbnailUrl(newLogData.videoId), // Already part of newLogData if from player
    };
    setLogs(prevLogs => [...prevLogs, newLog].sort((a, b) => new Date(b.loggedDate).getTime() - new Date(a.loggedDate).getTime()));
    setIsFormModalOpen(false); // Close manual form if open
    checkAndSendReminder(); 
  };

  const handleDeleteLog = (logId: string) => {
    if(window.confirm("Are you sure you want to delete this log?")) {
      setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
    }
  };

  const handleDateSelectInCalendar = (date: Date) => {
    setSelectedDateForDetail(date);
  };

  const handleMonthChange = (newDate: Date) => {
    setCurrentDisplayDate(newDate);
  };
  
  const openFormModalForToday = () => {
    setFormInitialDate(new Date());
    setIsFormModalOpen(true);
  };

  // --- Playlist Handlers ---
  const handleAddPlaylistItem = (itemData: { videoUrl: string; videoId: string; title: string; thumbnailUrl: string }) => {
    const newItem: PlaylistItem = {
      id: crypto.randomUUID(),
      youtubeUrl: itemData.videoUrl,
      videoId: itemData.videoId,
      title: itemData.title,
      thumbnailUrl: itemData.thumbnailUrl,
      addedDate: new Date().toISOString(),
    };
    setPlaylistItems(prev => [newItem, ...prev]);
  };

  const handleRemovePlaylistItem = (itemId: string) => {
    if (window.confirm("Are you sure you want to remove this video from your playlist?")) {
      setPlaylistItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handlePlayVideoFromPlaylist = (item: PlaylistItem) => {
    setCurrentVideoForPlayer(item);
    setIsPlayerModalOpen(true);
  };

  const handleLogWorkoutFromPlayer = (details: { videoId: string; youtubeUrl: string; title: string; durationMinutes: number; thumbnailUrl: string }) => {
    const newLog: Omit<ExerciseLog, 'id'> = {
        youtubeUrl: details.youtubeUrl,
        videoId: details.videoId,
        thumbnailUrl: details.thumbnailUrl, // Use thumbnail from playlist item (fetched via oEmbed)
        durationMinutes: details.durationMinutes,
        loggedDate: formatDateISO(new Date()), // Log for today
        title: details.title,
    };
    handleAddLog(newLog); // Reuse existing add log logic
    setIsPlayerModalOpen(false); // Player modal should close itself after logging
    setCurrentVideoForPlayer(null);
  };
  // --- End Playlist Handlers ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 flex flex-col items-center">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-sky-700 mb-3 font-poppins">
          Workouts <span className="text-sky-500">Logger</span>
        </h1>
        <p className="text-slate-600 text-lg">Track your YouTube workouts and build a consistent habit.</p>
      </header>

      <main className="w-full max-w-4xl space-y-8">
        {logs.length === 0 && viewMode !== 'playlist' ? ( // Show global empty state only if not on playlist and logs are empty
          <div className="text-center py-10 bg-white rounded-xl shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-slate-300 mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 3.75h16.5M3.75 17.25h16.5M4.5 12a7.5 7.5 0 0115 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m0 0V9m0 3.75V9m0-3.75h.008v.008H12V5.25z" />
            </svg>
            <p className="text-slate-500 text-xl">Your workout log is empty.</p>
            <p className="text-slate-400 mt-1">Click "Log New Workout" below or add videos to your Playlist!</p>
          </div>
        ) : (
          <>
            {/* View Toggle Buttons */}
            <div className="flex justify-center mb-6 space-x-1 p-1 bg-slate-200 rounded-lg max-w-md mx-auto">
              {[
                { mode: 'calendar', label: 'Calendar', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5M12 12.75h.008v.008H12v-.008z" /> },
                { mode: 'list', label: 'List', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /> },
                { mode: 'playlist', label: 'Playlist', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /> } , // Simpler list icon for playlist
              ].map(vm => (
                <button
                  key={vm.mode}
                  onClick={() => setViewMode(vm.mode as ViewMode)}
                  className={`flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-medium transition-colors w-1/3
                    ${viewMode === vm.mode ? 'bg-white text-sky-600 shadow-md' : 'text-slate-600 hover:bg-slate-300/70'}`}
                  aria-pressed={viewMode === vm.mode}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    {vm.icon}
                  </svg>
                  {vm.label}
                </button>
              ))}
            </div>

            {viewMode === 'calendar' && (
              <CalendarView 
                currentDisplayDate={currentDisplayDate}
                logs={logs}
                onDateSelect={handleDateSelectInCalendar}
                onMonthChange={handleMonthChange}
              />
            )}
            {viewMode === 'list' && logs.length > 0 && <LogListView logs={logs} onDeleteLog={handleDeleteLog} />}
            {viewMode === 'list' && logs.length === 0 && (
                 <div className="text-center py-10 bg-white rounded-xl shadow-md">
                     <p className="text-slate-500 text-xl">No workouts logged yet to display in list view.</p>
                 </div>
            )}
            {viewMode === 'playlist' && (
              <PlaylistView 
                playlistItems={playlistItems}
                onAddItem={handleAddPlaylistItem}
                onRemoveItem={handleRemovePlaylistItem}
                onPlayItem={handlePlayVideoFromPlaylist}
              />
            )}
          </>
        )}
        
        {/* Only show "Log New Workout" button if not in playlist view, or if playlist is empty? Or always show it? 
            For now, always show it as it's a primary action. */}
        <div className="text-center pt-4"> 
          <button
            onClick={openFormModalForToday}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-300 font-poppins"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 inline-block mr-2 -mt-1">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Log New Workout (Manual)
          </button>
        </div>

      </main>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Log New Workout Session"
      >
        <LogEntryForm 
          onSubmit={handleAddLog} 
          onClose={() => setIsFormModalOpen(false)}
          initialDate={formInitialDate}
        />
      </Modal>

      <DayDetailModal
        isOpen={selectedDateForDetail !== null}
        onClose={() => setSelectedDateForDetail(null)}
        date={selectedDateForDetail}
        logs={logs}
        onDeleteLog={handleDeleteLog}
      />

      <YouTubePlayerModal
        isOpen={isPlayerModalOpen}
        onClose={() => {
            setIsPlayerModalOpen(false);
            // setCurrentVideoForPlayer(null); // Keep video for potential re-open if log prompt is shown. Player modal handles its own state.
        }}
        videoItem={currentVideoForPlayer}
        onLogWorkout={handleLogWorkoutFromPlayer}
      />
      
      <footer className="mt-16 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Workouts Logger. Keep pushing your limits!</p>
      </footer>
    </div>
  );
};

export default App;