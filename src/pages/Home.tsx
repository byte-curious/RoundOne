import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useUserStore from "@/store/authStore";
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
} from "framer-motion";
import AnalyticsStats from "../components/AnalyticsStats";

// --- PREMIUM SVGs ---
const features = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-7 h-7 text-purple-400"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
        />
      </svg>
    ),
    title: "Multi-Modal AI Interviews",
    desc: "Face 3 dynamic rounds (HR, Tech, DSA). Questions are generated in real-time based strictly on your resume.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-7 h-7 text-blue-400"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
        />
      </svg>
    ),
    title: "Native Voice Layer",
    desc: "Stop typing. The AI reads questions out loud, and you answer using your microphone with Groq/Whisper transcription.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-7 h-7 text-indigo-400"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
        />
      </svg>
    ),
    title: "AI Resume Builder",
    desc: "Build a FAANG-standard, single-column PDF from scratch. Our 'Interrogative AI' extracts your experience and writes perfect bullet points.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-7 h-7 text-green-400"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12"
        />
      </svg>
    ),
    title: "FAANG ATS Checker",
    desc: "Upload any resume and get a ruthless score out of 100. Get missing keywords, role predictions, and AI rewrites.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-7 h-7 text-yellow-400"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
        />
      </svg>
    ),
    title: "The Learning Hub",
    desc: "Structured roadmaps (Striver A2Z, CP, Sys-Design). Your progress is saved persistently so you never lose track of what to learn next.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-7 h-7 text-pink-400"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
    title: "Analytics Dashboard",
    desc: "Save your interview history forever. Track your consistency with a GitHub-style heatmap and share public report cards.",
  },
];

const liveActivity = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
        />
      </svg>
    ),
    text: "Groq Whisper Voice Engine Active",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
        />
      </svg>
    ),
    text: "Edge-TTS Text Engine Active",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
        />
      </svg>
    ),
    text: "Dynamic AI Question Generation Live",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
        />
      </svg>
    ),
    text: "Interrogative AI Resume Builder Online",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5"
        />
      </svg>
    ),
    text: "FAANG ATS Scoring Updated",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
    text: "Track Your Learning Sheet Progress",
  },
];

const testimonials = [
  {
    name: "Priya R.",
    role: "Recent CS Grad",
    text: "I was using a fancy two-column resume and getting auto-rejected. The builder forced me into a clean ATS format, and the AI literally interrogated me to extract the actual business impact of my projects.",
  },
  {
    name: "Sneha K.",
    role: "Backend Engineer",
    text: "Was skeptical at first, expecting just another ChatGPT wrapper. But the fact that it actually spins up a secure sandbox and compiles my Java code against hidden test cases is seriously impressive.",
  },
  {
    name: "Rahul Sharma",
    role: "SDE-1 Candidate",
    text: "I always freeze up in live interviews. Practicing with the voice AI forced me to explain my logic out loud instead of just coding in silence. It’s brutal, but it’s exactly what I needed to gain confidence.",
  },
];

