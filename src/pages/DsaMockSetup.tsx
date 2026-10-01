import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { getDSARoundQuestions, getAvailableCompanies } from "@/services/api";
import Navbar from "@/components/Navbar";
import useUserStore from "@/store/authStore";

export default function DsaMockSetup() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticate } = useUserStore();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await getAvailableCompanies();
        setCompanies(res.data.companies);
      } catch (err) {
        console.error("Failed to load companies:", err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((c) =>
    c.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleStartArena = async () => {
    if (!isAuthenticate) {
      navigate("/login", {
        state: { message: "Please log in to enter the Mock OA arena." },
      });
      return;
    }
    if (!selectedCompany) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await getDSARoundQuestions({ company: selectedCompany });
      const sessionId = response.data.sessionId;
      navigate(`/arena/${sessionId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to generate assessment.");
      setIsLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans flex flex-col text-white selection:bg-red-500/30 relative overflow-hidden">
      {/* --- UPGRADED AMBIENT BACKGROUND --- */}
      {/* 1. Spotlight Dotted Grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
      />
      {/* 2. Soft Colored Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="relative z-20">
        <Navbar />
      </div>

      <main className="flex-grow flex items-center justify-center p-4 md:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-5xl w-full bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-[0_0_80px_rgba(239,68,68,0.05)] relative flex flex-col lg:flex-row gap-8 max-h-[85vh]"
        >
          {/* Glowing Top Border */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>

          {/* --- LEFT COLUMN: Rules & Action --- */}
          <div className="flex flex-col lg:w-5/12 h-full justify-between shrink-0">
            <div>
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Live Assessment
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                Configure{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                  Mock OA
                </span>
              </h1>
              <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed mb-8">
                Select your target company. Our engine will dynamically generate
                a secure, 90-minute online assessment mimicking their actual
                interview patterns.
              </p>

              {/* Assessment Rules */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-300">
                    {/* Clock SVG */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      90-Minute Timer
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      The assessment auto-submits when time expires.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-red-400">
                    {/* Eye / Anti-Cheat SVG */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Anti-Cheat Active
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Tab-switching is heavily monitored and flagged.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-purple-400">
                    {/* Hidden Edge Cases / AI Sparkles SVG */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Hidden Edge Cases
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Your code is graded in Docker against hidden test cases.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 shrink-0"
              >
                {/* Warning Triangle SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-red-500 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="text-red-400 text-sm font-medium">
                  {error}
                </span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleStartArena}
              disabled={!selectedCompany || isLoading}
              className={`w-full py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 transition-all shrink-0 relative overflow-hidden group ${
                !selectedCompany || isLoading
                  ? "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-500 hover:-translate-y-1 shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:shadow-[0_0_60px_rgba(239,68,68,0.6)]"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating Environment...
                </>
              ) : (
                <>
                  Enter the Arena
                  {/* Arrow Right SVG replacing ➔ */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
                    />
                  </svg>
                  {selectedCompany && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[pulse_1.5s_infinite]"></div>
                  )}
                </>
              )}
            </button>
          </div>

          {/* --- RIGHT COLUMN: Company Selection --- */}
          <div className="flex flex-col lg:w-7/12 h-full bg-[#050505]/60 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
            {/* Search Bar */}
            <div className="mb-6 shrink-0 relative group">
              <input
                type="text"
                placeholder="Search companies (e.g., Amazon, Meta)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 pl-12 text-sm outline-none focus:border-red-500/50 focus:bg-white/10 transition-all text-white placeholder-gray-500 shadow-inner"
              />
              {/* Magnifying Glass SVG */}
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-400 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </span>
            </div>

            {/* Company Grid (Scrollable) */}
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow relative pb-4">
              {isFetching ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] gap-4">
                  <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                  <span className="text-sm font-medium tracking-wide">
                    Syncing companies...
                  </span>
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] text-sm bg-white/5 border border-white/10 rounded-2xl border-dashed p-8 text-center">
                  {/* Empty Building SVG */}
                  <span className="mb-4 text-gray-600 opacity-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1}
                      stroke="currentColor"
                      className="w-16 h-16"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                      />
                    </svg>
                  </span>
                  <p>
                    No companies found matching "
                    <span className="text-white font-bold">{searchQuery}</span>"
                  </p>
                  <p className="text-xs mt-2 opacity-50">
                    Please clear your search or check your database.
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  {filteredCompanies.map((companyName) => (
                    <motion.button
                      variants={itemVariants}
                      key={companyName}
                      onClick={() => setSelectedCompany(companyName)}
                      className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group ${
                        selectedCompany === companyName
                          ? "bg-red-500/10 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-inner transition-transform duration-300 group-hover:scale-110 ${
                          selectedCompany === companyName
                            ? "bg-gradient-to-br from-red-500 to-orange-600 text-white shadow-red-500/50"
                            : "bg-gradient-to-br from-gray-700 to-gray-900 text-gray-300 border border-white/10"
                        }`}
                      >
                        {companyName.charAt(0).toUpperCase()}
                      </div>
                      <span
                        className={`font-bold text-sm text-center transition-colors ${selectedCompany === companyName ? "text-red-400" : "text-gray-300 group-hover:text-white"}`}
                      >
                        {companyName}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
