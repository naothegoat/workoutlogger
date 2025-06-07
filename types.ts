export interface ExerciseLog {
  id: string;
  youtubeUrl: string;
  videoId: string;
  thumbnailUrl: string;
  durationMinutes: number;
  loggedDate: string; // YYYY-MM-DD format
  title?: string; // Optional: title extracted from video or manually entered
}

export interface PlaylistItem {
  id: string;
  youtubeUrl: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  addedDate: string; // ISO string
}
