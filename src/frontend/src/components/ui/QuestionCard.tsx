import type { DoshaType, Question } from "../../types/prakruti";

interface QuestionCardProps {
  question: Question;
  selected: DoshaType | null;
  onSelect: (dosha: DoshaType) => void;
}

export function QuestionCard({
  question,
  selected,
  onSelect,
}: QuestionCardProps) {
  return (
    <div
      data-ocid={`question-${question.id}`}
      className="bg-muted/20 border border-border/30 rounded-xl p-4"
    >
      <p className="text-sm text-foreground/80 mb-3 leading-snug">
        {question.text}
      </p>
      <div className="flex flex-col gap-1.5">
        {question.options.map((opt) => {
          const isSelected = selected === opt.dosha;
          return (
            <button
              type="button"
              key={opt.dosha}
              data-ocid={`opt-${question.id}-${opt.dosha}`}
              onClick={() => onSelect(opt.dosha)}
              className={`text-xs px-3 py-2 rounded-lg text-left border transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
