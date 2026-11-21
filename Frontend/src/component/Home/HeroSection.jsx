
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="hero-section overflow-hidden bg-[#FDFBF7] font-sans text-stone-800">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-8 sm:gap-10 sm:px-8 sm:py-12 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-20">

        {/* Right Side: Furniture Image */}
        <div className="hero-image-wrapper order-1 lg:order-2 min-w-0">
          <div className="relative mx-auto w-full max-w-xl">
            <div className="hero-frame absolute -right-2 -top-2 -z-10 h-full w-full rounded-2xl bg-amber-200/40 sm:-right-4 sm:-top-4"></div>

            <img
              src="https://res.cloudinary.com/wohjmtzq/image/upload/v1795152955/hero.jpg"
              alt="Furniture showroom"
              className="hero-image block aspect-[4/3] w-full rounded-2xl border border-stone-200/80 object-cover shadow-xl sm:aspect-[5/4] lg:aspect-[4/3]"
              loading="eager"
            />
          </div>
        </div>

        {/* Left Side: Hero Content */}
        <div className="hero-content order-2 min-w-0 lg:order-1">

          {/* Small Badge */}
          <div className="hero-badge mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-amber-100/70 px-3 py-2 sm:mb-6 sm:px-4">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-600"></span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-900 sm:text-sm sm:tracking-[0.18em]">
              Gaurang for Your Lifestyle
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="hero-heading max-w-2xl font-serif text-3xl font-bold leading-tight tracking-wide text-stone-900 sm:text-4xl md:text-5xl lg:text-6xl">
            Make Your Home
            <span className="hero-highlight mt-2 block text-amber-800">
              Feel Special.
            </span>
          </h1>

          {/* Description */}
          <p className="hero-description mt-4 max-w-xl text-sm leading-relaxed text-stone-600 sm:mt-6 sm:text-base lg:text-lg">
            Discover handcrafted furniture that brings comfort, elegance, and
            timeless style to your living space. Find the perfect pieces to make
            your house feel like home.
          </p>

          {/* Action Buttons */}
          <div className="hero-buttons mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
            <Link
              to="/product"
              className="hero-primary-btn inline-flex w-full items-center justify-center gap-3 rounded-xl bg-amber-800 px-5 py-3 text-sm font-medium text-white shadow-md shadow-amber-900/10 transition-all duration-300 hover:-translate-y-1 hover:bg-amber-900 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2 active:scale-[0.99] sm:w-auto sm:px-7 sm:py-4 sm:text-base"
            >
              Explore Furniture
              <span className="hero-arrow" aria-hidden="true">→</span>
            </Link>

            <Link
              to="/register"
              className="hero-secondary-btn inline-flex w-full items-center justify-center rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-700/50 hover:bg-stone-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2 sm:w-auto sm:px-7 sm:py-4 sm:text-base"
            >
              Discover Our Story
            </Link>
          </div>

          {/* Highlights */}
          <div className="hero-highlights mt-8 grid max-w-lg grid-cols-3 gap-2 border-t border-stone-200/80 pt-5 sm:mt-10 sm:gap-4 sm:pt-7">
            <div className="highlight-item min-w-0">
              <p className="font-serif text-base font-bold text-amber-900 sm:text-xl">
                Premium
              </p>
              <p className="mt-1 text-[10px] font-medium leading-4 text-stone-500 sm:text-sm sm:leading-5">
                Quality Materials
              </p>
            </div>

            <div className="highlight-item min-w-0">
              <p className="font-serif text-base font-bold text-amber-900 sm:text-xl">
                Modern
              </p>
              <p className="mt-1 text-[10px] font-medium leading-4 text-stone-500 sm:text-sm sm:leading-5">
                Elegant Designs
              </p>
            </div>

            <div className="highlight-item min-w-0">
              <p className="font-serif text-base font-bold text-amber-900 sm:text-xl">
                Comfort
              </p>
              <p className="mt-1 text-[10px] font-medium leading-4 text-stone-500 sm:text-sm sm:leading-5">
                Made for Living
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          animation: heroPageEnter 0.8s ease-out both;
        }

        .hero-content > * {
          opacity: 0;
          animation: heroFadeUp 0.8s ease-out forwards;
        }

        .hero-badge { animation-delay: 0.15s; }
        .hero-heading { animation-delay: 0.3s; }
        .hero-description { animation-delay: 0.45s; }
        .hero-buttons { animation-delay: 0.6s; }
        .hero-highlights { animation-delay: 0.75s; }

        .hero-highlight {
          animation: highlightReveal 1s ease-out 0.7s both;
        }

        .hero-image-wrapper {
          opacity: 0;
          animation: heroImageEnter 1s ease-out 0.25s forwards;
        }

        .hero-image {
          animation: imageFloat 5s ease-in-out 1.3s infinite;
          transition: transform 0.6s ease, box-shadow 0.6s ease;
        }

        .hero-image:hover {
          transform: scale(1.025);
          box-shadow: 0 25px 50px -15px rgba(120, 53, 15, 0.25);
        }

        .hero-frame {
          animation: frameReveal 1s ease-out 0.5s both;
          transition: transform 0.5s ease;
        }

        .hero-image-wrapper:hover .hero-frame {
          transform: translate(7px, -7px);
        }

        .hero-arrow {
          display: inline-block;
          transition: transform 0.3s ease;
        }

        .hero-primary-btn:hover .hero-arrow {
          transform: translateX(5px);
        }

        .highlight-item {
          opacity: 0;
          animation: heroFadeUp 0.7s ease-out forwards;
        }

        .highlight-item:nth-child(1) { animation-delay: 0.9s; }
        .highlight-item:nth-child(2) { animation-delay: 1.05s; }
        .highlight-item:nth-child(3) { animation-delay: 1.2s; }

        @keyframes heroPageEnter {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes heroFadeUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroImageEnter {
          from {
            opacity: 0;
            transform: translateX(45px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes highlightReveal {
          from {
            opacity: 0;
            transform: translateX(-15px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes frameReveal {
          from {
            opacity: 0;
            transform: translate(12px, -12px);
          }
          to {
            opacity: 1;
            transform: translate(0, 0);
          }
        }

        @keyframes imageFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @media (max-width: 640px) {
          .hero-image:hover {
            transform: none;
          }

          .hero-image-wrapper:hover .hero-frame {
            transform: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-section,
          .hero-content > *,
          .hero-image-wrapper,
          .hero-image,
          .hero-frame,
          .highlight-item,
          .hero-highlight {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          .hero-image,
          .hero-frame {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;