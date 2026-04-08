type MealEntryInput = {
  id?: string;
  title?: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
};

export class SaveNutritionDayDto {
  meals: MealEntryInput[] = [];
}
