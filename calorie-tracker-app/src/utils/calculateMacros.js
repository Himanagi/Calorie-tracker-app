export function calculateMacros({ weightKg, heightCm, age, gender, activityLevel, goal }) {
    let bmr = 0;
    if (gender === "male") {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }
  
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9,
    };
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);
  
    let calories = tdee;
    if (goal === "lose_weight") {
      calories -= 500;
    } else if (goal === "gain_weight") {
      calories += 500;
    }
  
    const proteinGrams = weightKg * 2.0;
    const fatGrams = (calories * 0.25) / 9;
    const carbsGrams = (calories - proteinGrams * 4 - fatGrams * 9) / 4;
  
    return {
      calories: Math.round(calories),
      protein: Math.round(proteinGrams),
      fat: Math.round(fatGrams),
      carbs: Math.round(carbsGrams),
    };
  }
  