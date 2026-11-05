
import {
  ShieldCheck,
  Truck,
  Headset,
  BadgeCheck,
  Heart,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef } from "react";

const WhyChooseUs = () => {
  const sectionRef = useRef(null);

  const features = [
    {
      icon: BadgeCheck,
      title: "Premium Quality",
      description:
        "We use high-quality materials to create durable, comfortable, and beautiful furniture for your home.",
    },
    {
      icon: Truck,
      title: "Free Delivery",
      description:
        "Enjoy convenient delivery on eligible orders and get your favorite furniture delivered to your doorstep.",
    },
    {
      icon: ShieldCheck,
      title: "Trusted & Secure",
      description:
        "Shop with confidence with reliable service, secure ordering, and transparent product information.",
    },
    {
      icon: Headset,
      title: "Customer Support",
      description:
        "Our friendly team is here to help you choose the right furniture and answer your questions.",
    },
    {
      icon: Heart,
      title: "Made for Comfort",
      description:
        "Discover furniture designed to bring comfort, functionality, and warmth to your everyday living.",
    },
    {
      icon: Sparkles,
      title: "Modern Designs",
      description:
        "Explore timeless styles and modern designs that make every corner of your home feel special.",
    },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("why-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    section.querySelectorAll(".why-reveal").forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="why-section overflow-hidden bg-[#FDFBF7] px-4 py-16 font-sans text-stone-800 sm:px-6 lg:px-12 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="why-reveal mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-3 inline-block rounded-full border border-amber-200/60 bg-amber-100/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-900">
            WHY CHOOSE US
          </span>

          <h2 className="text-3xl font-serif font-bold tracking-wide text-stone-900 sm:text-4xl lg:text-5xl">
            Furniture That Makes <br />
            <span className="text-amber-800">
              Your House a Home
            </span>
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base">
            We believe great furniture is more than just design.
            It is about quality, comfort, trust, and creating
            beautiful spaces for the people you love.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                style={{ "--feature-index": index }}
                className="why-reveal why-feature-card group flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-7 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-amber-700/40 hover:shadow-xl sm:p-8"
              >
                <div>
                  {/* Icon */}
                  <div className="why-icon mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-100/70 text-amber-800 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:border-amber-800 group-hover:bg-amber-800 group-hover:text-white">
                    <Icon size={26} strokeWidth={1.8} />
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-xl font-serif font-bold text-stone-900 transition-colors duration-300 group-hover:text-amber-900">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-stone-600">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom Accent */}
                <div className="mt-6 h-1 w-10 rounded-full bg-amber-200 transition-all duration-500 group-hover:w-20 group-hover:bg-amber-800" />
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="why-reveal why-banner relative mt-16 overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 px-6 py-10 text-center shadow-xl sm:px-10 sm:py-12">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-amber-700/20" />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full border border-amber-700/20" />

          <div className="relative z-10">
            <h3 className="text-2xl font-serif font-bold text-white sm:text-3xl">
              Your Dream Home Starts Here
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-stone-400 sm:text-base">
              Find furniture that matches your style, fits your
              lifestyle, and makes your home truly yours.
            </p>

            <a
              href="/product"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-amber-800 px-8 py-3.5 font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-900/30"
            >
              Explore Our Collection →
            </a>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        .why-reveal {
          opacity: 0;
          transform: translateY(40px);
          transition:
            opacity 0.8s ease,
            transform 0.8s ease;
        }

        .why-reveal.why-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .why-feature-card {
          transition-delay: calc(var(--feature-index, 0) * 100ms);
        }

        .why-banner {
          transition-duration: 1s;
        }

        .why-icon {
          transition:
            transform 0.5s ease,
            background-color 0.5s ease,
            color 0.5s ease;
        }

        @media (prefers-reduced-motion: reduce) {
          .why-reveal,
          .why-feature-card,
          .why-icon {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default WhyChooseUs;
