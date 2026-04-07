const Footer = () => {
  return (
    <footer className="bg-surface-container-lowest py-16 md:py-20 px-4 md:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-12">
        <div className="col-span-2">
          <span className="text-2xl font-black text-blue-300 font-headline mb-4 md:mb-6 block">
            Alchemist AI
          </span>
          <p className="text-slate-500 max-w-xs leading-relaxed text-sm md:text-base">
            The high-end AI platform for technical interview distillation and human potential acceleration.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-on-surface mb-4 md:mb-6 text-sm md:text-base">Product</h4>
          <ul className="space-y-2 md:space-y-4 text-slate-500 text-sm">
            <li>
              <span className="hover:text-primary transition-colors cursor-default">Interviews</span>
            </li>
            <li>
              <span className="hover:text-primary transition-colors cursor-default">Resume Sync</span>
            </li>
            <li>
              <span className="hover:text-primary transition-colors cursor-default">Deep Analytics</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-on-surface mb-4 md:mb-6 text-sm md:text-base">Company</h4>
          <ul className="space-y-2 md:space-y-4 text-slate-500 text-sm">
            <li>
              <span className="hover:text-primary transition-colors cursor-default">About</span>
            </li>
            <li>
              <span className="hover:text-primary transition-colors cursor-default">Careers</span>
            </li>
            <li>
              <span className="hover:text-primary transition-colors cursor-default">Privacy</span>
            </li>
          </ul>
        </div>
        <div className="col-span-2">
          <h4 className="font-bold text-on-surface mb-4 md:mb-6 text-sm md:text-base">Stay Distilled</h4>
          <form
            className="flex flex-col sm:flex-row gap-2"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <label className="sr-only" htmlFor="footer-email">
              Email address
            </label>
            <input
              id="footer-email"
              className="bg-surface-container-high border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary text-on-surface w-full text-sm md:text-base"
              placeholder="Email address"
              type="email"
            />
            <button
              type="submit"
              className="bg-primary/10 text-primary px-6 py-3 rounded-xl font-bold hover:bg-primary/20 transition-colors text-sm md:text-base"
            >
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 md:mt-20 pt-6 md:pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        <p className="text-slate-600 text-xs md:text-sm">© 2024 Alchemist AI. Elite Distillation.</p>
        <div className="flex gap-4 md:gap-8">
          <button
            type="button"
            className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-primary transition-colors text-base md:text-lg"
            aria-label="Share"
          >
            share
          </button>
          <button
            type="button"
            className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-primary transition-colors text-base md:text-lg"
            aria-label="Contact"
          >
            alternate_email
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

