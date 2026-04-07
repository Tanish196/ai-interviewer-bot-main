import { Link } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', to: '/dashboard' },
  { label: 'Active Sessions', icon: 'mic_external_on', to: '/interview' },
  { label: 'Progress', icon: 'groups', to: '/progress' },
  { label: 'Feedback', icon: 'insights', to: '/feedback' },
  { label: 'Resume Analyzer', icon: 'description', to: '/resume' },
];

const SetupSidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-slate-900/40 backdrop-blur-md shadow-[40px_0_60px_-15px_rgba(11,19,38,0.5)] border-r border-white/5 z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-on-primary-container">temp_preferences_custom</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-blue-300 font-headline tracking-tighter">Alchemist AI</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Elite Distillation</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 mt-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-4 px-6 py-3 transition-all duration-200 group ${
                  item.label === 'Active Sessions'
                    ? 'bg-gradient-to-r from-blue-500/20 to-transparent text-blue-300 border-l-4 border-blue-400'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  {item.icon}
                </span>
                <span className="font-headline font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="px-6 mt-10">
            <Link
              to="/interview"
              onClick={onClose}
              className="w-full inline-flex items-center justify-center py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            >
              New Interview
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default SetupSidebar;