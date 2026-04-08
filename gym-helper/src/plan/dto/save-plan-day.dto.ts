type PlanExerciseInput = {
  id?: string;
  name?: string;
  note?: string;
};

export class SavePlanDayDto {
  exercises: PlanExerciseInput[] = [];
}
