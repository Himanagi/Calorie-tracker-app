import React, { useState } from "react";
import { searchFoods, getFoodDetails, parseNutrients } from "../../../api/usdaApi";
import { Timestamp } from "firebase/firestore";

export default function FoodInput({ onAddEntry, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [nutrients, setNutrients] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pink = "#fca5a5";
  const cream = "#fff8f2";

  const [unit, setUnit] = useState("");

  const handleSearch = async () => {
    setError("");
    if (!query) return;
    setLoading(true);
    try {
      const foods = await searchFoods(query);
      setResults(foods || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = async (food) => {
    setSelectedFood(food);
    setResults([]);
    setLoading(true);
    try {
      const details = await getFoodDetails(food.fdcId);
      const nutrients = parseNutrients(details);
      setNutrients(nutrients);
      setQuantity(1);
  
      // NEW: Extract serving size info and set the unit string
      const servingSize = details.servingSize;        // number, e.g. 100
      const servingUnit = details.servingSizeUnit;    // string, e.g. "g", "slice"
  
      let unitString = "";
      if (servingSize && servingUnit) {
        unitString = `${servingSize} ${servingUnit}`;
      } else if (servingUnit) {
        unitString = servingUnit;
      } else {
        unitString = "unit";
      }
  
      setUnit(unitString);  // Save the unit string to state
    } catch (err) {
      setError(err.message);
      setNutrients(null);
      setUnit(""); // clear unit if error
    } finally {
      setLoading(false);
    }
  };
  

  const handleAdd = async () => {
    if (!nutrients || quantity <= 0) return;

    const safeNutrients = {
      calories: nutrients.calories || 0,
      protein: nutrients.protein || 0,
      carbs: nutrients.carbs || 0,
      fiber: nutrients.fiber || 0,
      fat: nutrients.fat || 0,
    };

    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const entry = {
      foodName: selectedFood.description,
      quantity,
      nutrients: {
        calories: safeNutrients.calories * quantity,
        protein: safeNutrients.protein * quantity,
        carbs: safeNutrients.carbs * quantity,
        fiber: safeNutrients.fiber * quantity,
        fat: safeNutrients.fat * quantity,
      },
      type: "food",
      date: dateString,
      createdAt: Timestamp.fromDate(now),
    };

    try {
      await onAddEntry(entry);
      setQuery("");
      setSelectedFood(null);
      setNutrients(null);
      setQuantity(1);
      if (onClose) onClose();
    } catch (error) {
      console.error("Failed to add entry:", error);
      setError("Failed to add entry.");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
  style={{
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "14px",
    padding: "14px 16px",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    width: "100%",
    boxSizing: "border-box",  // add this so padding included inside width
  }}
  // ... rest of your handlers
>

        <div style={{ width: "100%" }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
  <input
    type="text"
    placeholder="Search food"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleSearch();
    }}
    style={{
      width: "100%",
      maxWidth: "100%",
      padding: "12px 16px",
      borderRadius: "12px",
      border: `2px solid ${pink}`,
      background: "#fff",
      fontSize: "16px",
      marginBottom: "12px",
      boxSizing: "border-box",
    }}
  />
</div>

          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              background: pink,
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "12px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              width: "100%",
            }}
          >
            Search
          </button>
  
          {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
  
          {results.length > 0 && (
        <ul
        style={{
          padding: 0,
          listStyle: "none",
          marginTop: 16,
          width: "100%",
          boxSizing: "border-box",
          display: "grid",
          placeItems: "center",     // centers both horizontally + vertically
          rowGap: 12,               // vertical spacing between items
        }}
      >
      
       
          
              {results.map((food) => (
                <li key={food.fdcId}>
                <div
                  onClick={() => handleSelectFood(food)}
                  style={{
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    width: "100%",
                    maxWidth: 360,             // constrain without hard centering issues
                    boxSizing: "border-box",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                  }}
                >
                  {food.description}
                </div>
              </li>
              
              ))}
            </ul>
          )}
  
          {selectedFood && nutrients && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 18, marginBottom: 6 }}>{selectedFood.description}</h3>
              <p style={{ marginBottom: 10 }}>Calories: {nutrients.calories || "N/A"}</p>
  
              <label style={{ fontSize: 14, marginBottom: 6, display: "block" }}>
  Quantity ({unit || "unit"}):
  <input
    type="number"
    min="0.1"
    step="0.1"
    value={quantity}
    onChange={(e) => {
      const val = parseFloat(e.target.value);
      setQuantity(isNaN(val) ? 1 : val);
    }}
    style={{
      marginLeft: 10,
      padding: "8px 12px",
      borderRadius: "10px",
      border: `2px solid ${pink}`,
      background: "#fff",
      fontSize: "14px",
      width: "100px",
    }}
  />
</label>

  
              <button
                onClick={handleAdd}
                style={{
                  marginTop: 12,
                  background: pink,
                  color: "#fff",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  width: "100%",
                }}
              >
                Add to Entries
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
}
