const CTASection = () => {
  return (
    <section className="pb-20 md:pb-32 px-4 md:px-8">
      <div className="max-w-7xl mx-auto rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-br from-surface-container-high to-surface-container-lowest p-10 md:p-16 lg:p-20 border border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-primary/10 blur-[100px] rounded-full translate-x-1/4" />
        <div className="relative z-10 max-w-2xl">
          <h2 className="font-headline text-3xl md:text-5xl lg:text-6xl font-extrabold text-on-surface mb-6 md:mb-8">
            Ready to distill
            <br />
            your potential?
          </h2>
          <p className="text-base md:text-xl text-on-surface-variant mb-8 md:mb-12 leading-relaxed">
            Join 50,000+ developers, designers, and product leaders who used Alchemist AI to secure offers from
            top-tier tech companies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-start sm:items-center">
            <button
              type="button"
              className="cta-gradient btn-hover-lift w-full sm:w-auto px-10 md:px-12 py-4 md:py-6 rounded-xl font-bold text-on-primary text-base md:text-lg shadow-2xl transition-transform hover:scale-105 active:scale-95"
            >
              Get Early Access
            </button>
            <div className="flex items-center gap-4 text-on-surface-variant px-0 sm:px-4">
              <div className="flex -space-x-3">
                <img
                  alt="User avatar"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-surface"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRvwCuwyrfK24T78v-zP_huchaz2mrWmu9KG3A06w1xJKRej9nFjxey1-iChHZeffnq_LhXVFp8NredCPmAMhLTaWeQ4M-Bd5RbuTZZ3WoJLb2lrOEuoWvh56oHoEqbVAkC2ZmwZMJ-uEU4qJVSR30NN9m7YfP-I0elYGI_pKtzHY_-x9OfUs7THSd4ZzKk9dX1eWEqihEKciMj7esuKqzTN7THNsrlyjhSmts7Mm7zMyX2XKCZfoPNhohBdz93t_lwK3rKCc_vaM"
                />
                <img
                  alt="User avatar"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-surface"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFYs4HuY3CDjInARhm4ZVjHvK2xWrnjLD8HmjvP8p9sAkjseV3fnnnPbpGeuQbLQ0iwIBh8daEeEw1xCHZ3ENQj3TZ6RdK4hXQ56rD9luOH2VdfbkLOuHNrDwjebVXtKhw7_yi-WqPLIHVHQNrTIUgN0mr4JOKwgzEXwwB1m1t8cWy5AbcgARJPHJDIl9giHzznQWbbk7dpHWBpxUIyrVnB6FNMAcVxFVVF5cwXoHUhJa9Y36_7cUzTTCFHAZceB3xxv5_zZibaIY"
                />
                <img
                  alt="User avatar"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-surface"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSkKkCQG3lbXhV-T3xvTNu8wH0qEjSvQugAIoGa48K6punrra2xaigdl6pBPCEldMsS5CAIrXui6uKkl8C6jdmhG90cWqL6_Fi1mc9x22S-aBpmAuaY6Nzb5DeSqexU_k248knnuPA3XAVIoN7QO20ZcGhq1koeXbID6GBWg_7IYlGq_uWKGd80ev_RIskILRCjFjfmyB5pxpl-8CWChXWQJce4W1kQFFy0NryzpwUJWP0Umxw1H47kcbt1r8yHtCzRESIUiM34nY"
                />
              </div>
              <span className="text-xs md:text-sm font-medium">Trusted by elite candidates</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

