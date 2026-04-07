const DomainGrid = ({ domains, selectedDomain, onSelectDomain }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mb-8 md:mb-10">
      {domains.map((domain) => {
        const isSelected = selectedDomain === domain.value;
        return (
          <button
            key={domain.value}
            type="button"
            onClick={() => onSelectDomain(domain.value)}
            className={`text-left glass-card rounded-[2rem] p-6 md:p-8 group transition-all border relative overflow-hidden hover:bg-surface-container-high hover:scale-[1.01] ${
              domain.large ? 'lg:col-span-2' : ''
            } ${
              isSelected
                ? 'border-primary/70 shadow-[0_0_32px_rgba(168,200,255,0.2)]'
                : 'border-transparent hover:border-primary/20'
            }`}
          >
            {domain.large && (
              <div className="absolute -right-8 -top-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
            )}
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8 md:mb-12">
                <span className={`material-symbols-outlined text-4xl md:text-5xl ${domain.iconColor}`}>{domain.icon}</span>
                {domain.badge ? (
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    {domain.badge}
                  </span>
                ) : null}
              </div>
              <h4 className={`${domain.large ? 'text-2xl md:text-3xl' : 'text-2xl'} font-bold font-headline mb-2`}>
                {domain.label}
              </h4>
              <p className="text-on-surface-variant text-sm max-w-sm mb-4 md:mb-6">{domain.description}</p>
              {domain.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {domain.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-surface-container-lowest rounded-lg text-xs text-on-surface-variant border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default DomainGrid;
