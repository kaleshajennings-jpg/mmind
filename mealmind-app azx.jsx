import { useState, useEffect, useMemo } from "react";
import { MEAL_DB } from "./mealData (1).js";

const COLORS = {
  bg: "#0F0E17",
  card: "#1A1928",
  cardAlt: "#211F35",
  accent: "#FF6B35",
  accentSoft: "#FF8C5A",
  green: "#4ECDC4",
  yellow: "#FFE66D",
  purple: "#A855F7",
  text: "#FFFFFE",
  muted: "#94A3B8",
  border: "rgba(255,255,255,0.07)",
};

const CUISINE_OPTIONS = [
  { id: "italian", label: "🍝 Italian" },
  { id: "mexican", label: "🌮 Mexican" },
  { id: "caribbean", label: "🌴 Caribbean" },
  { id: "soul", label: "🍗 Soul Food" },
  { id: "asian", label: "🍜 Asian" },
  { id: "mediterranean", label: "🫒 Mediterranean" },
  { id: "american", label: "🍔 American" },
  { id: "indian", label: "🍛 Indian" },
];

const DIET_OPTIONS = [
  { id: "vegan", label: "🌱 Vegan" },
  { id: "vegetarian", label: "🥗 Vegetarian" },
  { id: "gluten-free", label: "🌾 Gluten-Free" },
  { id: "dairy-free", label: "🥛 Dairy-Free" },
  { id: "keto", label: "🥩 Keto" },
  { id: "paleo", label: "🦴 Paleo" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

const GROCERY_ITEMS = [
  "Avocados (4)", "Eggs (1 dozen)", "Chicken thighs (2 lbs)",
  "Salmon fillets (4)", "Black beans (2 cans)", "Pasta (1 lb)",
  "Quinoa (1 cup)", "Cherry tomatoes", "Baby spinach", "Greek yogurt",
  "Coconut milk", "Fresh ginger", "Garlic (1 head)", "Lime (3)",
  "Olive oil", "Cumin", "Paprika", "Soy sauce", "Jasmine rice",
];

function normalizeText(text = "") {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function parseIngredientTokens(text = "") {
  return normalizeText(text)
    .split(/\s+/)
    .filter(Boolean)
    .filter(token => token.length > 1);
}

function getFilteredMeals(type, { diets, cuisines, ingredients, timeLimit }) {
  const meals = MEAL_DB[type] || [];
  const ingredientTokens = parseIngredientTokens(ingredients);

  const filtered = meals.filter(meal => {
    const cuisine = meal.cuisine;
    const dietOk = diets.length === 0 || diets.every(d =>
      d === "vegetarian"
        ? meal.tags.includes("vegetarian") || meal.tags.includes("vegan")
        : meal.tags.includes(d)
    );
    const cuisineOk = cuisines.length === 0 || cuisines.includes(cuisine);
    const timeOk = meal.time <= timeLimit;
    return dietOk && cuisineOk && timeOk;
  });

  if (filtered.length === 0) {
    return meals.filter(meal => meal.time <= timeLimit);
  }

  if (ingredientTokens.length === 0) {
    return filtered;
  }

  const scored = filtered.map(meal => {
    const score = ingredientTokens.reduce((total, token) => {
      const containsName = normalizeText(meal.name).includes(token);
      const containsTag = meal.tags.some(tag => normalizeText(tag).includes(token));
      return total + (containsName || containsTag ? 1 : 0);
    }, 0);
    return { meal, score };
  });

  const maxScore = Math.max(...scored.map(item => item.score));
  const best = scored.filter(item => item.score === maxScore).map(item => item.meal);
  return best.length ? best : filtered;
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function generateMealPlan(settings = {}) {
  const { diets = [], cuisines = [], ingredients = "", timeLimit = 120 } = settings;
  return DAYS.reduce((plan, day) => {
    const breakfastPool = getFilteredMeals("breakfast", { diets, cuisines, ingredients, timeLimit });
    const lunchPool = getFilteredMeals("lunch", { diets, cuisines, ingredients, timeLimit });
    const dinnerPool = getFilteredMeals("dinner", { diets, cuisines, ingredients, timeLimit });

    plan[day] = {
      breakfast: randomFrom(breakfastPool.length ? breakfastPool : MEAL_DB.breakfast),
      lunch: randomFrom(lunchPool.length ? lunchPool : MEAL_DB.lunch),
      dinner: randomFrom(dinnerPool.length ? dinnerPool : MEAL_DB.dinner),
    };
    return plan;
  }, {});
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .app {
    font-family: 'DM Sans', sans-serif;
    background: ${COLORS.bg};
    color: ${COLORS.text};
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    position: relative;
    overflow-x: hidden;
  }

  h1, h2, h3 { font-family: 'Syne', sans-serif; }

  .status-bar {
    padding: 12px 20px 0;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: ${COLORS.muted};
  }

  .screen { padding: 0 0 100px; animation: fadeUp 0.4s ease; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .header {
    padding: 20px 20px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo { display: flex; align-items: center; gap: 8px; }
  .logo-icon {
    width: 36px; height: 36px;
    background: ${COLORS.accent};
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .logo-text { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }

  .avatar {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, ${COLORS.purple}, ${COLORS.accent});
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }

  .hero-section { padding: 8px 20px 20px; }
  .hero-greeting { color: ${COLORS.muted}; font-size: 14px; margin-bottom: 4px; }
  .hero-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; line-height: 1.2; }
  .hero-title span { color: ${COLORS.accent}; }

  .quick-stats {
    display: flex; gap: 10px;
    padding: 0 20px 20px;
  }
  .stat-chip {
    flex: 1;
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 14px;
    padding: 12px;
    text-align: center;
  }
  .stat-chip .val { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; }
  .stat-chip .lbl { font-size: 10px; color: ${COLORS.muted}; margin-top: 2px; }

  .section-header {
    padding: 0 20px;
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 12px;
  }
  .section-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; }
  .section-link { color: ${COLORS.accent}; font-size: 13px; cursor: pointer; }

  .day-scroll { display: flex; gap: 10px; padding: 0 20px 20px; overflow-x: auto; scrollbar-width: none; }
  .day-scroll::-webkit-scrollbar { display: none; }
  .day-chip {
    flex-shrink: 0;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid ${COLORS.border};
    background: ${COLORS.card};
    color: ${COLORS.muted};
  }
  .day-chip.active {
    background: ${COLORS.accent};
    border-color: ${COLORS.accent};
    color: white;
    font-weight: 600;
  }

  .meal-cards { padding: 0 20px; display: flex; flex-direction: column; gap: 12px; }
  .meal-card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 20px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }
  .meal-card:hover { border-color: rgba(255,107,53,0.3); transform: translateY(-1px); }
  .meal-card::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 4px;
    border-radius: 20px 0 0 20px;
  }
  .meal-card.breakfast::before { background: ${COLORS.yellow}; }
  .meal-card.lunch::before { background: ${COLORS.green}; }
  .meal-card.dinner::before { background: ${COLORS.accent}; }

  .meal-emoji-wrap {
    width: 52px; height: 52px;
    background: ${COLORS.cardAlt};
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
    flex-shrink: 0;
  }
  .meal-info { flex: 1; }
  .meal-type-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: ${COLORS.muted}; margin-bottom: 3px; }
  .meal-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; }
  .meal-meta { display: flex; gap: 10px; margin-top: 5px; }
  .meal-meta span { font-size: 11px; color: ${COLORS.muted}; }
  .meal-meta span strong { color: ${COLORS.text}; }

  .swap-btn {
    width: 32px; height: 32px;
    background: ${COLORS.cardAlt};
    border: none; border-radius: 10px;
    color: ${COLORS.muted};
    font-size: 16px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .swap-btn:hover { color: ${COLORS.accent}; }

  .surprise-btn {
    margin: 16px 20px 0;
    background: linear-gradient(135deg, ${COLORS.purple}, ${COLORS.accent});
    border: none;
    border-radius: 16px;
    padding: 16px;
    color: white;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    width: calc(100% - 40px);
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s;
  }
  .surprise-btn:hover { opacity: 0.9; transform: scale(1.01); }

  .bottom-nav {
    position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 100%; max-width: 430px;
    background: rgba(15,14,23,0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid ${COLORS.border};
    padding: 12px 0 20px;
    display: flex; justify-content: space-around;
    z-index: 100;
  }
  .nav-item {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    cursor: pointer;
    padding: 4px 16px;
    border-radius: 12px;
    transition: all 0.2s;
  }
  .nav-icon { font-size: 22px; }
  .nav-label { font-size: 10px; color: ${COLORS.muted}; transition: color 0.2s; }
  .nav-item.active .nav-label { color: ${COLORS.accent}; }
  .nav-item.active .nav-icon { filter: drop-shadow(0 0 6px ${COLORS.accent}); }

  /* Onboarding */
  .onboard-wrap { padding: 20px; }
  .onboard-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
  .step-dots { display: flex; gap: 6px; }
  .dot { width: 8px; height: 8px; border-radius: 4px; background: ${COLORS.border}; transition: all 0.3s; }
  .dot.active { background: ${COLORS.accent}; width: 20px; }
  .skip-btn { background: none; border: none; color: ${COLORS.muted}; font-size: 14px; cursor: pointer; }

  .onboard-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; margin-bottom: 8px; line-height: 1.2; }
  .onboard-sub { color: ${COLORS.muted}; font-size: 14px; margin-bottom: 28px; }

  .chip-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 28px; }
  .select-chip {
    padding: 10px 16px;
    border-radius: 20px;
    border: 1.5px solid ${COLORS.border};
    background: ${COLORS.card};
    color: ${COLORS.text};
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .select-chip.selected {
    border-color: ${COLORS.accent};
    background: rgba(255,107,53,0.15);
    color: ${COLORS.accent};
  }

  .text-input {
    width: 100%;
    background: ${COLORS.card};
    border: 1.5px solid ${COLORS.border};
    border-radius: 14px;
    padding: 14px 16px;
    color: ${COLORS.text};
    font-size: 14px;
    outline: none;
    margin-bottom: 12px;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s;
  }
  .text-input:focus { border-color: ${COLORS.accent}; }
  .text-input::placeholder { color: ${COLORS.muted}; }

  .range-group { margin-bottom: 20px; }
  .range-label { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
  .range-label span { color: ${COLORS.muted}; }
  .range-label strong { color: ${COLORS.accent}; }
  input[type=range] {
    width: 100%;
    accent-color: ${COLORS.accent};
    height: 4px;
  }

  .primary-btn {
    width: 100%;
    background: ${COLORS.accent};
    border: none;
    border-radius: 16px;
    padding: 16px;
    color: white;
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 8px;
  }
  .primary-btn:hover { background: ${COLORS.accentSoft}; transform: scale(1.01); }

  /* Calendar screen */
  .cal-grid { padding: 0 20px; }
  .cal-week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 16px; }
  .cal-day-col { text-align: center; }
  .cal-day-label { font-size: 10px; color: ${COLORS.muted}; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .cal-day-num {
    width: 32px; height: 32px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600;
    margin: 0 auto;
    cursor: pointer;
    transition: all 0.2s;
    background: ${COLORS.card};
  }
  .cal-day-num.selected { background: ${COLORS.accent}; color: white; }
  .cal-day-num.today { border: 1.5px solid ${COLORS.accent}; }

  .meal-row-card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 16px;
    padding: 12px 14px;
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 8px;
    cursor: pointer;
  }
  .meal-row-emoji { font-size: 24px; }
  .meal-row-info { flex: 1; }
  .meal-row-type { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: ${COLORS.muted}; }
  .meal-row-name { font-weight: 600; font-size: 14px; }

  /* Grocery screen */
  .grocery-header {
    padding: 20px;
    background: linear-gradient(135deg, ${COLORS.green}22, transparent);
    border-bottom: 1px solid ${COLORS.border};
  }
  .grocery-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; }
  .grocery-sub { color: ${COLORS.muted}; font-size: 13px; margin-top: 4px; }

  .grocery-list { padding: 16px 20px; }
  .grocery-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid ${COLORS.border};
    cursor: pointer;
  }
  .grocery-check {
    width: 22px; height: 22px;
    border-radius: 7px;
    border: 2px solid ${COLORS.border};
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .grocery-check.checked { background: ${COLORS.green}; border-color: ${COLORS.green}; }
  .grocery-item-name { font-size: 14px; transition: color 0.2s; }
  .grocery-item-name.checked { color: ${COLORS.muted}; text-decoration: line-through; }
  .delivery-btn {
    margin: 16px 20px;
    background: ${COLORS.card};
    border: 1.5px solid ${COLORS.green};
    border-radius: 14px;
    padding: 14px;
    color: ${COLORS.green};
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s;
  }
  .delivery-btn:hover { background: ${COLORS.green}22; }

  /* Profile screen */
  .profile-hero {
    padding: 30px 20px;
    text-align: center;
    background: linear-gradient(180deg, rgba(168,85,247,0.15) 0%, transparent 100%);
  }
  .profile-avatar {
    width: 80px; height: 80px;
    background: linear-gradient(135deg, ${COLORS.purple}, ${COLORS.accent});
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 36px;
    margin: 0 auto 12px;
  }
  .profile-name { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; }
  .profile-sub { color: ${COLORS.muted}; font-size: 13px; }

  .pref-row {
    padding: 14px 20px;
    display: flex; align-items: center; gap: 12px;
    border-bottom: 1px solid ${COLORS.border};
    cursor: pointer;
  }
  .pref-icon { font-size: 20px; width: 30px; text-align: center; }
  .pref-info { flex: 1; }
  .pref-label { font-size: 14px; font-weight: 500; }
  .pref-val { font-size: 12px; color: ${COLORS.muted}; }
  .pref-arrow { color: ${COLORS.muted}; }

  .toast {
    position: fixed;
    bottom: 110px;
    left: 50%; transform: translateX(-50%);
    background: ${COLORS.green};
    color: ${COLORS.bg};
    padding: 10px 20px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 13px;
    z-index: 200;
    animation: toastIn 0.3s ease, toastOut 0.3s ease 1.7s forwards;
  }
  @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
  @keyframes toastOut { to { opacity: 0; } }

  .generating-overlay {
    position: fixed; inset: 0;
    background: rgba(15,14,23,0.92);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    z-index: 300;
    gap: 20px;
  }
  .spinner {
    width: 64px; height: 64px;
    border: 3px solid ${COLORS.border};
    border-top-color: ${COLORS.accent};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .gen-text { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; }
  .gen-sub { color: ${COLORS.muted}; font-size: 13px; text-align: center; }
`;

export default function MealMindApp() {
  const [screen, setScreen] = useState("onboard"); // onboard | home | calendar | grocery | profile
  const [onboardStep, setOnboardStep] = useState(0);
  const [selectedDiet, setSelectedDiet] = useState([]);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [ingredients, setIngredients] = useState("");
  const [budget, setBudget] = useState(100);
  const [timeLimit, setTimeLimit] = useState(30);
  const [mealPlan, setMealPlan] = useState(null);
  const [activeDay, setActiveDay] = useState("Mon");
  const [checkedGrocery, setCheckedGrocery] = useState({});
  const [toast, setToast] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [selectedCalDay, setSelectedCalDay] = useState(0);
  const [navTab, setNavTab] = useState("home");

  const groceryList = useMemo(() => {
    if (!mealPlan) return GROCERY_ITEMS;
    const items = new Set();

    Object.values(mealPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(meal => {
        meal.tags.forEach(tag => items.add(tag.charAt(0).toUpperCase() + tag.slice(1)));
        normalizeText(meal.name)
          .split(" ")
          .filter(word => word.length > 3)
          .slice(0, 3)
          .forEach(word => items.add(word.charAt(0).toUpperCase() + word.slice(1)));
      });
    });

    return Array.from(items).slice(0, 18);
  }, [mealPlan]);

  const mealCount = mealPlan ? DAYS.length * MEAL_TYPES.length : 0;
  const dietLabel = selectedDiet.length
    ? selectedDiet.map(id => DIET_OPTIONS.find(o => o.id === id)?.label || id).join(", ")
    : "None set";
  const cuisineLabel = selectedCuisines.length
    ? selectedCuisines.map(id => CUISINE_OPTIONS.find(o => o.id === id)?.label || id).join(", ")
    : "None set";

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("mealmindState") || "null");
      if (saved) {
        setSelectedDiet(saved.selectedDiet || []);
        setSelectedCuisines(saved.selectedCuisines || []);
        setIngredients(saved.ingredients || "");
        setBudget(saved.budget || 100);
        setTimeLimit(saved.timeLimit || 30);
        setMealPlan(saved.mealPlan || null);
        setActiveDay(saved.activeDay || "Mon");
        setCheckedGrocery(saved.checkedGrocery || {});
        setNavTab(saved.navTab || "home");
      }
    } catch (error) {
      console.warn("Could not load saved MealMind state", error);
    }
  }, []);

  useEffect(() => {
    try {
      const stateToSave = {
        selectedDiet,
        selectedCuisines,
        ingredients,
        budget,
        timeLimit,
        mealPlan,
        activeDay,
        checkedGrocery,
        navTab,
      };
      localStorage.setItem("mealmindState", JSON.stringify(stateToSave));
    } catch (error) {
      console.warn("Could not persist MealMind state", error);
    }
  }, [selectedDiet, selectedCuisines, ingredients, budget, timeLimit, mealPlan, activeDay, checkedGrocery, navTab]);

  const generatePlan = () => {
    setGenerating(true);
    setTimeout(() => {
      setMealPlan(generateMealPlan({
        diets: selectedDiet,
        cuisines: selectedCuisines,
        ingredients,
        timeLimit,
      }));
      setGenerating(false);
      setScreen("home");
      setNavTab("home");
    }, 2000);
  };

  const swapMeal = (type) => {
    const options = getFilteredMeals(type, {
      diets: selectedDiet,
      cuisines: selectedCuisines,
      ingredients,
      timeLimit,
    });
    const newMeal = randomFrom(options.length ? options : MEAL_DB[type]);
    setMealPlan(prev => ({
      ...prev,
      [activeDay]: { ...prev[activeDay], [type]: newMeal }
    }));
    showToast("Meal swapped! ✨");
  };

  const surpriseMe = () => {
    setGenerating(true);
    setTimeout(() => {
      setMealPlan(generateMealPlan({
        diets: selectedDiet,
        cuisines: selectedCuisines,
        ingredients,
        timeLimit,
      }));
      setGenerating(false);
      showToast("New plan generated! 🎉");
    }, 1500);
  };

  const toggleGrocery = (item) => {
    setCheckedGrocery(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const totalCal = mealPlan && activeDay
    ? Object.values(mealPlan[activeDay]).reduce((s, m) => s + m.cal, 0)
    : 0;

  // ONBOARDING
  if (screen === "onboard") {
    const steps = [
      {
        title: <>Your dietary <span style={{ color: COLORS.accent }}>needs</span></>,
        sub: "We'll filter every meal to match your lifestyle.",
        content: (
          <div className="chip-grid">
            {DIET_OPTIONS.map(d => (
              <button key={d.id} className={`select-chip ${selectedDiet.includes(d.id) ? "selected" : ""}`}
                onClick={() => setSelectedDiet(prev => prev.includes(d.id) ? prev.filter(x => x !== d.id) : [...prev, d.id])}>
                {d.label}
              </button>
            ))}
          </div>
        )
      },
      {
        title: <>Favorite <span style={{ color: COLORS.yellow }}>cuisines</span></>,
        sub: "Pick the flavors you love most.",
        content: (
          <div className="chip-grid">
            {CUISINE_OPTIONS.map(c => (
              <button key={c.id} className={`select-chip ${selectedCuisines.includes(c.id) ? "selected" : ""}`}
                onClick={() => setSelectedCuisines(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}>
                {c.label}
              </button>
            ))}
          </div>
        )
      },
      {
        title: <>What's in your <span style={{ color: COLORS.green }}>fridge?</span></>,
        sub: "We'll use what you have to reduce waste.",
        content: (
          <>
            <textarea className="text-input" rows={4}
              placeholder="e.g. chicken, rice, spinach, tomatoes, garlic..."
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
              style={{ resize: "none" }}
            />
          </>
        )
      },
      {
        title: <>Time & <span style={{ color: COLORS.purple }}>budget</span></>,
        sub: "Set your constraints for every meal.",
        content: (
          <>
            <div className="range-group">
              <div className="range-label">
                <span>⏱ Max cook time</span>
                <strong>{timeLimit} min</strong>
              </div>
              <input type="range" min={10} max={120} step={5} value={timeLimit}
                onChange={e => setTimeLimit(Number(e.target.value))} />
            </div>
            <div className="range-group">
              <div className="range-label">
                <span>💰 Weekly budget</span>
                <strong>${budget}</strong>
              </div>
              <input type="range" min={30} max={300} step={10} value={budget}
                onChange={e => setBudget(Number(e.target.value))} />
            </div>
          </>
        )
      }
    ];

    const isLast = onboardStep === steps.length - 1;
    const step = steps[onboardStep];

    return (
      <div className="app">
        <style>{styles}</style>
        <div className="status-bar"><span>9:41</span><span>●●●</span></div>
        <div className="onboard-wrap screen">
          <div className="onboard-top">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="logo-icon">🍽️</div>
              <span className="logo-text">MealMind</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="step-dots">
                {steps.map((_, i) => <div key={i} className={`dot ${i === onboardStep ? "active" : ""}`} />)}
              </div>
              <button className="skip-btn" onClick={generatePlan}>Skip</button>
            </div>
          </div>

          <div style={{ marginBottom: 10, color: COLORS.muted, fontSize: 12 }}>
            Step {onboardStep + 1} of {steps.length}
          </div>
          <div className="onboard-title">{step.title}</div>
          <div className="onboard-sub">{step.sub}</div>

          {step.content}

          <button className="primary-btn" onClick={() => isLast ? generatePlan() : setOnboardStep(s => s + 1)}>
            {isLast ? "✨ Generate My Meal Plan" : "Continue →"}
          </button>

          {onboardStep > 0 && (
            <button onClick={() => setOnboardStep(s => s - 1)}
              style={{ background: "none", border: "none", color: COLORS.muted, width: "100%", marginTop: 12, cursor: "pointer", fontSize: 14 }}>
              ← Back
            </button>
          )}
        </div>
        {generating && <GeneratingOverlay />}
      </div>
    );
  }

  return (
    <div className="app">
      <style>{styles}</style>
      {generating && <GeneratingOverlay />}
      {toast && <div className="toast">{toast}</div>}

      <div className="status-bar"><span>9:41</span><span>●●●</span></div>

      {/* HOME */}
      {navTab === "home" && (
        <div className="screen">
          <div className="header">
            <div className="logo">
              <div className="logo-icon">🍽️</div>
              <span className="logo-text">MealMind</span>
            </div>
            <div className="avatar">👤</div>
          </div>

          <div className="hero-section">
            <div className="hero-greeting">Good morning, Chef! 👋</div>
            <div className="hero-title">What are we <span>cooking</span> today?</div>
          </div>

          <div className="quick-stats">
            <div className="stat-chip">
              <div className="val" style={{ color: COLORS.accent }}>{mealCount}</div>
              <div className="lbl">Meals Planned</div>
            </div>
            <div className="stat-chip">
              <div className="val" style={{ color: COLORS.green }}>{totalCal}</div>
              <div className="lbl">Today's Cals</div>
            </div>
            <div className="stat-chip">
              <div className="val" style={{ color: COLORS.yellow }}>${budget}</div>
              <div className="lbl">Budget Left</div>
            </div>
          </div>

          <div className="section-header">
            <div className="section-title">This Week</div>
            <div className="section-link" onClick={() => setNavTab("calendar")}>Full View →</div>
          </div>

          <div className="day-scroll">
            {DAYS.map(d => (
              <button key={d} className={`day-chip ${activeDay === d ? "active" : ""}`}
                onClick={() => setActiveDay(d)}>{d}</button>
            ))}
          </div>

          {mealPlan && (
            <div className="meal-cards">
              {MEAL_TYPES.map(type => {
                const meal = mealPlan[activeDay][type];
                return (
                  <div key={type} className={`meal-card ${type}`}>
                    <div className="meal-emoji-wrap">{meal.emoji}</div>
                    <div className="meal-info">
                      <div className="meal-type-label">{type}</div>
                      <div className="meal-name">{meal.name}</div>
                      <div className="meal-meta">
                        <span>⏱ <strong>{meal.time}m</strong></span>
                        <span>🔥 <strong>{meal.cal} cal</strong></span>
                        {meal.tags[0] && <span style={{ color: COLORS.green, fontSize: 11 }}>✓ {meal.tags[0]}</span>}
                      </div>
                    </div>
                    <button className="swap-btn" onClick={() => swapMeal(type)}>🔄</button>
                  </div>
                );
              })}
            </div>
          )}

          <button className="surprise-btn" onClick={surpriseMe}>
            🎲 Surprise Me! Regenerate Plan
          </button>
        </div>
      )}

      {/* CALENDAR */}
      {navTab === "calendar" && (
        <div className="screen">
          <div className="header">
            <div className="section-title" style={{ fontSize: 22 }}>📅 Weekly Plan</div>
            <div className="section-link" onClick={surpriseMe}>Regenerate</div>
          </div>

          <div className="cal-grid">
            <div className="cal-week">
              {DAYS.map((d, i) => (
                <div key={d} className="cal-day-col">
                  <div className="cal-day-label">{d}</div>
                  <div className={`cal-day-num ${selectedCalDay === i ? "selected" : ""} ${i === 0 ? "today" : ""}`}
                    onClick={() => { setSelectedCalDay(i); setActiveDay(d); }}>
                    {7 + i}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 12, fontSize: 16 }}>
                {DAYS[selectedCalDay]} · April {selectedCalDay + 7}
              </div>
              {mealPlan && MEAL_TYPES.map(type => {
                const meal = mealPlan[DAYS[selectedCalDay]][type];
                return (
                  <div key={type} className="meal-row-card">
                    <div className="meal-row-emoji">{meal.emoji}</div>
                    <div className="meal-row-info">
                      <div className="meal-row-type">{type}</div>
                      <div className="meal-row-name">{meal.name}</div>
                    </div>
                    <button className="swap-btn" onClick={() => { setActiveDay(DAYS[selectedCalDay]); swapMeal(type); }}>🔄</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* GROCERY */}
      {navTab === "grocery" && (
        <div className="screen">
          <div className="grocery-header">
            <div className="grocery-title">🛒 Smart Grocery List</div>
            <div className="grocery-sub">Based on your 7-day meal plan · {groceryList.length} items</div>
          </div>

          <button className="delivery-btn" onClick={() => showToast("Opening Instacart... 🚚")}>
            🚚 Order via Grocery Delivery
          </button>

          <div className="grocery-list">
            {groceryList.map(item => (
              <div key={item} className="grocery-item" onClick={() => toggleGrocery(item)}>
                <div className={`grocery-check ${checkedGrocery[item] ? "checked" : ""}`}>
                  {checkedGrocery[item] && <span style={{ fontSize: 13, color: COLORS.bg }}>✓</span>}
                </div>
                <span className={`grocery-item-name ${checkedGrocery[item] ? "checked" : ""}`}>{item}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "0 20px 20px", textAlign: "center", color: COLORS.muted, fontSize: 12 }}>
            {Object.values(checkedGrocery).filter(Boolean).length} of {GROCERY_ITEMS.length} items checked ·
            Est. ${(budget * 0.7).toFixed(0)} total
          </div>
        </div>
      )}

      {/* PROFILE */}
      {navTab === "profile" && (
        <div className="screen">
          <div className="profile-hero">
            <div className="profile-avatar">👤</div>
            <div className="profile-name">My Profile</div>
            <div className="profile-sub">7-day streak 🔥 · 14 saved meals</div>
          </div>

          {[
            { icon: "🥗", label: "Dietary Preferences", val: dietLabel },
            { icon: "🍜", label: "Favorite Cuisines", val: cuisineLabel },
            { icon: "⏱", label: "Max Cook Time", val: `${timeLimit} minutes` },
            { icon: "💰", label: "Weekly Budget", val: `$${budget}` },
            { icon: "👨‍👩‍👧", label: "Family Mode", val: "Off · 1 person" },
            { icon: "🔔", label: "Meal Prep Reminders", val: "8:00 AM daily" },
            { icon: "❤️", label: "Saved Meals", val: "14 meals" },
            { icon: "📊", label: "Nutrition Goals", val: "2,000 cal / day" },
          ].map(r => (
            <div key={r.label} className="pref-row">
              <div className="pref-icon">{r.icon}</div>
              <div className="pref-info">
                <div className="pref-label">{r.label}</div>
                <div className="pref-val">{r.val}</div>
              </div>
              <div className="pref-arrow">›</div>
            </div>
          ))}

          <div style={{ padding: 20 }}>
            <button className="primary-btn" onClick={() => { setScreen("onboard"); setOnboardStep(0); setNavTab("home"); }}>
              ✏️ Update Preferences
            </button>
          </div>
        </div>
      )}

      <div className="bottom-nav">
        {[
          { id: "home", icon: "🏠", label: "Home" },
          { id: "calendar", icon: "📅", label: "Plan" },
          { id: "grocery", icon: "🛒", label: "Grocery" },
          { id: "profile", icon: "👤", label: "Profile" },
        ].map(tab => (
          <div key={tab.id} className={`nav-item ${navTab === tab.id ? "active" : ""}`}
            onClick={() => setNavTab(tab.id)}>
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GeneratingOverlay() {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const msgs = ["Analyzing your preferences", "Mixing up recipes", "Building your meal plan", "Almost ready"];
    let i = 0;
    const t = setInterval(() => { setDots("...".slice(0, (i++ % 3) + 1)); }, 400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="generating-overlay">
      <div style={{ fontSize: 48 }}>🍽️</div>
      <div className="spinner" />
      <div className="gen-text">Creating your plan{dots}</div>
      <div className="gen-sub">Personalizing meals based on<br />your tastes and pantry</div>
    </div>
  );
}
