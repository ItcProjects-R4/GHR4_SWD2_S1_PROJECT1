import { useState, useEffect, useRef } from "react";
import { getSavedIds } from "@/data/restaurants";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  UtensilsCrossed,
  MapPin,
  ChevronDown,
  Settings,
} from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset || 0;
      setIsAtTop(y < 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { to: "/", label: "Home", icon: null },
    { to: "/explore", label: "Explore", icon: MapPin },
  ];

  const isActive = (path) => location.pathname === path;

  const isHome = location.pathname === "/";
  const isRestaurantPage = location.pathname.startsWith("/restaurant");
  const isHeroPage = isHome || isRestaurantPage;

  // Transparent at top of home or restaurant page to reveal hero image; otherwise blurred transparent
  const navRootClass = isHeroPage && isAtTop
    ? "fixed top-0 inset-x-0 z-50 bg-transparent border-transparent shadow-none"
    : isAtTop
    ? "fixed top-0 inset-x-0 z-50 bg-transparent shadow-sm"
    : "fixed top-0 inset-x-0 z-50 bg-transparent backdrop-blur-lg shadow-sm";

  // Links: white text when navbar is transparent over hero, otherwise dark text
  const linkBase = (active) => {
    if (isHeroPage && isAtTop) {
      return active ? "text-orange-200 bg-orange-50/10" : "text-white hover:text-white/90 hover:bg-white/5";
    }
    return active ? "text-orange-600 bg-orange-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50";
  };

  const subtleText = isHeroPage && isAtTop ? "text-white" : "text-gray-700";

  const [savedCount, setSavedCount] = useState(() => getSavedIds(user).length);
  const profileButtonRef = useRef(null);
  const [profileDropdownCoords, setProfileDropdownCoords] = useState({ top: 0, left: 0 });
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  useEffect(() => {
    setSavedCount(getSavedIds(user).length);
  }, [user]);

  useEffect(() => {
    if (!profileMenuVisible) return;
    if (!profileOpen && profileMenuVisible) {
      const timeout = window.setTimeout(() => setProfileMenuVisible(false), 180);
      return () => window.clearTimeout(timeout);
    }
  }, [profileOpen, profileMenuVisible]);

  useEffect(() => {
    if (!mobileMenuVisible) return;
    if (!mobileOpen && mobileMenuVisible) {
      const timeout = window.setTimeout(() => setMobileMenuVisible(false), 220);
      return () => window.clearTimeout(timeout);
    }
  }, [mobileOpen, mobileMenuVisible]);

  useEffect(() => {
    if (!profileOpen || !profileButtonRef.current) return;
    const updatePosition = () => {
      const rect = profileButtonRef.current.getBoundingClientRect();
      const dropdownWidth = 192;
      const rightInset = window.innerWidth - rect.right;
      const left = rightInset < dropdownWidth
        ? Math.max(16, rect.left + rect.width - dropdownWidth)
        : rect.right - dropdownWidth;

      setProfileDropdownCoords({
        top: rect.bottom + 8,
        left,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [profileOpen]);

  useEffect(() => {
    const onSavedUpdated = () => setSavedCount(getSavedIds(user).length);
    const onStorage = (e) => {
      if (!e.key) {
        // some calls clear all; refresh anyway
        setSavedCount(getSavedIds(user).length);
        return;
      }
      if (e.key.startsWith("savedRestaurants") || e.key.startsWith("savedRestaurantsData")) {
        setSavedCount(getSavedIds(user).length);
      }
    };

    window.addEventListener("saved-updated", onSavedUpdated);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("saved-updated", onSavedUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, [user]);

  return (
    <>
      <nav className={`${navRootClass} ${!isAtTop ? 'navbar-fade-bottom' : ''} transition-colors duration-700 overflow-visible`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
          <div className="flex items-center justify-between h-16 overflow-visible">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold hidden sm:block ${isHome && isAtTop ? 'text-white' : 'text-gray-900'}`}>
              DineFinder
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${linkBase(isActive(link.to))}`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/saved"
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${linkBase(isActive("/saved"))}`}
              >
                <Heart className="w-4 h-4" />
                <span>Saved</span>
                {savedCount > 0 && (
                  <span
                    key={`saved-${savedCount}`}
                    className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white bg-orange-500 rounded-full animate-saved-flip"
                  >
                    {savedCount}
                  </span>
                )}
              </Link>
            )}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${linkBase(isActive("/admin"))}`}
              >
                <span className="text-sm">Admin</span>
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 overflow-visible relative">
            <Link
              to="/explore"
              className={`p-2 rounded-lg transition-colors ${isHome && isAtTop ? 'text-gray-700 hover:text-gray-900 hover:bg-white/10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
              <Search className="w-5 h-5" />
            </Link>

            {isAuthenticated ? (
              <>
                <div className="relative">
                  <button
                    ref={profileButtonRef}
                    onClick={() => {
                      if (profileMenuVisible && profileOpen) {
                        setProfileOpen(false);
                      } else {
                        setProfileMenuVisible(true);
                        setProfileOpen(true);
                      }
                    }}
                    className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-full transition-colors ${isHome && isAtTop ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-100 transition-colors hover:bg-orange-200">
                      <User className="w-4 h-4 text-orange-700" />
                    </div>
                    <span className={`text-sm font-medium hidden sm:block ${isHome && isAtTop ? 'text-white' : subtleText}`}>
                      {user?.name || "User"}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 hidden sm:block ${isHome && isAtTop ? 'text-white/70' : 'text-gray-400'}`} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`hidden sm:block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isHome && isAtTop ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => {
                if (mobileMenuVisible && mobileOpen) {
                  setMobileOpen(false);
                } else {
                  setMobileMenuVisible(true);
                  setMobileOpen(true);
                }
              }}
              className={`md:hidden p-2 rounded-lg ${isHome && isAtTop ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}>
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>

    {profileMenuVisible && (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
        <div
          className={`fixed w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-[10000] ${profileOpen ? 'animate-dropdown-enter' : 'animate-dropdown-exit'}`}
          style={{ top: profileDropdownCoords.top, left: profileDropdownCoords.left }}
        >
          <Link
            to="/profile"
            onClick={() => setProfileOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <button
            onClick={() => {
              logout();
              setProfileOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-100 w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </>
    )}

    {mobileMenuVisible && (
      <div className={`fixed inset-x-0 top-16 z-[9998] border-t border-gray-100 bg-white shadow-2xl ${mobileOpen ? 'animate-menu-enter' : 'animate-menu-exit'}`}>
        <div className="px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive(link.to)
                  ? "text-orange-600 bg-orange-50"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {link.icon && <link.icon className="w-4 h-4" />}
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <Link
                to="/saved"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive("/saved")
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Heart className="w-4 h-4" />
                Saved
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive("/profile")
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive("/admin")
                      ? "text-orange-600 bg-orange-50"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    )}
  </>
  );
}