function Home() {
  const { isAuthenticate } = useUserStore();
  const [isHoveringTestimonial, setIsHoveringTestimonial] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [40, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans flex flex-col overflow-x-hidden relative selection:bg-purple-500/30">
      {/* --- SPINNING TESTIMONIAL CURSOR --- */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[100] flex items-center justify-center mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHoveringTestimonial ? 1 : 0,
          opacity: isHoveringTestimonial ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          width="120"
          height="120"
          viewBox="0 0 100 100"
          className="overflow-visible"
        >
          <path
            id="circlePath"
            d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
            fill="none"
          />
          <text
            fill="white"
            fontSize="10.5"
            fontWeight="bold"
            letterSpacing="2.5"
          >
            <textPath href="#circlePath" startOffset="0%">
              READ REVIEW • READ REVIEW • READ REVIEW •{" "}
            </textPath>
          </text>
        </motion.svg>
        <div className="absolute w-2 h-2 bg-white rounded-full"></div>
      </motion.div>

      {/* --- AMBIENT BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/30 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, -60, 0], y: [0, 50, 0] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[150px]"
        />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "linear-gradient(to bottom, black 40%, transparent 100%)",
          }}
        />
      </div>

      {/* CLEAN, MINIMAL LANDING NAVBAR */}
      <nav className="flex justify-between items-center px-6 py-4 md:px-12 border-b border-white/5 bg-[#050505]/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer group">
          <img
            src="/logo.svg?v=2"
            alt="RoundOne"
            className="w-8 h-8 rounded-lg"
          />
          <div className="text-xl font-extrabold tracking-tight text-white">
            RoundOne
          </div>
        </div>

        <div className="flex gap-6 items-center">
          <Link
            to="/about"
            className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Contact Us
          </Link>

          {isAuthenticate ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-sm font-bold hover:bg-white/20 transition-all flex items-center gap-2"
            >
              Dashboard →
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-bold hover:bg-[var(--accent-hover)] transition-all shadow-[0_0_20px_rgba(170,59,255,0.3)] hover:-translate-y-0.5"
              >
                Explore as Guest →
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow z-10 relative">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto px-6 pt-32 pb-16 text-center flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            RoundOne is Live
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.05]">
            <span className="text-white">Crack your next</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-500 drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              FAANG interview.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed font-medium">
            Your personal prep arena. Upload or build your resume, write real
            code, and face voice-enabled AI recruiters tailored exactly to your
            background.
          </p>

          {/* HERO ACTION BUTTONS: Guest Explore + Account */}
          <div className="flex flex-col sm:flex-row gap-4 mb-2">
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-white text-black rounded-xl text-lg font-bold hover:bg-gray-200 transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 group"
            >
              <span>Explore as Guest</span>
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
            {!isAuthenticate && (
              <Link
                to="/register"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl text-lg font-bold hover:bg-white/10 transition-all hover:scale-105 backdrop-blur-md"
              >
                Create Free Account
              </Link>
            )}
          </div>

          <AnalyticsStats />
        </motion.div>

        {/* THE 3-STEP MOCK INTERVIEW FLOW PREVIEW */}
        <div
          ref={targetRef}
          className="max-w-5xl mx-auto px-6 pb-32 pt-12"
          style={{ perspective: "1000px" }}
        >
          <motion.div
            style={{ rotateX, scale, opacity }}
            className="w-full h-auto md:h-[400px] rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-[0_0_80px_rgba(168,85,247,0.2)] overflow-hidden flex flex-col relative"
          >
            <div className="h-12 border-b border-white/10 bg-white/5 flex items-center px-4 gap-2 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <div className="mx-auto px-4 py-1 rounded-md bg-white/5 text-gray-500 text-xs font-mono">
                roundone.app/interview-flow
              </div>
            </div>

            <div className="flex-grow p-8 flex flex-col md:flex-row items-center justify-center gap-6 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none"></div>

              <div className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/50"></div>
                <div className="w-14 h-14 mx-auto bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 border border-purple-500/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-purple-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <div className="font-bold text-white mb-2 text-lg">
                  1. Build or Upload
                </div>
                <div className="text-sm text-gray-400">
                  Generate a FAANG resume or upload your own.
                </div>
              </div>

              <div className="hidden md:block text-2xl text-gray-600 font-light">
                →
              </div>

              <div className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50"></div>
                <div className="w-14 h-14 mx-auto bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 border border-blue-500/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-blue-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="font-bold text-white mb-2 text-lg">
                  2. Configure Target
                </div>
                <div className="text-sm text-gray-400">
                  Select company, role, & difficulty level.
                </div>
              </div>

              <div className="hidden md:block text-2xl text-gray-600 font-light">
                →
              </div>

              <div className="flex-1 w-full bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 text-center relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent"></div>
                <div className="w-14 h-14 mx-auto bg-purple-500/30 rounded-xl flex items-center justify-center mb-4 border border-purple-400/50 relative z-10 animate-pulse">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-purple-200"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
                <div className="font-bold text-white mb-2 text-lg relative z-10">
                  3. Face the AI
                </div>
                <div className="text-sm text-purple-200/80 relative z-10">
                  Speak your answers and write real code.
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* TICKER */}
        <section className="py-8 border-y border-white/5 bg-[#0a0a0a]/50 overflow-hidden relative">
          <div className="flex gap-12 w-max animate-[marquee_20s_linear_infinite] hover:[animation-play-state:paused]">
            {[...liveActivity, ...liveActivity, ...liveActivity].map(
              (activity, i) => (
                <div
                  key={i}
                  className="text-gray-400 text-sm font-medium tracking-wide flex items-center gap-2"
                >
                  <span className="text-purple-400 opacity-80">
                    {activity.icon}
                  </span>
                  {activity.text}
                </div>
              ),
            )}
          </div>
        </section>

        {/* 3x2 FEATURE GRID */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Everything you need to get hired.
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Stop reading tutorials. Start practicing. An all-in-one platform
              built for software engineers, by a software engineer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 group/grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative p-[1px] rounded-3xl overflow-hidden bg-white/5 hover:bg-gradient-to-br hover:from-purple-500/50 hover:to-blue-500/50 transition-colors duration-500"
              >
                <div className="h-full w-full bg-[#0a0a0a] rounded-[23px] p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner shadow-white/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 relative z-10 group-hover:text-purple-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed relative z-10">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section
          onMouseEnter={() => setIsHoveringTestimonial(true)}
          onMouseLeave={() => setIsHoveringTestimonial(false)}
          className="py-32 border-y border-white/5 bg-black/40 relative overflow-hidden cursor-none backdrop-blur-sm"
        >
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Built for engineers.
              </h2>
              <p className="text-gray-400 text-xl">
                Early feedback from our private beta testers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  className="p-8 rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:border-white/20"
                >
                  <div className="flex gap-1 text-purple-400 mb-6 text-lg">
                    {[...Array(5)].map((_, starIdx) => (
                      <svg
                        key={starIdx}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-200 text-lg leading-relaxed mb-8">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center font-bold text-white shadow-inner">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-bold">{t.name}</div>
                      <div className="text-purple-400 text-sm font-medium">
                        {t.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-6 leading-[1.1]">
              <span className="text-white">Stop failing interviews.</span>{" "}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-500 drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                Start practicing today.
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Build your resume, track your learning sheets persistently, and
              ace your next technical screen.
            </p>
            <Link
              to="/dashboard"
              className="inline-block px-10 py-5 bg-purple-600 text-white rounded-2xl text-xl font-bold hover:bg-purple-500 transition-all hover:-translate-y-1 shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:shadow-[0_0_60px_rgba(168,85,247,0.7)]"
            >
              Explore Platform as Guest
            </Link>
            <div className="mt-8 text-sm text-gray-500 font-medium">
              No credit card required. Free instant access.
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#050505] pt-16 pb-8 z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="text-2xl font-extrabold text-white mb-2 tracking-tight">
              RoundOne
            </div>
            <p className="text-sm text-gray-500">
              Engineered by Anurag Mishra.
            </p>
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <Link
              to="/privacy"
              className="text-gray-500 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <a
              href="https://github.com/Anurag-Mishra2006"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/anurag-mishra-256101318/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          </div>
          <div>
            <a
              href="https://buymeachai.ezee.li/supreme_1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all group"
            >
              <span className="group-hover:-translate-y-1 group-hover:scale-110 transition-transform origin-bottom-left text-yellow-400">
                ☕
              </span>
              <span>Buy me a Chai</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
