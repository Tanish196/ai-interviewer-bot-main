const EditorialQuoteSection = () => {
  return (
    <section className="py-32 md:py-44 px-4 md:px-8 overflow-hidden relative">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-square bg-primary/5 blur-[120px] rounded-full" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <span className="material-symbols-outlined text-primary text-5xl md:text-6xl opacity-20 mb-8 md:mb-12 block">
          format_quote
        </span>
        <blockquote className="font-headline text-3xl md:text-5xl font-light italic text-on-surface leading-tight mb-8 md:mb-12">
          &quot;Alchemist AI didn&apos;t just give me questions; it gave me the{' '}
          <span className="text-primary not-italic font-bold">confidence</span> to articulate my value in ways I
          hadn&apos;t thought possible. I landed my dream role at Stripe within three weeks.&quot;
        </blockquote>
        <div className="flex items-center justify-center gap-4">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden border border-primary/20">
            <img
              alt="Customer testimonial headshot"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMHYjMdWA-WxXmsRmMl-615CowVvQOTDPBkrg0hRsMqYB_tiaQPYRkwp5dveqPkfzkjIN9ZdXUWR90tIIZ73FK4adbIYT9MbSeKUqmfR9gw3-aKPPi5R_Qbv_qYTrqMo-48FGNkWgfzidmMK5lxxIcA6xyPlVu03xXgV67w1iQoFEMQbIMsYAWy0u3kxZj68mEQkm2NMqRMHIN8MrFEQx0vlCqK5mkzsQJVgVfjGd9Ekf0jmsBq02FPgYYpjqu3DhTnC5CBUzrJUc"
            />
          </div>
          <div className="text-left">
            <p className="font-bold text-on-surface text-sm md:text-base">Marcus Chen</p>
            <p className="text-[11px] md:text-sm text-slate-500 uppercase tracking-widest">
              Senior Software Architect
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorialQuoteSection;

