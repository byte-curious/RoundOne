import { useState, useEffect } from "react";
import { checkAtsResume } from "@/services/api";
import Navbar from "@/components/Navbar.js";
import { motion, type Variants } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import useUserStore from "@/store/authStore";
interface AtsResult {
  overallScore: number;
  scoreCategory: string;
  criticalIssues: string[];
  matchedRoles?: { role: string; matchPercentage: number }[];
  sectionScores: Record<string, { score: number; feedback: string }>;
  lineByLineFixes: {
    originalText: string;
    suggestedRewrite: string;
    reason: string;
  }[];
  missingKeywords: string[];
}

const LOADING_MESSAGES = [
  "Extracting resume text...",
  "Analyzing FAANG keyword density...",
  "Scoring impact metrics...",
  "Evaluating action verbs...",
  "Generating line-by-line rewrites...",
];

function AtsChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState<string>("Software Engineer");
  const [level, setLevel] = useState<string>("Fresher");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AtsResult | null>(null);
  const navigate = useNavigate();
  const { isAuthenticate } = useUserStore();
  // Smart Loader Effect
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingTextIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500); // Change text every 2.5 seconds
    } else {
      setLoadingTextIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError("Upload File");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Only pdf is acceptable");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB");
      return;
    }
    setFile(file);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isAuthenticate) {
      navigate("/login", {
        state: { message: "Please log in to scan your resume with AI." },
      });
      return;
    }
    if (!file) {
      setError("Please upload file");
      return;
    }

    try {
      setLoading(true);
      const response = await checkAtsResume(file, targetRole, level);

      if (response.status !== 200) {
        setError("Failed to upload file");
        return;
      }
      setResult(response.data.atsResult);
    } catch (error: any) {
      setError(error?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };
  const location = useLocation();
  useEffect(() => {
    // If the user came from the Resume Builder, grab the generated file!
    if (location.state?.autoUploadFile) {
      setFile(location.state.autoUploadFile);

      // Clean up the location state so it doesn't auto-trigger if they refresh the page
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-[var(--bg)] font-sans flex flex-col">
      <Navbar />

      {!result ? (
        // --- THE PREMIUM UPLOAD FORM (SPLIT SCREEN) ---
        <div className="flex-grow flex items-center justify-center px-6 py-12 relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center z-10">
            {/* LEFT SIDE: Marketing & Features */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="hidden lg:flex flex-col space-y-10 pr-8"
            >
              <div>
                <motion.h2
                  variants={itemVariants}
                  className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4"
                >
                  Beat the <br />{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[var(--accent)]">
                    ATS algorithm.
                  </span>
                </motion.h2>
                <motion.p
                  variants={itemVariants}
                  className="text-[var(--text-muted)] text-lg leading-relaxed max-w-md"
                >
                  Don't guess what recruiters want. Upload your resume to see
                  exactly how FAANG systems score your profile.
                </motion.p>
              </div>

              <div className="space-y-6">
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-5"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] shadow-[0_0_15px_rgba(170,59,255,0.2)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      AI Role Matcher
                    </h3>
                    <p className="text-[var(--text-muted)] text-sm">
                      Discover exactly which roles fit your experience best.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-5"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      Line-by-Line Rewrites
                    </h3>
                    <p className="text-[var(--text-muted)] text-sm">
                      We fix your weak action verbs and add missing metrics.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-5"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      Keyword Optimization
                    </h3>
                    <p className="text-[var(--text-muted)] text-sm">
                      Find out which crucial industry keywords you are missing.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* RIGHT SIDE: The Upload Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-lg mx-auto"
            >
              <form
                onSubmit={handleSubmit}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/50 relative group"
              >
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] group-hover:bg-blue-600/20 transition-colors duration-500"></div>

                <div className="mb-10 text-center relative z-10">
                  <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-600 to-[var(--accent)] flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] transform group-hover:scale-105 transition-transform duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-7 h-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    ATS Scanner
                  </h1>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    Get brutal, FAANG-level feedback.
                  </p>
                </div>

                <div className="space-y-6 relative z-10">
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${file ? "border-[var(--success)] bg-[var(--success)]/5" : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5"}`}
                  >
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={loading}
                    />
                    {!file ? (
                      <div className="flex flex-col items-center pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-10 h-10 mb-4 text-[var(--text-muted)] opacity-80"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                          />
                        </svg>
                        <p className="text-base font-bold text-white mb-1">
                          Click to browse
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          or drag and drop your file here
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-12 h-12 mb-4 text-[var(--success)] drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-base font-bold text-[var(--success)] mb-1">
                          Ready to scan
                        </p>
                        <p className="text-xs text-[var(--text-muted)] break-all px-4">
                          {file.name}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Target Role
                      </label>
                      <input
                        type="text"
                        value={targetRole}
                        placeholder="e.g. Software Engineer"
                        onChange={(e) => setTargetRole(e.target.value)}
                        disabled={loading}
                        className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all disabled:opacity-50"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Experience Level
                      </label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        disabled={loading}
                        className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="Fresher">Fresher</option>
                        <option value="Junior">Junior</option>
                        <option value="Mid-Level">Mid-Level</option>
                        <option value="Senior">Senior</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-md bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-center flex items-center justify-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-[var(--danger)]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <p className="text-sm font-medium text-[var(--danger)]">
                        {error}
                      </p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !file}
                    className="w-full rounded-xl bg-[var(--accent)] py-4 text-sm font-bold text-white transition-all hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(170,59,255,0.2)] hover:shadow-[0_0_25px_rgba(170,59,255,0.4)] flex justify-center items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden relative group"
                  >
                    {loading ? (
                      <motion.div
                        key={loadingTextIdx} // Key change forces re-animation
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>{LOADING_MESSAGES[loadingTextIdx]}</span>
                      </motion.div>
                    ) : (
                      <>
                        Scan Resume
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      ) : (
        // --- THE RESULTS DASHBOARD (BENTO BOX LAYOUT) ---
        <div className="flex-grow px-4 py-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto"
          >
            {/* Top Area: Bento Box Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Left Column: Score & Roles */}
              <div className="lg:col-span-1 space-y-6">
                {/* Score Card */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col items-center justify-center p-8 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-lg text-center relative overflow-hidden"
                >
                  <div
                    className={`absolute top-0 w-full h-1 ${result.overallScore >= 80 ? "bg-[var(--success)]" : result.overallScore >= 50 ? "bg-[var(--warning)]" : "bg-[var(--danger)]"}`}
                  ></div>
                  <h2 className="text-xl font-bold text-[var(--text)] mb-6">
                    ATS Match Score
                  </h2>
                  <div className="relative">
                    {/* Animated SVG Ring */}
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        stroke="var(--border)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="60"
                        stroke={
                          result.overallScore >= 80
                            ? "var(--success)"
                            : result.overallScore >= 50
                              ? "var(--warning)"
                              : "var(--danger)"
                        }
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="377"
                        initial={{ strokeDashoffset: 377 }}
                        animate={{
                          strokeDashoffset:
                            377 - (377 * result.overallScore) / 100,
                        }}
                        transition={{
                          duration: 1.5,
                          ease: "easeOut",
                          delay: 0.5,
                        }}
                        className="drop-shadow-lg"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        className={`text-4xl font-extrabold ${result.overallScore >= 80 ? "text-[var(--success)]" : result.overallScore >= 50 ? "text-[var(--warning)]" : "text-[var(--danger)]"}`}
                      >
                        {result.overallScore}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs uppercase tracking-widest font-bold mt-6 text-[var(--text-muted)] bg-[var(--bg)] px-4 py-1.5 rounded-full border border-[var(--border)]">
                    {result.scoreCategory}
                  </p>
                </motion.div>

                {/* Role Matcher */}
                {result.matchedRoles && result.matchedRoles.length > 0 && (
                  <motion.div
                    variants={itemVariants}
                    className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-lg"
                  >
                    <h3 className="text-sm font-bold text-[var(--text)] mb-5 uppercase tracking-wider flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-[var(--accent)]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Role Matches
                    </h3>
                    <div className="space-y-5">
                      {result.matchedRoles.map((match: any, i: number) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-[var(--text)] font-medium truncate pr-2">
                              {match.role}
                            </span>
                            <span
                              className={`font-bold ${match.matchPercentage >= 80 ? "text-[var(--success)]" : match.matchPercentage >= 50 ? "text-[var(--warning)]" : "text-[var(--danger)]"}`}
                            >
                              {match.matchPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-[var(--bg)] rounded-full h-2 border border-[var(--border)] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${match.matchPercentage}%` }}
                              transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                              className={`h-2 rounded-full ${match.matchPercentage >= 80 ? "bg-[var(--success)]" : match.matchPercentage >= 50 ? "bg-[var(--warning)]" : "bg-[var(--danger)]"}`}
                            ></motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right Column: Breakdown & Issues */}
              <div className="lg:col-span-2 space-y-6">
                {/* Critical Issues */}
                {result.criticalIssues && result.criticalIssues.length > 0 && (
                  <motion.div
                    variants={itemVariants}
                    className="p-6 bg-[var(--danger)]/5 border border-[var(--danger)]/30 rounded-2xl"
                  >
                    <h3 className="text-sm font-bold text-[var(--danger)] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 animate-pulse"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Critical Issues Detected
                    </h3>
                    <ul className="space-y-3">
                      {result.criticalIssues.map((issue: string, i: number) => (
                        <li
                          key={i}
                          className="text-sm text-[var(--text)] flex items-start gap-3 bg-[var(--bg)]/50 p-3 rounded-lg border border-[var(--danger)]/10"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5 text-[var(--danger)] shrink-0 mt-0.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          <span className="leading-relaxed">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Section Scores Grid */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider mb-4 pl-1">
                    Category Breakdown
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(result.sectionScores).map(
                      ([key, data]: [string, any]) => {
                        const score =
                          typeof data === "number" ? data : data?.score || 0;
                        const feedback =
                          typeof data === "number"
                            ? "Score assigned based on overall ATS parsability."
                            : data?.feedback;

                        return (
                          <div
                            key={key}
                            className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex justify-between items-start hover:border-[var(--accent)]/30 transition-colors"
                          >
                            <div className="pr-4">
                              <p className="font-bold text-[var(--text)] capitalize mb-1">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </p>
                              {feedback && (
                                <p
                                  className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2"
                                  title={feedback}
                                >
                                  {feedback}
                                </p>
                              )}
                            </div>
                            <div
                              className={`text-xl font-bold ${score >= 8 ? "text-[var(--success)]" : score >= 5 ? "text-[var(--warning)]" : "text-[var(--danger)]"}`}
                            >
                              {score}
                              <span className="text-xs text-[var(--text-muted)] font-normal">
                                /10
                              </span>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Bottom Area: Line-by-Line & Keywords */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Missing Keywords */}
              {result.missingKeywords && result.missingKeywords.length > 0 && (
                <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
                  <h3 className="text-sm font-bold text-[var(--text)] mb-4 uppercase tracking-wider flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 text-yellow-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                      />
                    </svg>
                    Missing Keywords to Add
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((kw: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text-muted)] rounded-md font-mono hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors cursor-default"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Line-by-Line Fixes */}
              {result.lineByLineFixes && result.lineByLineFixes.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)] mb-4 uppercase tracking-wider pl-1">
                    Line-by-Line Fixes
                  </h3>
                  <div className="space-y-4">
                    {result.lineByLineFixes.map((fix: any, i: number) => (
                      <div
                        key={i}
                        className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl"
                      >
                        <div className="flex items-start gap-2 mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6 text-yellow-500 shrink-0"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.2m-1.5.2a6.01 6.01 0 01-1.5-.2m1.5.2V8.25m0 0c0-1.657 1.343-3 3-3h1.5M12 8.25c0-1.657-1.343-3-3-3H7.5m10.5 3a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <p className="text-sm text-[var(--text-muted)] italic leading-relaxed">
                            "{fix.reason}"
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-[var(--danger)]/5 border-l-4 border-[var(--danger)] rounded-r-lg">
                            <p className="text-[10px] text-[var(--danger)] font-bold uppercase tracking-wider mb-2">
                              Remove Original
                            </p>
                            <p className="text-sm text-[var(--text)] line-through opacity-70">
                              {fix.originalText}
                            </p>
                          </div>
                          <div className="p-4 bg-[var(--success)]/5 border-l-4 border-[var(--success)] rounded-r-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10 text-[var(--success)]">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-12 h-12"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                                />
                              </svg>
                            </div>
                            <p className="text-[10px] text-[var(--success)] font-bold uppercase tracking-wider mb-2">
                              Suggested Rewrite
                            </p>
                            <p className="text-sm text-[var(--text)] font-medium relative z-10">
                              {fix.suggestedRewrite}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Reset Button */}
            <motion.div variants={itemVariants} className="pt-8">
              <button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  window.scrollTo(0, 0);
                }}
                className="w-full max-w-md mx-auto block rounded-xl bg-[var(--accent)] px-4 py-4 text-sm font-bold text-white hover:bg-[var(--accent-hover)] transition-all shadow-[0_0_15px_rgba(170,59,255,0.2)] hover:shadow-[0_0_25px_rgba(170,59,255,0.4)] hover:-translate-y-1 flex justify-center items-center gap-2 group"
              >
                Scan Another Resume
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
                  />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AtsChecker;
