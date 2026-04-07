const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 lg:py-28 px-4 md:px-8 bg-surface-container-low/30 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-20 gap-6 md:gap-8">
          <div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-3 md:mb-4">
              Precision Engineering for Professionals
            </h2>
            <p className="text-on-surface-variant max-w-xl text-sm md:text-base">
              Every feature is designed to simulate the intensity of a real-world interview environment while
              providing a safe space for growth.
            </p>
          </div>
          <span className="font-label text-slate-500 uppercase tracking-widest text-xs md:text-sm">
            Feature Protocol v4.0
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          <div className="md:col-span-8 glass-card rounded-[2rem] p-8 md:p-10 border border-white/5 group hover:bg-surface-container-high/60 transition-all duration-500">
            <div className="flex justify-between items-start mb-8 md:mb-12">
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl md:text-3xl">
                  psychology
                </span>
              </div>
              <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">
                north_east
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-headline font-bold mb-3 md:mb-4">
              AI Dynamic Questioning
            </h3>
            <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-md">
              Our neural engine listens to your responses and pivots the interview difficulty in real-time, just
              like a senior lead engineer would.
            </p>
          </div>

          <div className="md:col-span-4 glass-card rounded-[2rem] p-8 md:p-10 border border-white/5 group hover:bg-surface-container-high/60 transition-all duration-500">
            <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-tertiary/10 flex items-center justify-center mb-8 md:mb-12">
              <span className="material-symbols-outlined text-tertiary text-2xl md:text-3xl">
                visibility
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-headline font-bold mb-3 md:mb-4">Behavior Tracking</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              Micro-expression analysis and tone distillation to perfect your executive presence.
            </p>
          </div>

          <div className="md:col-span-4 glass-card rounded-[2rem] p-8 md:p-10 border border-white/5 group hover:bg-surface-container-high/60 transition-all duration-500">
            <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-8 md:mb-12">
              <span className="material-symbols-outlined text-secondary text-2xl md:text-3xl">
                analytics
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-headline font-bold mb-3 md:mb-4">Deep Analytics</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              Granular breakdowns of technical accuracy, response latency, and keyword density.
            </p>
          </div>

          <div className="md:col-span-8 glass-card rounded-[2rem] p-8 md:p-10 border border-white/5 group hover:bg-surface-container-high/60 transition-all duration-500">
            <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center">
              <div className="flex-1">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-primary-container/20 flex items-center justify-center mb-6 md:mb-8">
                  <span className="material-symbols-outlined text-primary-fixed text-2xl md:text-3xl">
                    sync
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-headline font-bold mb-3 md:mb-4">
                  Resume Intelligence Sync
                </h3>
                <p className="text-on-surface-variant text-base md:text-lg leading-relaxed">
                  Upload your PDF once. Our AI maps every interview question specifically to your project history
                  and stated expertise.
                </p>
              </div>
              <div className="w-full md:w-64 h-40 md:h-48 bg-surface-container-lowest rounded-2xl border border-white/5 overflow-hidden p-4">
                <div className="space-y-3">
                  <div className="h-2 w-3/4 bg-white/5 rounded" />
                  <div className="h-2 w-1/2 bg-white/5 rounded" />
                  <div className="h-2 w-full bg-primary/20 rounded" />
                  <div className="h-2 w-2/3 bg-white/5 rounded" />
                  <div className="h-2 w-5/6 bg-white/5 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

