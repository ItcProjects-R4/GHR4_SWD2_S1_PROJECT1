import { Link } from "react-router";
import {
  UtensilsCrossed,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">DineFinder</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Discover the best restaurants in your city. From cozy cafes to
              fine dining, find your perfect table with DineFinder.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-orange-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/explore"
                  className="text-sm hover:text-orange-400 transition-colors"
                >
                  Explore Restaurants
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-sm hover:text-orange-400 transition-colors"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Cuisines */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Popular Cuisines
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/explore?cuisine=italian"
                  className="text-sm hover:text-orange-400 transition-colors"
                >
                  Italian
                </Link>
              </li>
              <li>
                <Link
                  to="/explore?cuisine=japanese"
                  className="text-sm hover:text-orange-400 transition-colors"
                >
                  Japanese
                </Link>
              </li>
              <li>
                <Link
                  to="/explore?cuisine=mexican"
                  className="text-sm hover:text-orange-400 transition-colors"
                >
                  Mexican
                </Link>
              </li>
              <li>
                <Link
                  to="/explore?cuisine=french"
                  className="text-sm hover:text-orange-400 transition-colors"
                >
                  French
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-orange-500 shrink-0" />
                <span className="text-sm">
                  123 Foodie Lane, New York, NY 10001
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="text-sm">(555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="text-sm">hello@dinefinder.com</span>
              </li>
            </ul>
            <form
              className="mt-6 flex flex-col sm:flex-row gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="sr-only" htmlFor="footer-email">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Mail us"
                className="w-full px-4 py-3 rounded-2xl border border-gray-800 bg-gray-950 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-orange-500 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} DineFinder. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
