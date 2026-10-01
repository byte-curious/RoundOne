import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useUserStore from "@/store/authStore";
import { logout } from "@/services/api";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, clearUser } = useUserStore();

  // Close mobile menu whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      clearUser();
      navigate("/login");
    }
  };

  const isActive = (paths: string[]) =>
    paths.some((path) => location.pathname.startsWith(path));

  // Styles for Desktop Links
  const desktopNavClass = (paths: string[]) =>
    `transition-colors text-sm font-medium hover:text-[var(--text)] ${
      isActive(paths)
        ? "text-[var(--accent)] font-semibold"
        : "text-[var(--text-muted)]"
    }`;

  // Styles for Mobile Links
  const mobileNavClass = (paths: string[]) =>
    `block w-full rounded-md px-4 py-3 text-base font-medium transition-colors ${
      isActive(paths)
        ? "bg-[var(--accent)]/10 text-[var(--accent)]"
        : "text-[var(--text-muted)] hover:bg-[var(--border)]/50 hover:text-[var(--text)]"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LEFT: Logo & Desktop Links */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <img
              src="/logo.svg?v=2"
              alt="RoundOne"
              className="h-8 w-8 rounded-lg"
            />
            <span className="text-xl font-extrabold tracking-tight text-white">
              RoundOne
            </span>
          </button>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden items-center gap-6 lg:flex">
              <Link to="/dashboard" className={desktopNavClass(["/dashboard"])}>
                Dashboard
              </Link>
              <Link
                to="/resume-upload"
                className={desktopNavClass([
                  "/resume-upload",
                  "/onboarding",
                  "/interview",
                ])}
              >
                Mock Interview
              </Link>
              <Link to="/ats-check" className={desktopNavClass(["/ats-check"])}>
                Resume Checker
              </Link>
              <Link
                to="/resume-builder"
                className={desktopNavClass(["/resume-builder"])}
              >
                Resume Builder
              </Link>
              <Link to="/learning" className={desktopNavClass(["/learning"])}>
                Learning Hub
              </Link>
              <Link to="/practice" className={desktopNavClass(["/practice"])}>
                Practice
              </Link>
              <Link to="/contact" className={desktopNavClass(["/contact"])}>
                Contact Us
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT: User Actions (Desktop) & Mobile Toggle */}
        <div className="flex items-center gap-4">
          {user && (
            <>
              {/* Desktop User Section */}
              <div className="hidden items-center gap-4 lg:flex">
                <a
                  href="https://buymeachai.ezee.li/supreme_1"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Buy me a Chai ☕"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-lg transition-colors hover:border-orange-500 hover:bg-orange-500/10"
                >
                  ☕
                </a>

                <div className="flex items-center gap-3 border-l border-[var(--border)] pl-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/20 text-sm font-bold text-[var(--accent)] border border-[var(--accent)]/30">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-[var(--text)]">
                    {user.name.split(" ")[0]}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="ml-2 text-sm font-medium text-[var(--danger)] transition-colors hover:text-red-400"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-[var(--text-muted)] hover:bg-[var(--border)]/50 hover:text-white lg:hidden transition-colors"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  // Close Icon
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  // Hamburger Icon
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {user && isMobileMenuOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] lg:hidden shadow-2xl absolute w-full">
          {/* Links */}
          <div className="space-y-1 px-4 pb-3 pt-3">
            <Link to="/dashboard" className={mobileNavClass(["/dashboard"])}>
              Dashboard
            </Link>
            <Link
              to="/resume-upload"
              className={mobileNavClass([
                "/resume-upload",
                "/onboarding",
                "/interview",
              ])}
            >
              Mock Interview
            </Link>
            <Link to="/ats-check" className={mobileNavClass(["/ats-check"])}>
              Resume Checker
            </Link>
            <Link
              to="/resume-builder"
              className={mobileNavClass(["/resume-builder"])}
            >
              Resume Builder
            </Link>
            <Link to="/learning" className={mobileNavClass(["/learning"])}>
              Learning Hub
            </Link>
            <Link to="/practice" className={mobileNavClass(["/practice"])}>
              Practice
            </Link>
            <Link to="/contact" className={mobileNavClass(["/contact"])}>
              Contact Us
            </Link>
            <Link to="/about" className={mobileNavClass(["/about"])}>
              About
            </Link>
          </div>

          {/* User Profile & Logout (Mobile) */}
          <div className="border-t border-[var(--border)] px-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]/20 text-lg font-bold text-[var(--accent)] border border-[var(--accent)]/30">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-base font-medium text-white">{user.name}</p>
                <a
                  href="https://buymeachai.ezee.li/supreme_1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--text-muted)] hover:text-orange-400 transition-colors flex items-center gap-1 mt-1"
                >
                  Buy me a Chai ☕
                </a>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex justify-center rounded-lg bg-[var(--danger)]/10 px-4 py-3 text-sm font-bold text-[var(--danger)] transition-colors hover:bg-[var(--danger)]/20 border border-[var(--danger)]/20"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
