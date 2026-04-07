const SetupHeader = ({ onOpenSidebar }) => {
  return (
    <header className="w-full top-0 sticky z-30 bg-slate-950/60 backdrop-blur-xl shadow-[0_20px_50px_rgba(11,19,38,0.3)] flex justify-between items-center px-4 md:px-8 py-4">
      <div className="flex items-center gap-4 md:gap-8">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-white/5"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-2xl font-bold tracking-tighter bg-gradient-to-br from-blue-300 to-blue-600 bg-clip-text text-transparent font-headline">
          Setup
        </h2>
        <div className="hidden lg:flex gap-6">
          <span className="font-headline tracking-tight text-blue-400 border-b-2 border-blue-400 pb-1">Dashboard</span>
          <span className="font-headline tracking-tight text-slate-400 hover:text-slate-200 transition-colors">Interviews</span>
          <span className="font-headline tracking-tight text-slate-400 hover:text-slate-200 transition-colors">Analytics</span>
          <span className="font-headline tracking-tight text-slate-400 hover:text-slate-200 transition-colors">Library</span>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <button type="button" className="p-2 rounded-lg text-slate-400 hover:bg-white/5 transition-all active:scale-90">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button type="button" className="p-2 rounded-lg text-slate-400 hover:bg-white/5 transition-all active:scale-90">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
};

export default SetupHeader;
