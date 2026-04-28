export type GenerationStatus = "pending" | "processing" | "done" | "failed";

export type AudioFormat = "mp3" | "wav" | "flac";

export type MusicGenre =
  | "electronic"
  | "classical"
  | "jazz"
  | "rock"
  | "hiphop"
  | "ambient"
  | "pop"
  | "other";

export interface GenerationRequest {
  prompt: string;
  duration: number;        // secondes, max 120
  genre?: MusicGenre;
  bpm?: number;            // 60–200
  format?: AudioFormat;
  stems?: boolean;         // plan Studio uniquement
}

export interface Generation {
  id: string;
  userId: string;
  prompt: string;
  duration: number;
  genre: MusicGenre | null;
  bpm: number | null;
  format: AudioFormat;
  stems: boolean;
  status: GenerationStatus;
  audioUrl: string | null;
  stemUrls: Record<string, string> | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}
