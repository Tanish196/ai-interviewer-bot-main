const SessionInsightCard = ({ disabled, loading, onStart }) => {
  return (
    <div className="setup-insight-gradient glass-card rounded-[2rem] p-5 md:p-7 border border-primary/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <h4 className="text-xl font-bold font-headline mb-8 relative z-10">Session Insight</h4>
      <ul className="space-y-6 relative z-10">
        <li className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined inline-flex items-center justify-center leading-none text-primary text-sm">schedule</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Estimated Time</p>
            <p className="text-sm font-semibold">45 - 60 Minutes</p>
          </div>
        </li>
        <li className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <span className="material-symbols-outlined inline-flex items-center justify-center leading-none text-secondary text-sm">auto_awesome</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">AI Intensity</p>
            <p className="text-sm font-semibold">Adaptive Distillation</p>
          </div>
        </li>
        <li className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
            <span className="material-symbols-outlined inline-flex items-center justify-center leading-none text-tertiary text-sm">verified</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Output Level</p>
            <p className="text-sm font-semibold">Comprehensive Report</p>
          </div>
        </li>
      </ul>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={onStart}
        className="w-full mt-12 py-5 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-black text-lg tracking-tight shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? 'Starting...' : 'Start Distillation'}
      </button>
      <p className="text-center mt-4 text-[10px] text-on-surface-variant uppercase tracking-tighter">
        Prepare for focus mode
      </p>
    </div>
  );
};

export default SessionInsightCard;
