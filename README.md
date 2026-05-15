# ⚡ MacroFuel – Macro Nutrient Calculator

A beautiful, premium dark-mode **macro nutrient calculator** built with pure HTML, CSS, and JavaScript.

## 🌟 Features

- 🔢 **BMR & TDEE calculation** using the Mifflin-St Jeor equation
- 🎯 **3 fitness goals** — Fat Loss, Maintain, Muscle Gain
- 📊 **Animated donut chart** showing macro ratios (Protein / Carbs / Fat)
- 📈 **Animated progress bars** per macro nutrient
- 🍽️ **Meal split slider** — distributes macros across 2–6 meals/day
- ⚖️ **Metric & Imperial** unit support
- 💡 **Goal-specific pro tips**
- 📱 Fully **responsive** design
- ♿ **Keyboard accessible**

## 🚀 Getting Started

No build step needed — just open `index.html` in any modern browser.

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/macro-nutrient-calculator.git

# Open in browser
open index.html
```

## 🧮 How It Works

| Formula | Description |
|---|---|
| **BMR (Male)**   | `10 × weight(kg) + 6.25 × height(cm) − 5 × age + 5` |
| **BMR (Female)** | `10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161` |
| **TDEE**         | `BMR × Activity Multiplier` |
| **Target**       | `TDEE × Goal Multiplier` (–20% / ×1 / +15%) |

### Macro Splits by Goal

| Goal | Protein | Carbs | Fat |
|---|---|---|---|
| Fat Loss    | 35% | 40% | 25% |
| Maintain    | 30% | 45% | 25% |
| Muscle Gain | 30% | 50% | 20% |

## 📁 File Structure

```
macro-nutrient-calculator/
├── index.html   # App structure
├── style.css    # Premium dark-mode UI
├── script.js    # Calculation logic & interactivity
└── README.md
```

## 🛠️ Tech Stack

- **HTML5** – Semantic structure
- **CSS3** – Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript** – Zero dependencies

## 📄 License

MIT © 2026
