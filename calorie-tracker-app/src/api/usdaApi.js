import { USDA_API_KEY } from "../config";

export async function searchFoods(query) {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch food search results");
  const data = await res.json();
  return data.foods;
}

export async function getFoodDetails(fdcId) {
    const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${USDA_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch food details");
    const data = await res.json();

    console.log("Nutrients:");
    data.foodNutrients.forEach(n => {
      console.log(n.nutrientName, n.value, n.unitName);
    });
    
    return data;
    
  }
  
  export function parseNutrients(foodData) {
    const nutrients = {};
  
    if (!foodData.foodNutrients) {
      console.warn("No foodNutrients found");
      return nutrients;
    }
  
    foodData.foodNutrients.forEach((item) => {
      // Defensive checks
      if (!item || !item.nutrient || !item.nutrient.name) {
        console.log("Skipping nutrient due to missing data:", item);
        return;
      }
  
      const name = item.nutrient.name.toLowerCase();
      const value = item.amount;
  
      if (value === null || value === undefined) {
        console.log("Skipping nutrient due to missing amount:", item);
        return;
      }
  
      if (name.includes("energy") || name.includes("calories")) {
        nutrients.calories = value;
      } else if (name.includes("protein")) {
        nutrients.protein = value;
      } else if (name.includes("carbohydrate")) {
        nutrients.carbs = value;
      } else if (name.includes("fiber") || name.includes("dietary fiber")) {
        nutrients.fiber = value;
      } else if (name.includes("fat") || name.includes("lipid")) {
        nutrients.fat = value;
      }
    });
  
    return nutrients;
  }
  