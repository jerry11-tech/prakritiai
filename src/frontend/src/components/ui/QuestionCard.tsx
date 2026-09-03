import type { DoshaType, Question } from "../../types/prakruti";

interface QuestionCardProps {
  question: Question;
  selected: DoshaType | null;
  onSelect: (dosha: DoshaType) => void;
  index?: number;
}

export function QuestionCard({
  question,
  selected,
  onSelect,
  index,
}: QuestionCardProps) {
  const isAnswered = selected !== null;

  return (
    <div
      id={`question-card-${question.id}`}
      data-ocid={`question-${question.id}`}
      className={`rounded-xl p-4 transition-all duration-300 border ${
        isAnswered
          ? "bg-accent/5 border-accent/30 shadow-sm"
          : "bg-muted/20 border-border/40 hover:border-border/80"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-sm font-medium text-foreground/90 leading-snug">
          {index !== undefined ? `${index + 1}. ` : ""}
          {question.text}
        </p>
        {isAnswered && (
          <span className="shrink-0 w-5 h-5 rounded-full bg-accent/20 text-accent border border-accent/40 flex items-center justify-center text-[10px] font-bold">
            ✓
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {question.options.map((opt) => {
          const isSelected = selected === opt.dosha;
          return (
            <button
              type="button"
              key={opt.dosha}
              data-ocid={`opt-${question.id}-${opt.dosha}`}
              onClick={() => onSelect(opt.dosha)}
              className={`text-xs px-3.5 py-2.5 rounded-lg text-left border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-between ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary font-semibold shadow-sm"
                  : "border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <span>{opt.label}</span>
              {isSelected && <span className="text-[10px] opacity-80">●</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
