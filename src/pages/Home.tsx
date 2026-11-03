import { Link } from "react-router-dom";
import useUserStore from "@/store/authStore";
import {
  motion,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import AnalyticsStats from "../components/AnalyticsStats";

// --- SPOTLIGHT CARD (Mouse-tracking highlight) ---
function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`group relative rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 md:p-10 backdrop-blur-2xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_0_50px_rgba(168,85,247,0.12)] ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[28px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) =>
              `radial-gradient(600px circle at ${x}px ${y}px, rgba(168, 85, 247, 0.16), transparent 65%)`
          ),
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-purple-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: "Multi-Modal AI Interviews",
    desc: "Face 3 dynamic rounds (HR, Tech, DSA). Questions are synthesized in real-time based strictly on your unique resume.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-blue-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    title: "Native Voice Layer",
    desc: "Speak naturally. AI interviewers recite questions aloud, and your voice is transcribed with whisper-accurate models.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-indigo-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
    title: "AI Resume Architect",
    desc: "Build a single-column, FAANG-standard PDF. Our interrogative AI extracts project specifics and formats impact bullets.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-emerald-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
      </svg>
    ),
    title: "Ruthless ATS Checker",
    desc: "Get an unforgiving score out of 100 with line-by-line rewrites, missing technical keywords, and role match predictions.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-amber-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    title: "Persistent Learning Hub",
    desc: "Track curated roadmaps (Striver A2Z, CP, System Design) with persistent state so you always know where you left off.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-pink-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Telemetry & Heatmaps",
    desc: "Save full interview transcripts and test logs forever. Visualize consistency with a GitHub-style activity matrix.",
  },
];

const liveActivity = [
  "Sub-500ms Native Execution Sandbox Online",
  "Edge-TTS Speech Engine Synchronized",
  "Whisper Multi-Lingual Speech Decoder Active",
  "FAANG Problem Synthesis Matrix Active",
  "Real-Time Complexity Analysis Engine Online",
];

const testimonials = [
  {
    name: "Priya R.",
    role: "Recent CS Grad",
    tag: "FAANG Candidate",
    text: "I was using a fancy two-column resume and getting auto-rejected everywhere. The builder forced me into a clean ATS format and interrogated me to extract real business metrics.",
  },
  {
    name: "Sneha K.",
    role: "Backend Engineer",
    tag: "SDE-2 Offer",
    text: "Thought it was just another generic AI wrapper until it compiled my Java solution against hidden edge cases in 400ms. The execution sandbox is exceptionally fast.",
  },
  {
    name: "Rahul Sharma",
    role: "Fullstack Developer",
    tag: "Verified User",
    text: "I always freeze up in live technical screens. Explaining my thought process out loud to the voice recruiter gave me the exact confidence I needed.",
  },
];

function Home() {
  const { isAuthenticate } = useUserStore();

  const { scrollYProgress } = useScroll();
  const rotateX = useTransform(scrollYProgress, [0, 0.25], [8, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.25], [0.97, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [0.5, 1]);

  return (
    <div className="min-h-screen bg-[#070709] text-gray-200 font-sans flex flex-col relative selection:bg-purple-500/30 selection:text-white">
      
      {/* --- AMBIENT SPECULAR BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-purple-600/20 via-indigo-600/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[50%] right-[-15%] w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-[160px]" />
        
        {/* Soft Grid */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: "44px 44px",
            maskImage: "linear-gradient(to bottom, black 30%, transparent 95%)",
          }}
        />
      </div>

      {/* --- FIXED STATIC GLASSMORPHIC NAVBAR (Always stays locked at top) --- */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#070709]/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
        <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4 md:px-12">
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-purple-500/30 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src="/logo.svg?v=2" alt="RoundOne" className="w-8 h-8 rounded-lg relative z-10" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
              RoundOne
            </span>
          </Link>

          <div className="flex gap-6 items-center">
            <Link to="/about" className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Contact
            </Link>

            {isAuthenticate ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-white/10 border border-white/15 text-white rounded-xl text-sm font-semibold hover:bg-white/20 transition-all flex items-center gap-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
              >
                Dashboard →
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-[0_0_25px_rgba(168,85,247,0.35)]"
                >
                  Explore Arena →
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content with Top Padding for Fixed Nav */}
      <main className="flex-grow z-10 relative pt-24">
        
        {/* --- HERO SECTION --- */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center">
          {/* Status Badge: RoundOne Live */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 mb-8 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/[0.08] text-purple-300 text-xs font-semibold uppercase tracking-widest backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            RoundOne Live
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.05]"
          >
            <span className="text-white">Crack your next</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 drop-shadow-[0_0_40px_rgba(168,85,247,0.25)]">
              engineering screen.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed font-normal"
          >
            Your private technical arena. Audit your resume against FAANG criteria, write real algorithms in secure sub-processes, and practice with responsive voice AI.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto"
          >
            <Link
              to="/dashboard"
              className="px-8 py-4 rounded-xl bg-white text-black text-base font-bold hover:bg-gray-200 transition-all shadow-[0_0_35px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 group"
            >
              <span>Explore as Guest</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            {!isAuthenticate && (
              <Link
                to="/register"
                className="px-8 py-4 rounded-xl border border-white/10 bg-white/[0.04] text-white text-base font-semibold hover:bg-white/[0.08] transition-all backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] flex items-center justify-center"
              >
                Create Free Account
              </Link>
            )}
          </motion.div>

          <AnalyticsStats />
        </section>

        {/* --- EXPANDED 3-STEP PIPELINE WINDOW (MAX-W-7XL, NO TEXT OVERFLOW) --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-36" style={{ perspective: "1200px" }}>
          <motion.div
            style={{ rotateX, scale, opacity }}
            className="w-full rounded-[32px] border border-white/[0.12] bg-[#0c0d12]/90 backdrop-blur-3xl shadow-[0_25px_100px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.15)] overflow-hidden flex flex-col"
          >
            {/* Window Topbar */}
            <div className="h-12 border-b border-white/[0.08] bg-white/[0.02] flex items-center px-6 justify-between select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500/80"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500/80"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="px-4 py-1 rounded-md bg-white/[0.05] text-gray-400 text-xs font-mono font-medium tracking-wide">
                roundone.app/interview-flow
              </div>
              <div className="w-16"></div>
            </div>

            {/* VISUAL 3-STEP PREVIEWS - WIDE & ROOMY */}
            <div className="p-6 sm:p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
              
              {/* STEP 1: VISUAL RESUME SCANNER */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between hover:border-purple-500/40 hover:bg-white/[0.04] transition-all group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold whitespace-nowrap">
                      1. Build or Upload
                    </span>
                    <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                      ATS: 94/100
                    </span>
                  </div>

                  {/* Visual Mock Card: Resume Document with Laser Scanning Line */}
                  <div className="my-5 p-4 rounded-xl bg-black/50 border border-white/10 relative overflow-hidden">
                    <motion.div
                      animate={{ y: [0, 80, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_12px_rgba(168,85,247,0.8)] z-10"
                    />

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-xs font-bold shrink-0">
                        PDF
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">Software_Engineer_CV.pdf</div>
                        <div className="text-[10px] text-gray-500 font-mono truncate">Parsed • 1 Page • Single-Column</div>
                      </div>
                    </div>

                    {/* Extracted Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-300 font-mono">React</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-300 font-mono">Postgres</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-300 font-mono">Distributed</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-400 flex items-center gap-2 pt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"></span>
                  Extracts experience & writes perfect bullets
                </div>
              </div>

              {/* STEP 2: VISUAL COMPANY & ROLE TARGETING */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between hover:border-blue-500/40 hover:bg-white/[0.04] transition-all group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold whitespace-nowrap">
                      2. Configure Target
                    </span>
                    <span className="shrink-0 text-[11px] font-mono text-gray-400 whitespace-nowrap">
                      Calibration
                    </span>
                  </div>

                  {/* Visual Mock: Company & Difficulty selector */}
                  <div className="my-5 p-4 rounded-xl bg-black/50 border border-white/10 space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1 py-1.5 px-2 rounded-lg bg-blue-500/10 border border-blue-500/40 text-center text-xs font-bold text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.2)] whitespace-nowrap">
                        Google ✓
                      </div>
                      <div className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 border border-white/10 text-center text-xs text-gray-400 font-medium whitespace-nowrap">
                        Amazon
                      </div>
                      <div className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 border border-white/10 text-center text-xs text-gray-400 font-medium whitespace-nowrap">
                        Meta
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-gray-400">Target Role:</span>
                      <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded whitespace-nowrap">SDE-II Backend</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                      <span className="text-gray-400">Difficulty:</span>
                      <span className="text-amber-400 font-bold font-mono bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 whitespace-nowrap">
                        Hard ★★★
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-400 flex items-center gap-2 pt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                  Calibrates real question banks for target company
                </div>
              </div>

              {/* STEP 3: VISUAL VOICE & NATIVE CODE EXECUTION (NO OVERLAPPING WORDS) */}
              <div className="p-6 sm:p-7 rounded-2xl bg-purple-500/[0.05] border border-purple-500/40 flex flex-col justify-between shadow-[inset_0_1px_0_0_rgba(168,85,247,0.3),0_0_40px_rgba(168,85,247,0.15)] group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold whitespace-nowrap">
                      3. Face the AI
                    </span>
                    <span className="shrink-0 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-bold whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Active Voice
                    </span>
                  </div>

                  {/* Visual Mock: Live Audio Waveform & Execution Verdict */}
                  <div className="my-5 p-4 rounded-xl bg-black/60 border border-purple-500/30 space-y-3.5">
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">🎙️</span>
                        <span className="text-[11px] font-mono font-medium text-purple-200">AI Recruiter Speaking</span>
                      </div>
                      <div className="flex items-center gap-1 h-4">
                        {[40, 90, 60, 100, 50, 80, 45, 95].map((height, i) => (
                          <motion.span
                            key={i}
                            animate={{ scaleY: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                            style={{ height: `${height}%` }}
                            className="w-1 bg-purple-400 rounded-full"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#090a0f] border border-white/5 font-mono text-xs flex items-center justify-between">
                      <span className="text-gray-400 text-[11px]">two_sum.cpp (15/15)</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px] whitespace-nowrap">
                        ✓ AC • 28ms
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-purple-200/90 flex items-center gap-2 pt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  Speak your approach & compile code natively
                </div>
              </div>

            </div>
          </motion.div>
        </section>

        {/* --- INFINITE TICKER --- */}
        <section className="py-6 border-y border-white/[0.06] bg-black/40 overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex gap-16 w-max animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused]">
            {[...liveActivity, ...liveActivity, ...liveActivity].map((activity, i) => (
              <div key={i} className="text-gray-400 text-xs font-mono tracking-wider flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400/80"></span>
                {activity}
              </div>
            ))}
          </div>
        </section>

        {/* --- 3x2 SPACIOUS FEATURE GRID --- */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-36">
          <div className="text-center mb-24">
            <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block mb-3 font-semibold">
              Capabilities
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Engineering interview prep.
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Eliminate test anxiety through deliberate repetition in a high-fidelity environment built by developers, for developers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <SpotlightCard key={index} className="flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] group-hover:scale-105 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 tracking-tight group-hover:text-purple-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-base leading-relaxed font-normal">
                    {feature.desc}
                  </p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* --- ENLARGED TESTIMONIALS --- */}
        <section className="py-36 border-y border-white/[0.06] bg-black/40 relative overflow-hidden backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block mb-3 font-semibold">
                Early Feedback
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                Tested by engineers.
              </h2>
              <p className="text-gray-400 text-lg md:text-xl">
                Honest reviews from developers during private testing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-8 md:p-10 rounded-[28px] border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl flex flex-col justify-between hover:border-purple-500/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.1)] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(5)].map((_, idx) => (
                          <svg key={idx} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-white/[0.04] text-purple-300 border border-white/[0.06]">
                        {t.tag}
                      </span>
                    </div>

                    <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-10 font-normal">
                      "{t.text}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-white/[0.06]">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border border-white/10 flex items-center justify-center font-bold text-base text-purple-300 shadow-inner">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white text-base font-bold">{t.name}</div>
                      <div className="text-gray-400 text-xs font-mono">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CALL TO ACTION --- */}
        <section className="py-36 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 leading-tight">
              <span className="text-white">Stop dreading the screen.</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400">
                Start deliberate practice.
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-xl mx-auto leading-relaxed font-normal">
              Build your resume, track curated learning sheets, and rehearse with realistic voice AI recruiters.
            </p>
            <Link
              to="/dashboard"
              className="inline-block px-10 py-4 bg-purple-600 text-white rounded-xl text-base font-bold hover:bg-purple-500 transition-all hover:scale-105 shadow-[0_0_35px_rgba(168,85,247,0.4)]"
            >
              Enter Arena as Guest
            </Link>
            <div className="mt-6 text-xs font-mono text-gray-500">
              Zero credit card required • Instant access
            </div>
          </div>
        </section>
      </main>

      {/* --- RICH FOOTER WITH WATERMARK --- */}
      <footer className="bg-[#050507] pt-20 pb-12 border-t border-white/[0.06] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/[0.06]">
            
            {/* Brand Column (Left) */}
            <div className="md:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src="/logo.svg?v=2" alt="RoundOne" className="w-8 h-8 rounded-lg" />
                  <span className="text-2xl font-black tracking-tight text-white">RoundOne</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed max-w-sm mb-6 font-normal">
                  AI-powered mock interviews and deliberate coding practice built specifically for software engineers.
                </p>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all"
                >
                  <span>Launch Practice Arena</span>
                  <span>→</span>
                </Link>
              </div>

              <div className="mt-8 text-xs font-mono text-gray-500">
                v2.4.0 • Built for Software Engineers
              </div>
            </div>

            {/* Links Columns (Right) */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white mb-4">Product</div>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><Link to="/dashboard" className="hover:text-white transition-colors">Mock Arena</Link></li>
                  <li><Link to="/dashboard" className="hover:text-white transition-colors">Voice Layer</Link></li>
                  <li><Link to="/dashboard" className="hover:text-white transition-colors">ATS Checker</Link></li>
                  <li><Link to="/dashboard" className="hover:text-white transition-colors">Resume AI</Link></li>
                </ul>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white mb-4">Practice</div>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><Link to="/practice" className="hover:text-white transition-colors">DSA Problems</Link></li>
                  <li><Link to="/practice" className="hover:text-white transition-colors">Company Sheets</Link></li>
                  <li><Link to="/dashboard" className="hover:text-white transition-colors">System Design</Link></li>
                  <li><Link to="/dashboard" className="hover:text-white transition-colors">Striver A2Z</Link></li>
                </ul>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white mb-4">Resources</div>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="https://github.com/Anurag-Mishra2006" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                  <li><Link to="/about" className="hover:text-white transition-colors">Architecture</Link></li>
                  <li><Link to="/contact" className="hover:text-white transition-colors">Support</Link></li>
                  <li><a href="https://buymeachai.ezee.li/supreme_1" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Buy Chai ☕</a></li>
                </ul>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white mb-4">Company</div>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                  <li><a href="https://www.linkedin.com/in/anurag-mishra-256101318/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a></li>
                </ul>
              </div>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-500">
            <div>© {new Date().getFullYear()} RoundOne. Engineered by Anurag Mishra.</div>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
              <Link to="/contact" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>

        {/* --- WATERMARK --- */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 text-[14vw] font-black tracking-tighter text-white/[0.02] select-none pointer-events-none whitespace-nowrap">
          ROUNDONE
        </div>
      </footer>
    </div>
  );
}

export default Home;
