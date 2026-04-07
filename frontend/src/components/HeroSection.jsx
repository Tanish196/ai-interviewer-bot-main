import { useNavigate, Link } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleStartInterview = () => {
    navigate('/interview');
  };

  return (
    <section className="relative pt-24 md:pt-32 pb-24 md:pb-40 px-4 md:px-8 liquid-ether-bg">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high/40 backdrop-blur-md mb-6 md:mb-8 border border-white/5">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#a8c8ff]" />
            <span className="text-xs font-label uppercase tracking-widest text-primary">
              Now Distilling Talent
            </span>
          </div>
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-on-surface leading-[1.1] mb-6 md:mb-8">
            Crack Your <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
              Interviews
            </span>{' '}
            with AI
          </h1>
          <p className="text-base md:text-xl text-on-surface-variant max-w-xl mb-8 md:mb-12 leading-relaxed">
            Transform raw anxiety into technical mastery. Our AI alchemist distills thousands of high-stakes
            interview patterns into a personalized training path.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 sm:items-center">
            <button
              type="button"
              onClick={handleStartInterview}
              className="cta-gradient btn-hover-lift w-full sm:w-auto text-center px-8 md:px-10 py-4 md:py-5 rounded-xl font-bold text-on-primary shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Start Mock Interview
            </button>
            <Link
              to="/login"
              className="bg-surface-container-highest/40 btn-hover-lift w-full sm:w-auto text-center backdrop-blur-md px-8 md:px-10 py-4 md:py-5 rounded-xl font-bold text-on-surface border border-white/10 hover:bg-surface-container-highest transition-all"
            >
              View Demo
            </Link>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-4 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-all duration-700" />
          <div className="glass-card rounded-[2rem] p-4 border border-white/10 relative overflow-hidden aspect-video">
            <img
              alt="Interview interface preview"
              className="w-full h-full object-cover rounded-[1.5rem] opacity-80"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsWGo032xAYIh-c2oi4T9RzJ9D__fjUZQsMhkHdfvk7aL2CgOWDdOCRqQJyVJpyG9m1ShbjRlp2WDJ7CGSlcgpelcEuGAQAvWZdej8EfbZneScvRj9npYjyy6u1H_juh5u8oWbFaegZwxEkJoGYeQeFeARgIcXNGG9ZHnjG5M_IbRD4yQNAMbyRYBKlgnLnyIJW8NZ_5G4BTfbyuyDimqUKzElpLb7zAa96bhyAer-becqLCBIuzw2PaD71psg80LG2kR4e2qCZRI"
            />
            <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 flex justify-between items-end gap-4">
              <div className="glass-card px-4 md:px-6 py-3 md:py-4 rounded-xl border border-white/10">
                <p className="text-[10px] md:text-xs font-label uppercase text-slate-400 mb-1">Sentiment</p>
                <p className="text-sm md:text-lg font-bold text-primary">Highly Confident</p>
              </div>
              <div className="h-20 md:h-24 w-32 md:w-40 glass-card rounded-xl border border-white/10 p-3 md:p-4 flex items-end gap-1">
                <div className="w-2 bg-primary/40 h-10 md:h-12 rounded-full" />
                <div className="w-2 bg-primary/60 h-14 md:h-16 rounded-full" />
                <div className="w-2 bg-primary h-16 md:h-20 rounded-full" />
                <div className="w-2 bg-primary/60 h-12 md:h-14 rounded-full" />
                <div className="w-2 bg-primary/40 h-8 md:h-10 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

