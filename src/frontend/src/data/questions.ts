import type { Question } from "../types/prakruti";

export const QUESTIONS: Question[] = [
  {
    id: "body_frame",
    text: "How would you describe your body frame?",
    options: [
      { label: "Slim & light — hard to gain weight", dosha: "vata" },
      { label: "Medium build — moderate frame", dosha: "pitta" },
      { label: "Heavy & large — gain weight easily", dosha: "kapha" },
    ],
  },
  {
    id: "skin_texture",
    text: "Your skin texture is usually...",
    options: [
      { label: "Dry & rough, tends to crack", dosha: "vata" },
      { label: "Oily & sensitive, prone to redness", dosha: "pitta" },
      { label: "Smooth, thick & well-moisturized", dosha: "kapha" },
    ],
  },
  {
    id: "sleep",
    text: "How is your sleep pattern?",
    options: [
      { label: "Light sleeper — wake easily, restless", dosha: "vata" },
      { label: "Moderate — 6–7 hours feels enough", dosha: "pitta" },
      { label: "Deep & long — love to sleep 8+ hours", dosha: "kapha" },
    ],
  },
  {
    id: "digestion",
    text: "How is your digestion typically?",
    options: [
      { label: "Irregular — bloating & gas common", dosha: "vata" },
      { label: "Sharp — strong, sometimes acidic", dosha: "pitta" },
      { label: "Slow & steady — rarely upset", dosha: "kapha" },
    ],
  },
  {
    id: "appetite",
    text: "Describe your appetite patterns:",
    options: [
      { label: "Variable — forget to eat sometimes", dosha: "vata" },
      { label: "Strong — irritable when hungry", dosha: "pitta" },
      { label: "Consistent — can skip meals easily", dosha: "kapha" },
    ],
  },
  {
    id: "energy",
    text: "How is your daily energy level?",
    options: [
      { label: "Bursts of energy followed by fatigue", dosha: "vata" },
      { label: "Intense & focused throughout the day", dosha: "pitta" },
      { label: "Steady & calm — slow to start, endures long", dosha: "kapha" },
    ],
  },
  {
    id: "mind",
    text: "Which best describes your mind & emotions?",
    options: [
      { label: "Creative, anxious, quick to change moods", dosha: "vata" },
      { label: "Sharp, focused, can be intense or irritable", dosha: "pitta" },
      { label: "Calm, steady, sometimes resistant to change", dosha: "kapha" },
    ],
  },
  {
    id: "skin_oiliness",
    text: "How oily is your skin typically?",
    options: [
      { label: "Very dry — flaky in cold weather", dosha: "vata" },
      { label: "Combination — oily T-zone", dosha: "pitta" },
      { label: "Consistently oily across face", dosha: "kapha" },
    ],
  },
  {
    id: "weight",
    text: "Your weight pattern over the years:",
    options: [
      { label: "Naturally lean — struggle to gain", dosha: "vata" },
      { label: "Stable — manage easily with diet", dosha: "pitta" },
      { label: "Tend to gain — hard to lose", dosha: "kapha" },
    ],
  },
  {
    id: "temperature",
    text: "How sensitive are you to temperature?",
    options: [
      { label: "Hate cold — always feel chilly", dosha: "vata" },
      { label: "Hate heat — prefer cool environments", dosha: "pitta" },
      { label: "Tolerate heat well, dislike cold damp", dosha: "kapha" },
    ],
  },
  {
    id: "hair",
    text: "How would you describe your hair texture?",
    options: [
      { label: "Dry, frizzy or thin", dosha: "vata" },
      { label: "Fine, prone to premature grey or hair loss", dosha: "pitta" },
      { label: "Thick, lustrous and oily", dosha: "kapha" },
    ],
  },
  {
    id: "activity",
    text: "Your preferred activity level:",
    options: [
      { label: "Love movement — walking, dancing, variety", dosha: "vata" },
      { label: "Purposeful exercise — goals & competition", dosha: "pitta" },
      { label: "Moderate, steady — dislike intense workouts", dosha: "kapha" },
    ],
  },
];
