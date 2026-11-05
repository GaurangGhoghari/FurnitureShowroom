import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#1C1917] text-stone-300 font-sans border-t border-stone-800/80 mt-16 select-none">
      
      {/* Footer Main Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">

          {/* Company / Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="  items-center gap-3 inline-flex group">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-700 to-amber-900 text-white font-serif font-bold text-xl flex items-center justify-center shadow-md border border-amber-600/30 group-hover:scale-105 transition-transform duration-200">
                C
              </div>
              <div>
                <span className="text-xl font-serif font-bold text-amber-500 tracking-wide block leading-none">
                  CraftStudio
                </span>
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold mt-1 block">
                  Furniture Showroom
                </span>
              </div>
            </Link>

            <p className="text-stone-400 text-sm leading-relaxed max-w-md">
              Handcrafted, premium wooden furniture tailored for home, workspace, and modern luxury living environments.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-5">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-stone-400 hover:text-amber-400 transition-colors duration-200"
                >
                  Home
                </Link>
              </li>

               <li>
                <Link
                  to="/about"
                  className="text-stone-400 hover:text-amber-400 transition-colors duration-200"
                >
                 About
                </Link>
              </li>

              <li>
                <Link
                  to="/product"
                  className="text-stone-400 hover:text-amber-400 transition-colors duration-200"
                >
                  Products
                </Link>
              </li>

               <li>
                <Link
                  to="/contact"
                  className="text-stone-400 hover:text-amber-400 transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="text-stone-400 hover:text-amber-400 transition-colors duration-200"
                >
                  Register
                </Link>
              </li>

              <li>
                <Link
                  to="/login"
                  className="text-stone-400 hover:text-amber-400 transition-colors duration-200"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-5">
              Contact Studio
            </h3>

            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-center gap-2.5">
                <span className="text-amber-600">✉</span>
                <a
                  href="mailto:info@craftstudio.com"
                  className="hover:text-amber-400 transition-colors"
                >
                  info@craftstudio.com
                </a>
              </li>

              <li className="flex items-center gap-2.5">
                <span className="text-amber-600">📞</span>
                <a
                  href="tel:+919876543210"
                  className="hover:text-amber-400 transition-colors"
                >
                  +91 98765 43210
                </a>
              </li>

              <li className="flex items-center gap-2.5">
                <span className="text-amber-600">📍</span>
                <span>Gujarat, India</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="border-t border-stone-800/80 bg-stone-950/40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2026 CraftStudio Furniture Showroom. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-stone-400 transition cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-stone-400 transition cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;