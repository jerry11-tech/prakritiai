import React, { useState } from "react";
import { Check, Utensils, Sun, Moon, Leaf } from "lucide-react";
import { PrakritiBadge } from "./PrakritiBadge";

interface WellnessPlannerProps {
  dominantDosha?: string;
}

export function WellnessPlanner({ dominantDosha = "Vata" }: WellnessPlannerProps) {
  const norm = dominantDosha.toUpperCase();

  const itemsMap: Record<string, { category: string; item: string; desc: string }[]> = {
    VATA: [
      { category: "Breakfast", item: "Warm Oatmeal with Ghee & Cinnamon", desc: "Grounding warm grain bowl with healthy fats." },
      { category: "Lunch", item: "Cooked Kitchari & Steamed Root Veggies", desc: "Easy-to-digest rice and mung dahl." },
      { category: "Dinner", item: "Spiced Sweet Potato Soup & Sesame", desc: "Calming evening meal before 7:00 PM." },
      { category: "Herb / Spice", item: "Ginger, Cardamom & Ashwagandha Tea", desc: "Balancing adaptogenic warm tea." },
      { category: "Routine", item: "Abhyanga Warm Oil Self-Massage", desc: "Warm sesame oil application before shower." },
    ],
    PITTA: [
      { category: "Breakfast", item: "Sweet Fruit Bowl with Mint & Coconut", desc: "Cooling hydrating morning meal." },
      { category: "Lunch", item: "Quinoa Salad with Cucumber & Cilantro", desc: "Substantial lunch when metabolic fire peaks." },
      { category: "Dinner", item: "Steamed Asparagus & Mung Bean Soup", desc: "Light non-spicy evening meal." },
      { category: "Herb / Spice", item: "Fennel, Coriander & Brahmi Tea", desc: "Cooling digestive herbal brew." },
      { category: "Routine", item: "Moonlight Stroll & Cooling Shower", desc: "Unwinding walk outdoors away from midday heat." },
    ],
    KAPHA: [
      { category: "Breakfast", item: "Stewed Apples with Cloves & Cardamom", desc: "Light warm breakfast to ignite digestion." },
      { category: "Lunch", item: "Spiced Barley & Sautéed Bitter Greens", desc: "Invigorating dry grain bowl." },
      { category: "Dinner", item: "Lentil Soup with Black Pepper & Turmeric", desc: "Dry, light, low-oil dinner." },
      { category: "Herb / Spice", item: "Prikatu & Cinnamon Ginger Tea", desc: "Metabolism-boosting pungent herbal tea." },
      { category: "Routine", item: "Dry Garshana Silk Skin Brushing", desc: "Invigorating morning skin brushing before movement." },
    ],
  };

  const currentItems = itemsMap[norm] || itemsMap.VATA;
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  const toggleItem = (idx: number) => {
    setCompleted((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalCount = currentItems.length;

  return (
    <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-display font-bold text-base text-foreground">Interactive Daily Dinacharya & Meal Planner</h3>
            <p className="text-xs text-muted-foreground">Track daily Ayurvedic lifestyle routines for {dominantDosha}.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary">{completedCount} of {totalCount} Completed</span>
          <PrakritiBadge type={dominantDosha} label={dominantDosha} size="sm" />
        </div>
      </div>

      <div className="grid gap-2.5">
        {currentItems.map((entry, idx) => {
          const isDone = Boolean(completed[idx]);
          return (
            <div
              key={idx}
              onClick={() => toggleItem(idx)}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                isDone
                  ? "bg-secondary/60 border-primary text-primary font-semibold"
                  : "bg-muted/20 border-border/40 hover:border-primary/40 text-foreground"
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{entry.category}</span>
                  <span className={`text-xs font-bold ${isDone ? "line-through opacity-70" : ""}`}>{entry.item}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">{entry.desc}</p>
              </div>

              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                isDone ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card"
              }`}>
                {isDone && <Check className="h-3.5 w-3.5" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
