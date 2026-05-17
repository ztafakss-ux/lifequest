export interface JournalEntry {
  id: string;
  userId: string;
  title?: string;
  content: string;
  mood?: number;
  date: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JournalStreak {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate?: string;
}
