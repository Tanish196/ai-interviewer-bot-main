import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="w-full top-0 sticky z-50 bg-slate-950/60 backdrop-blur-xl shadow-[0_20px_50px_rgba(11,19,38,0.3)]">
      <div className="flex justify-between items-center px-6 md:px-8 py-4 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tighter bg-gradient-to-br from-blue-300 to-blue-600 bg-clip-text text-transparent font-headline"
          >
            Alchemist AI
          </Link>
          <div className="hidden md:flex items-center gap-6 font-headline tracking-tight text-slate-200 text-sm">
            <Link to="/dashboard" className="text-blue-400 border-b-2 border-blue-400 pb-1">
              Dashboard
            </Link>
            <Link to="/interview" className="text-slate-400 hover:text-slate-200 transition-colors">
              Interviews
            </Link>
            <Link to="/progress" className="text-slate-400 hover:text-slate-200 transition-colors">
              Analytics
            </Link>
            <Link to="/resume" className="text-slate-400 hover:text-slate-200 transition-colors">
              Library
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="btn-hover-lift hover:bg-white/5 transition-all duration-300 p-2 rounded-full flex items-center"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-slate-400">notifications</span>
          </button>
          <button
            type="button"
            className="btn-hover-lift hover:bg-white/5 transition-all duration-300 p-2 rounded-full flex items-center"
            aria-label="Settings"
          >
            <span className="material-symbols-outlined text-slate-400">settings</span>
          </button>
          <div className="h-10 w-10 rounded-full overflow-hidden border border-white/10">
            <img
              alt="User profile"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrHFjMNQ2NIaQA4zgj1UkpnA2B6y4n06Z_2J_3MJIbEG9Rgn4dBMVi_xieLIREVW8cdnpSKNN996GwOVPTWMrmID_SCcyUdx1uuxhKpRa2mZlMRRcMvN5C_nFGQlTiBPqD4bioGfDnnqCw3QE34CRFBxeHObywEx0DMWShJsbPADoRD3P4m9gmWLowd8tVatLZnpEBRQB72ZnembWdKo0_9Hv91gY4r8tYtUFaQ0NCXa2H_ud7WSW3A7xfJ1dKcoJsNDjpOzsjPBg"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

