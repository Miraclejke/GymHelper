type WorkoutSetInput = {
  id?: string;
  weight?: number;
  reps?: number;
};

type WorkoutExerciseInput = {
  id?: string;
  name?: string;
  sets?: WorkoutSetInput[];
};

export class SaveWorkoutDayDto {
  exercises: WorkoutExerciseInput[] = [];
}
