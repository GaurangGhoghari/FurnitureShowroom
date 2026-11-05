// import { Link } from "react-router-dom";

// const categories = [
//   {
//     id: 1,
//     name: "Sofas",
//     description: "Relax in comfort",
//     image:
//       "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80",
//   },
//   {
//     id: 2,
//     name: "Chairs",
//     description: "Style every corner",
//     image:
//       "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=700&q=80",
//   },
//   {
//     id: 3,
//     name: "Beds",
//     description: "Rest beautifully",
//     image:
//       "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80",
//   },
//   {
//     id: 4,
//     name: "Dining Tables",
//     description: "Gather around in style",
//     image:
//       "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=700&q=80",
//   },
// ];

// const CategorySection = () => {
//   return (
//     <section className="bg-white px-6 py-16 sm:px-10 lg:px-16 lg:py-20 font-sans text-stone-800">
//       <div className="mx-auto max-w-7xl">

//         {/* Section Heading */}
//         <div className="mb-12 text-center">
//           <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
//             Explore Our Collection
//           </p>

//           <h2 className="text-3xl font-serif font-bold tracking-wide text-stone-900 sm:text-4xl">
//             Shop By Category
//           </h2>

//           <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
//             Discover furniture for every room and create a space that
//             reflects your style, comfort, and personality.
//           </p>
//         </div>

//         {/* Category Cards */}
//         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
//           {categories.map((category) => (
//             <Link
//               key={category.id}
//               to="/product"
//               className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-[#FDFBF7] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-700/40"
//             >
//               {/* Category Image */}
//               <div className="overflow-hidden">
//                 <img
//                   src={category.image}
//                   alt={category.name}
//                   loading="lazy"
//                   className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
//                 />
//               </div>

//               {/* Category Details */}
//               <div className="flex items-center justify-between gap-3 p-5">
//                 <div>
//                   <h3 className="text-lg font-serif font-bold text-stone-900 transition group-hover:text-amber-800">
//                     {category.name}
//                   </h3>

//                   <p className="mt-1 text-xs text-stone-500 font-medium">
//                     {category.description}
//                   </p>
//                 </div>

//                 <span
//                   aria-hidden="true"
//                   className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100/70 border border-amber-200/60 text-sm text-amber-900 transition-all duration-200 group-hover:bg-amber-800 group-hover:text-white"
//                 >
//                   →
//                 </span>
//               </div>
//             </Link>
//           ))}
//         </div>

//         {/* View All Button */}
//         <div className="mt-12 text-center">
//           <Link
//             to="/product"
//             className="inline-flex items-center gap-2 rounded-xl bg-amber-800 hover:bg-amber-900 px-7 py-3.5 font-medium text-white shadow-sm hover:shadow transition-all duration-200 active:scale-[0.99]"
//           >
//             View All Furniture
//             <span aria-hidden="true">→</span>
//           </Link>
//         </div>

//       </div>
//     </section>
//   );
// };

// export default CategorySection;