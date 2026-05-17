export interface ImportantDate {
  id: string;
  label: string;
  date: string;
  isRecurring: boolean;
  emoji?: string;
}

export interface Relationship {
  id: string;
  userId: string;
  name: string;
  type: string;
  isPartner: boolean;
  importantDates: ImportantDate[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoveDashboard {
  relationship: Relationship | null;
  nextImportantDate: (ImportantDate & { daysUntil: number; relationshipId: string }) | null;
  timeTogetherText?: string;
}
