export type LearningType = 'BOOK' | 'COURSE' | 'PODCAST' | 'VIDEO' | 'LANGUAGE';
export type LearningStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export interface LearningItem {
  id: string;
  userId: string;
  type: LearningType;
  title: string;
  author?: string;
  platform?: string;
  status: LearningStatus;
  currentProgress: number;
  totalProgress: number;
  rating?: number;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningStats {
  totalCompleted: number;
  inProgress: number;
  totalPages: number;
  readingStreak: number;
  completedThisYear: number;
}
