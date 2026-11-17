
import { useEffect } from "react";
import { Link } from "react-router-dom";

const About = () => {
  const SERVER_URL = (
    import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
  ).replace(/\/+$/, "");

  useEffect(() => {
    const elements = document.querySelectorAll(".about-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("about-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page min-h-screen bg-[#FDFBF7] text-stone-800 font-sans">
      <style>{`
        .about-page {
          animation: aboutPageEnter 0.7s ease both;
        }

        @keyframes aboutPageEnter {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .about-reveal {
          opacity: 0;
          transform: translateY(35px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .about-reveal.about-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .about-image {
          transition: transform 1s cubic-bezier(0.2, 0.7, 0.2, 1);
        }

        .about-image:hover {
          transform: scale(1.035);
        }

        .about-card {
          transition:
            transform 0.4s ease,
            box-shadow 0.4s ease,
            border-color 0.4s ease;
        }

        .about-card:hover {
          transform: translateY(-9px);
          box-shadow: 0 18px 35px rgba(120, 75, 30, 0.12);
          border-color: rgba(180, 120, 50, 0.45);
        }

        .about-icon {
          transition: transform 0.45s ease, background 0.35s ease;
        }

        .about-card:hover .about-icon {
          transform: rotate(-8deg) scale(1.1);
        }

        .about-hero-badge {
          animation: badgeEnter 0.8s ease both;
        }

        @keyframes badgeEnter {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .about-hero-title {
          animation: titleEnter 0.9s ease 0.15s both;
        }

        @keyframes titleEnter {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .about-hero-description {
          animation: titleEnter 0.9s ease 0.3s both;
        }

        @media (prefers-reduced-motion: reduce) {
          .about-page *,
          .about-page *::before,
          .about-page *::after {
            animation: none !important;
            transition: none !important;
            scroll-behavior: auto !important;
          }

          .about-reveal {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section className="overflow-hidden bg-amber-100/40 border-b border-stone-200/80 px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="about-hero-badge inline-block rounded-full bg-amber-100/80 border border-amber-200/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-900">
            About Our Studio
          </p>

          <h1 className="about-hero-title text-4xl font-serif font-bold text-stone-900 md:text-6xl tracking-wide leading-tight">
            Furniture That Makes <br />
            <span className="text-amber-800">Your House a Home</span>
          </h1>

          <p className="about-hero-description mx-auto max-w-2xl text-base text-stone-600 sm:text-lg leading-relaxed">
            We bring comfort, quality, and artisan woodworking together to make
            your living space feel truly extraordinary.
          </p>
        </div>
      </section>

      {/* About Content Section */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:py-20 md:grid-cols-2">

        {/* Left Image Showcase */}
        <div className="about-reveal relative overflow-hidden rounded-3xl">
          <div className="absolute -inset-2 bg-linear-to-tr from-amber-200/40 to-stone-200/40 rounded-3xl blur-md -z-10"></div>

          <img
            src={`${SERVER_URL}/uploads/Unit.jpeg`}
            alt="Beautiful modern living room setup"
            className="about-image h-80 w-full rounded-2xl object-cover shadow-xl border border-stone-200/80 md:h-120"
            loading="eager"
          />
        </div>

        {/* Right Details */}
        <div className="about-reveal space-y-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-800">
              Who We Are
            </p>

            <h2 className="text-3xl font-serif font-bold text-stone-900 md:text-4xl tracking-wide">
              Welcome to CraftStudio
            </h2>
          </div>

          <p className="leading-relaxed text-stone-600 text-sm sm:text-base">
            Our showroom is dedicated to helping you find handcrafted furniture
            that perfectly balances your aesthetic tastes, comfort, and everyday
            functionality.
          </p>

          <p className="leading-relaxed text-stone-600 text-sm sm:text-base">
            From elegant wooden sofas and minimalist beds to dining tables and
            modern storage units, we aim to transform every corner of your
            living space.
          </p>

          {/* Quick Value Props Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="about-card rounded-xl bg-white border border-stone-200/80 p-5 shadow-xs">
              <h3 className="text-lg font-serif font-bold text-amber-900">
                Quality Wood
              </h3>

              <p className="mt-1 text-xs text-stone-500 leading-relaxed font-medium">
                Artisanal craftsmanship built for generations.
              </p>
            </div>

            <div className="about-card rounded-xl bg-white border border-stone-200/80 p-5 shadow-xs">
              <h3 className="text-lg font-serif font-bold text-amber-900">
                True Comfort
              </h3>

              <p className="mt-1 text-xs text-stone-500 leading-relaxed font-medium">
                Ergonomic designs made for modern living.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Grid */}
      <section className="bg-white border-t border-stone-200/80 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl text-center">
          <div className="about-reveal">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
              Our Core Values
            </p>

            <h2 className="mb-4 text-3xl font-serif font-bold text-stone-900 md:text-4xl">
              Why Choose CraftStudio?
            </h2>

            <p className="mx-auto mb-12 max-w-2xl text-sm sm:text-base text-stone-600 leading-relaxed">
              We focus on durable materials, thoughtful interior design, and
              providing an exceptional showroom experience.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 md:grid-cols-3">

            {/* Card 1 */}
            <div className="about-reveal about-card rounded-2xl border border-stone-200/80 bg-[#FDFBF7] p-8 text-left">
              <div className="about-icon mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100/70 border border-amber-200/60 text-2xl text-amber-800">
                🪑
              </div>

              <h3 className="mb-2 text-xl font-serif font-bold text-stone-900">
                Stylish Designs
              </h3>

              <p className="text-sm leading-relaxed text-stone-600">
                Timeless wooden pieces tailored for both contemporary and
                classic living interiors.
              </p>
            </div>

            {/* Card 2 */}
            <div className="about-reveal about-card rounded-2xl border border-stone-200/80 bg-[#FDFBF7] p-8 text-left">
              <div className="about-icon mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100/70 border border-amber-200/60 text-2xl text-amber-800">
                ✨
              </div>

              <h3 className="mb-2 text-xl font-serif font-bold text-stone-900">
                Quality First
              </h3>

              <p className="text-sm leading-relaxed text-stone-600">
                We prioritize premium wood finishes, structural integrity, and
                ergonomic usability.
              </p>
            </div>

            {/* Card 3 */}
            <div className="about-reveal about-card rounded-2xl border border-stone-200/80 bg-[#FDFBF7] p-8 text-left">
              <div className="about-icon mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100/70 border border-amber-200/60 text-2xl text-amber-800">
                🤝
              </div>

              <h3 className="mb-2 text-xl font-serif font-bold text-stone-900">
                Dedicated Support
              </h3>

              <p className="text-sm leading-relaxed text-stone-600">
                Our design advisors guide you step-by-step to choose the ideal
                pieces for your home.
              </p>
            </div>
          </div>

          {/* Bottom Call to Action */}
          <div className="about-reveal mt-12">
            <Link
              to="/product"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-800 hover:bg-amber-900 px-8 py-3.5 font-medium text-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]"
            >
              Explore Furniture Catalog →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;