import type { Question } from "../types/prakruti";

export const DEMOGRAPHIC_QUESTIONS: Question[] = [
  {
    id: "age_group",
    text: "Age Group:",
    category: "demographic",
    options: [
      { label: "10-20 years", dosha: "vata", value: "10-20" },
      { label: "20-30 years", dosha: "pitta", value: "20-30" },
      { label: "30-40 years", dosha: "pitta", value: "30-40" },
      { label: "40-50 years", dosha: "kapha", value: "40-50" },
      { label: "50+ years", dosha: "vata", value: "50+" },
    ],
  },
  {
    id: "gender",
    text: "Gender:",
    category: "demographic",
    options: [
      { label: "Female", dosha: "vata", value: "Female" },
      { label: "Male", dosha: "pitta", value: "Male" },
      { label: "Other / Prefer not to say", dosha: "kapha", value: "Other" },
    ],
  },
  {
    id: "city",
    text: "City of Residence:",
    category: "demographic",
    options: [
      { label: "Metro / Large City", dosha: "pitta", value: "Metro" },
      { label: "Town / Tier-2 City", dosha: "vata", value: "Town" },
      { label: "Rural / Village", dosha: "kapha", value: "Rural" },
    ],
  },
];

export const HEALTH_QUESTIONS: Question[] = [
  {
    id: "diabetes",
    text: "Are you Diabetic?",
    category: "health",
    options: [
      { label: "No", dosha: "pitta", value: "No" },
      { label: "Yes — Type 1 or Type 2", dosha: "kapha", value: "Yes" },
    ],
  },
  {
    id: "blood_pressure",
    text: "Do you have High or Low Blood Pressure problem?",
    category: "health",
    options: [
      { label: "Normal BP", dosha: "kapha", value: "Normal" },
      { label: "High BP", dosha: "pitta", value: "High" },
      { label: "Low BP", dosha: "vata", value: "Low" },
    ],
  },
];

