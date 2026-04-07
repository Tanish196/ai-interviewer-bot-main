const ConfigurationPanel = ({
  questionCount,
  onQuestionCountChange,
  difficulty,
  onDifficultyChange,
  difficulties,
}) => {
  return (
  <div className="space-y-6 md:space-y-8 w-full">
<div className="setup-card-gradient glass-card w-full p-5 md:p-7 rounded-[1.75rem] border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <label htmlFor="question-range" className="text-lg font-bold font-headline">
            Question Count
          </label>
          <span className="text-primary font-mono text-2xl font-bold">{questionCount}</span>
        </div>
        <input
          id="question-range"
          className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
          min="5"
          max="30"
          value={questionCount}
          onChange={(event) => onQuestionCountChange(Number(event.target.value))}
          type="range"
        />
        <div className="flex justify-between mt-4 text-xs text-on-surface-variant font-medium">
          <span>Quick Pulse (5)</span>
          <span>Deep Dive (30)</span>
        </div>
      </div>

      <div className="setup-card-gradient glass-card p-5 md:p-7 rounded-[1.75rem] border border-white/5">
        <label className="text-lg font-bold font-headline block mb-6">Difficulty Level</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {difficulties.map((item) => {
            const active = difficulty === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onDifficultyChange(item.value)}
                className={`p-4 rounded-xl transition-all border flex flex-col items-center justify-center text-center ${
                  active
                    ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_20px_rgba(168,200,255,0.16)]'
                    : 'bg-surface-container-highest/40 border-white/5 text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                <span className={`material-symbols-outlined inline-flex items-center justify-center leading-none mb-2 ${active ? 'text-primary' : 'text-slate-500'}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-bold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;

