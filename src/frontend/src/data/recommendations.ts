import type { PrimaryDosha, PrakrutiType } from "../types/prakruti";

export interface RecommendationSet {
  tagline: string;
  description: string;
  color: "purple" | "teal" | "gold";
  problems: string[];
  diet: string[];
  lifestyle: string[];
  herbs: string[];
  avoid: string[];
}

export const RECOMMENDATIONS: Record<PrimaryDosha, RecommendationSet> = {
  Vata: {
    tagline: "Warm, Ground, Nourish",
    description:
      "Vata individuals are creative, energetic, and quick-thinking — but can become anxious and scattered when imbalanced. Grounding routines restore harmony.",
    color: "purple",
    problems: [
      "Dry skin & cracked lips",
      "Anxiety & overthinking",
      "Irregular digestion & bloating",
      "Light, restless sleep",
    ],
    diet: [
      "Favour warm, cooked, oily foods (ghee, sesame oil)",
      "Sweet, sour & salty tastes pacify Vata",
      "Eat at consistent times — routine is medicine",
      "Warm soups, stews & root vegetables",
      "Avoid cold, raw, dry foods and carbonated drinks",
    ],
    lifestyle: [
      "Establish a consistent daily routine (Dinacharya)",
      "Practice Abhyanga (self-massage with warm oil) daily",
      "Gentle yoga — Hatha or Yin, avoid vigorous types",
      "Meditation and pranayama to calm the nervous system",
      "Keep warm; avoid excessive wind and cold weather",
    ],
    herbs: [
      "Ashwagandha — grounding adaptogen",
      "Shatavari — nourishing & calming",
      "Brahmi — mind & nerves",
      "Triphala — gentle digestive support",
    ],
    avoid: [
      "Cold & raw foods",
      "Excessive fasting",
      "Overstimulation & late nights",
      "Rushing and multitasking",
    ],
  },
  Pitta: {
    tagline: "Cool, Calm, Soften",
    description:
      "Pitta individuals are sharp, driven, and intelligent — but can become irritable and inflamed when overheated. Cooling and surrender are the path to balance.",
    color: "teal",
    problems: [
      "Heat, acidity & heartburn",
      "Skin redness & inflammation",
      "Irritability & perfectionism",
      "Premature greying or hair loss",
    ],
    diet: [
      "Sweet, bitter & astringent tastes cool Pitta",
      "Fresh fruits, leafy greens, coconut water, milk",
      "Cooling grains: rice, barley, wheat",
      "Avoid spicy, fermented, fried & salty foods",
      "Room-temperature or cool (not iced) beverages",
    ],
    lifestyle: [
      "Exercise in the cool morning or evening hours",
      "Avoid sun exposure during peak hours (10am–2pm)",
      "Practice surrender — not every task needs perfection",
      "Cooling pranayama: Sheetali or Sheetkari breath",
      "Engage in creative and joyful activities regularly",
    ],
    herbs: [
      "Shatavari — cooling & nourishing",
      "Amalaki — powerful antioxidant",
      "Brahmi — mental clarity",
      "Neem — cooling & blood purifier",
    ],
    avoid: [
      "Spicy & fermented foods",
      "Alcohol & coffee",
      "Overworking & perfectionism",
      "Excessive heat & direct sun",
    ],
  },
  Kapha: {
    tagline: "Move, Stimulate, Lighten",
    description:
      "Kapha individuals are compassionate, stable, and enduring — but can become lethargic and congested when excess accumulates. Movement and warmth reignite vitality.",
    color: "gold",
    problems: [
      "Weight gain & water retention",
      "Lethargy & low motivation",
      "Sinus congestion & mucus",
      "Attachment & resistance to change",
    ],
    diet: [
      "Pungent, bitter & astringent tastes reduce Kapha",
      "Light, warm, dry foods: legumes, vegetables, spices",
      "Ginger tea and warming spices (pepper, turmeric)",
      "Avoid dairy, heavy sweets, fried & oily foods",
      "Eat smaller portions; avoid overeating",
    ],
    lifestyle: [
      "Vigorous daily exercise — 45–60 min minimum",
      "Rise before sunrise; avoid daytime naps",
      "Dry brushing (Garshana) to stimulate lymph & circulation",
      "Seek variety and novelty — challenge comfort zones",
      "Keep living spaces warm and free of clutter",
    ],
    herbs: [
      "Trikatu — digestive fire stimulant",
      "Guggul — fat metabolism & joints",
      "Ginger — warming & digestive",
      "Tulsi — respiratory & immunity",
    ],
    avoid: [
      "Dairy & cold foods",
      "Sugar & refined carbs",
      "Daytime sleeping",
      "Sedentary lifestyle",
    ],
  },
};