export const PRAKRITI_QUESTIONS: Question[] = [
  // --- Physical Features (One characteristic per question) ---
  {
    id: "skin_moisture",
    text: "Skin Moisture Level:",
    category: "prakriti",
    options: [
      { label: "Dry & Flaky", dosha: "vata", value: "Dry" },
      { label: "Normal & Balanced", dosha: "pitta", value: "Normal" },
      { label: "Oily & Moist", dosha: "kapha", value: "Oily" },
    ],
  },
  {
    id: "skin_color",
    text: "Skin Color Tone:",
    category: "prakriti",
    options: [
      { label: "Dusky / Dark", dosha: "vata", value: "Dark" },
      { label: "Fair / Pinkish / Coppery", dosha: "pitta", value: "Fair" },
      { label: "Medium / Olive / Wheatish", dosha: "kapha", value: "Medium" },
    ],
  },
  {
    id: "skin_temperature",
    text: "Skin Touch Temperature:",
    category: "prakriti",
    options: [
      { label: "Cool / Cold to touch", dosha: "vata", value: "Cool" },
      { label: "Warm / Hot to touch", dosha: "pitta", value: "Warm" },
      { label: "Mild / Normal temperature", dosha: "kapha", value: "Normal" },
    ],
  },
  {
    id: "hair_density",
    text: "Hair Density:",
    category: "prakriti",
    options: [
      { label: "Scanty / Sparse", dosha: "vata", value: "Low" },
      { label: "Moderate Density", dosha: "pitta", value: "Medium" },
      { label: "Thick & Dense", dosha: "kapha", value: "High" },
    ],
  },
  {
    id: "hair_oiliness",
    text: "Hair Texture & Oiliness:",
    category: "prakriti",
    options: [
      { label: "Dry & Rough", dosha: "vata", value: "Dry" },
      { label: "Fine & Soft", dosha: "pitta", value: "Normal" },
      { label: "Oily & Smooth", dosha: "kapha", value: "Oily" },
    ],
  },
  {
    id: "eye_size",
    text: "Eye Size:",
    category: "prakriti",
    options: [
      { label: "Small", dosha: "vata", value: "Small" },
      { label: "Medium", dosha: "pitta", value: "Medium" },
      { label: "Large & Wide", dosha: "kapha", value: "Large" },
    ],
  },
  {
    id: "eyeball_movement",
    text: "Eyeball Movement Pattern:",
    category: "prakriti",
    options: [
      { label: "Unsteady & Rapid", dosha: "vata", value: "Fast" },
      { label: "Sharp & Focused", dosha: "pitta", value: "Moderate" },
      { label: "Slow & Calm", dosha: "kapha", value: "Slow" },
    ],
  },
  {
    id: "body_frame_length",
    text: "Body Height / Length:",
    category: "prakriti",
    options: [
      { label: "Short or Unusually Tall", dosha: "vata", value: "Irregular" },
      { label: "Medium Height", dosha: "pitta", value: "Medium" },
      { label: "Tall & Sturdy", dosha: "kapha", value: "Large" },
    ],
  },
  {
    id: "body_frame_breadth",
    text: "Body Frame Width / Shoulders:",
    category: "prakriti",
    options: [
      { label: "Thin & Narrow", dosha: "vata", value: "Small" },
      { label: "Medium Build", dosha: "pitta", value: "Medium" },
      { label: "Broad & Heavy", dosha: "kapha", value: "Large" },
    ],
  },
  {
    id: "joints_sound",
    text: "Joint Prominence & Sounds:",
    category: "prakriti",
    options: [
      { label: "Prominent & Cracking Sound", dosha: "vata", value: "Cracking" },
      { label: "Medium / Moderate Firmness", dosha: "pitta", value: "Normal" },
      { label: "Compact & Smooth (Hidden Joints)", dosha: "kapha", value: "Compact" },
    ],
  },

  // --- Physiological Features ---
  {
    id: "weight_change_trend",
    text: "Weight Tendency:",
    category: "prakriti",
    options: [
      { label: "Difficult to Gain Weight", dosha: "vata", value: "HardToGain" },
      { label: "Stable Weight / Controlled", dosha: "pitta", value: "Stable" },
      { label: "Gains Weight Easily, Hard to Lose", dosha: "kapha", value: "GainsEasily" },
    ],
  },
  {
    id: "appetite_regularity",
    text: "Appetite Pattern:",
    category: "prakriti",
    options: [
      { label: "Variable & Irregular", dosha: "vata", value: "Irregular" },
      { label: "High & Intense (Irritable when hungry)", dosha: "pitta", value: "High" },
      { label: "Moderate & Steady", dosha: "kapha", value: "Medium" },
    ],
  },
  {
    id: "hunger_speed",
    text: "Hunger Onset Speed:",
    category: "prakriti",
    options: [
      { label: "Sudden & Erratic", dosha: "vata", value: "Fast" },
      { label: "Frequent & Sharp", dosha: "pitta", value: "High" },
      { label: "Slow & Gradual", dosha: "kapha", value: "Slow" },
    ],
  },
  {
    id: "water_intake_volume",
    text: "Daily Water Intake Quantity:",
    category: "prakriti",
    options: [
      { label: "Low / Small Intake", dosha: "vata", value: "Low" },
      { label: "High / Frequent Intake", dosha: "pitta", value: "High" },
      { label: "Moderate Intake", dosha: "kapha", value: "Medium" },
    ],
  },
  {
    id: "sweating_amount",
    text: "Amount of Sweating:",
    category: "prakriti",
    options: [
      { label: "Scanty / Low", dosha: "vata", value: "Low" },
      { label: "Profuse / Heavy", dosha: "pitta", value: "High" },
      { label: "Moderate", dosha: "kapha", value: "Medium" },
    ],
  },
  {
    id: "sleep_depth",
    text: "Sleep Depth:",
    category: "prakriti",
    options: [
      { label: "Light & Interrupted", dosha: "vata", value: "Light" },
      { label: "Moderate & Sound", dosha: "pitta", value: "Medium" },
      { label: "Deep & Heavy", dosha: "kapha", value: "Deep" },
    ],
  },
  {
    id: "physical_stamina",
    text: "Physical Stamina Level:",
    category: "prakriti",
    options: [
      { label: "Low / Fatigued Quickly", dosha: "vata", value: "Low" },
      { label: "Moderate / Intense Short Bursts", dosha: "pitta", value: "Medium" },
      { label: "High Endurance & Sustained Energy", dosha: "kapha", value: "High" },
    ],
  },
  {
    id: "speaking_pace",
    text: "Speaking Speed:",
    category: "prakriti",
    options: [
      { label: "Fast & Rapid", dosha: "vata", value: "Fast" },
      { label: "Sharp & Clear", dosha: "pitta", value: "Moderate" },
      { label: "Slow & Measured", dosha: "kapha", value: "Slow" },
    ],
  },
  {
    id: "walking_speed",
    text: "Walking Gait Speed:",
    category: "prakriti",
    options: [
      { label: "Brisk & Swift", dosha: "vata", value: "Fast" },
      { label: "Average & Steady", dosha: "pitta", value: "Moderate" },
      { label: "Slow & Graceful", dosha: "kapha", value: "Slow" },
    ],
  },
  {
    id: "climate_comfort",
    text: "Preferred Climate:",
    category: "prakriti",
    options: [
      { label: "Prefers Warm Climate", dosha: "vata", value: "Warm" },
      { label: "Prefers Cool Climate", dosha: "pitta", value: "Cool" },
      { label: "Tolerates Heat Well", dosha: "kapha", value: "Hot" },
    ],
  },

  // --- Psychological Features ---
  {
    id: "emotional_stability",
    text: "Emotional Reaction Pattern:",
    category: "prakriti",
    options: [
      { label: "Anxious / Wavering / Mood Swings", dosha: "vata", value: "Wavering" },
      { label: "Irritable / Quick to Anger", dosha: "pitta", value: "Intense" },
      { label: "Calm / Stable & Unshakable", dosha: "kapha", value: "Stable" },
    ],
  },
  {
    id: "learning_grasping",
    text: "Grasping & Learning Speed:",
    category: "prakriti",
    options: [
      { label: "Quick to learn, quick to forget", dosha: "vata", value: "Fast" },
      { label: "Moderate & precise learning", dosha: "pitta", value: "Medium" },
      { label: "Slow to learn, never forgets", dosha: "kapha", value: "Slow" },
    ],
  },
  {
    id: "memory_type",
    text: "Memory Type:",
    category: "prakriti",
    options: [
      { label: "Short-term Good", dosha: "vata", value: "ShortTerm" },
      { label: "Sharp & Analytical", dosha: "pitta", value: "Sharp" },
      { label: "Long-term Excellent", dosha: "kapha", value: "LongTerm" },
    ],
  },
  {
    id: "temperament_nature",
    text: "General Temperament:",
    category: "prakriti",
    options: [
      { label: "Restless & Adaptable", dosha: "vata", value: "Restless" },
      { label: "Ambitious & Competitive", dosha: "pitta", value: "Ambitious" },
      { label: "Peaceful & Patient", dosha: "kapha", value: "Placid" },
    ],
  },
  {
    id: "decision_style",
    text: "Decision Making Style:",
    category: "prakriti",
    options: [
      { label: "Quick but Indecisive / Hesitant", dosha: "vata", value: "Hesitant" },
      { label: "Quick, Goal-Oriented & Firm", dosha: "pitta", value: "Firm" },
      { label: "Slow, Methodical & Deliberate", dosha: "kapha", value: "Methodical" },
    ],
  },
  {
    id: "food_temperature_pref",
    text: "Food Temperature Preference:",
    category: "prakriti",
    options: [
      { label: "Prefers Hot & Warm Food", dosha: "vata", value: "Hot" },
      { label: "Prefers Cold & Refreshing Food", dosha: "pitta", value: "Cold" },
      { label: "Prefers Light & Dry Food", dosha: "kapha", value: "Dry" },
    ],
  },
  // --- Additional CCRAS Standard Features ---
  {
    id: "teeth_type",
    text: "Natural Teeth Appearance:",
    category: "prakriti",
    options: [
      { label: "Small / Irregular / Crooked", dosha: "vata", value: "Irregular" },
      { label: "Medium / Slightly Yellowish / Sensitive", dosha: "pitta", value: "Medium" },
      { label: "Large / Strong / White & Even", dosha: "kapha", value: "Large" },
    ],
  },
  {
    id: "nail_texture",
    text: "Nail Texture & Appearance:",
    category: "prakriti",
    options: [
      { label: "Dry, Brittle & Rough", dosha: "vata", value: "Dry" },
      { label: "Soft, Pinkish & Flexible", dosha: "pitta", value: "Soft" },
      { label: "Thick, Smooth & Shiny", dosha: "kapha", value: "Thick" },
    ],
  },
  {
    id: "voice_pitch",
    text: "Voice Tone & Pitch:",
    category: "prakriti",
    options: [
      { label: "High-pitched / Weak / Dry", dosha: "vata", value: "High" },
      { label: "Clear / Sharp / Forceful", dosha: "pitta", value: "Sharp" },
      { label: "Deep / Low / Resonant & Sweet", dosha: "kapha", value: "Deep" },
    ],
  },
  {
    id: "bowel_habit",
    text: "Bowel Elimination Habit:",
    category: "prakriti",
    options: [
      { label: "Irregular / Hard Stools / Prone to Constipation", dosha: "vata", value: "Irregular" },
      { label: "Frequent / Loose Stools / Fast Elimination", dosha: "pitta", value: "Frequent" },
      { label: "Regular / Soft / Slow & Heavy Stools", dosha: "kapha", value: "Regular" },
    ],
  },
  {
    id: "dream_theme",
    text: "Predominant Dream Pattern:",
    category: "prakriti",
    options: [
      { label: "Flying, Falling, Motion or Fear", dosha: "vata", value: "Motion" },
      { label: "Fire, Bright Lights, Violence or Passion", dosha: "pitta", value: "Fire" },
      { label: "Water Bodies, Clouds, Gardens or Romance", dosha: "kapha", value: "Water" },
    ],
  },
];

