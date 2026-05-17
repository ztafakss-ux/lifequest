export interface WorkoutSet {
  id: string;
  weight?: number;
  reps?: number;
  duration?: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup?: string;
  sets: WorkoutSet[];
  notes?: string;
  order: number;
}

export interface Workout {
  id: string;
  userId: string;
  title: string;
  notes?: string;
  duration?: number;
  date: string;
  xpEarned: number;
  goldEarned: number;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup?: string;
  equipment?: string;
}

export interface RoutineExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps?: number;
  weight?: number;
  notes?: string;
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description?: string;
  exercises: RoutineExercise[];
  targetDays: string[];
  estimatedDuration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseProgress {
  date: string;
  maxWeight: number;
  totalVolume: number;
  sets: WorkoutSet[];
}
