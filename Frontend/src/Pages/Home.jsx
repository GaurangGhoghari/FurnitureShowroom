import { Link } from "react-router-dom";

import HeroSection from "../component/Home/HeroSection";
// import CategorySection from "../component/Home/CategorySection";
import FeaturedProducts from "../component/Home/FeaturedProducts";
import WhyChooseUs from "../component/Home/WhyChooseUs";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#FFF8F5]">

      <main>
        <HeroSection />
        {/* <CategorySection/> */}
        <FeaturedProducts/>
        <WhyChooseUs/>
      </main>

    </div>
  );
};

export default Home;


// import { useEffect } from "react";

// import HeroSection from "../component/Home/HeroSection";
// import FeaturedProducts from "../component/Home/FeaturedProducts";
// import WhyChooseUs from "../component/Home/WhyChooseUs";

// const Home = () => {
//   useEffect(() => {
//     const sections = document.querySelectorAll(".home-reveal");

//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             entry.target.classList.add("home-visible");
//             observer.unobserve(entry.target);
//           }
//         });
//       },
//       {
//         threshold: 0.12,
//       }
//     );

//     sections.forEach((section) => observer.observe(section));

//     return () => observer.disconnect();
//   }, []);

//   return (
//     <>
//       <style>{`
//         @keyframes homeFadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(25px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .home-page {
//           animation: homeFadeIn 0.8s ease-out both;
//         }

//         .home-reveal {
//           opacity: 0;
//           transform: translateY(45px);
//           transition:
//             opacity 0.8s ease,
//             transform 0.8s cubic-bezier(.2,.8,.2,1);
//         }

//         .home-reveal.home-visible {
//           opacity: 1;
//           transform: translateY(0);
//         }

//         @media (prefers-reduced-motion: reduce) {
//           .home-page,
//           .home-reveal,
//           .home-reveal.home-visible {
//             animation: none !important;
//             opacity: 1 !important;
//             transform: none !important;
//             transition: none !important;
//           }
//         }
//       `}</style>

//       <div className="home-page min-h-screen overflow-hidden bg-[#FFF8F5]">
//         <main>
//           {/* Hero Section */}
//           <section>
//             <HeroSection />
//           </section>

//           {/* Featured Products */}
//           <section className="home-reveal">
//             <FeaturedProducts />
//           </section>

//           {/* Why Choose Us */}
//           <section className="home-reveal">
//             <WhyChooseUs />
//           </section>
//         </main>
//       </div>
//     </>
//   );
// };

// export default Home;