export const VIKRITI_QUESTIONS: Question[] = [
  {
    id: "vikriti_digestion_skin",
    text: "Current Digestion & Skin Symptoms (Past 2 Weeks):",
    category: "vikriti",
    options: [
      { label: "Bloating, Dry Skin, Constipation or Gas", dosha: "vata", value: "VataImbalance" },
      { label: "Acidity, Heartburn, Skin Rashes or Inflammation", dosha: "pitta", value: "PittaImbalance" },
      { label: "Heavy Digestion, Mucus, Lethargy or Excess Moisture", dosha: "kapha", value: "KaphaImbalance" },
    ],
  },
  {
    id: "vikriti_mind_sleep",
    text: "Current Sleep & Mental State (Past 2 Weeks):",
    category: "vikriti",
    options: [
      { label: "Insomnia, Racing Thoughts or High Anxiety", dosha: "vata", value: "VataImbalance" },
      { label: "Irritability, Anger, Frustration or Overheating", dosha: "pitta", value: "PittaImbalance" },
      { label: "Excessive Sleep, Procrastination or Brain Fog", dosha: "kapha", value: "KaphaImbalance" },
    ],
  },
  {
    id: "vikriti_energy_joints",
    text: "Current Physical & Joint Feeling (Past 2 Weeks):",
    category: "vikriti",
    options: [
      { label: "Joint Stiffness, Body Aches or Fatigue", dosha: "vata", value: "VataImbalance" },
      { label: "Excessive Thirst, Sweating or Burning Sensation", dosha: "pitta", value: "PittaImbalance" },
      { label: "Fluid Retention, Weight Gain or Heavy Limbs", dosha: "kapha", value: "KaphaImbalance" },
    ],
  },
];

export const QUESTIONS: Question[] = [
  ...DEMOGRAPHIC_QUESTIONS,
  ...HEALTH_QUESTIONS,
  ...PRAKRITI_QUESTIONS,
];
