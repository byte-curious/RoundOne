import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import useUserStore from "@/store/authStore";
import {
  getDsaSubmissions,
  getInterviewHistory,
  getDSARoundHistory,
} from "@/services/api";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import { motion, type Variants } from "framer-motion";

function isValidDate(value: unknown): value is string | Date {
  if (!value) return false;
  const d = new Date(value as string | Date);
  return !isNaN(d.getTime()) && d.getTime() !== 0;
}

const SAMPLE_GUEST_HISTORY = [
  {
    id: "sample-voice-1",
    type: "voice",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    displayScore: 94,
    maxScore: 110,
    title: "Google",
    subtitle: "SDE-2 Full Loop",
    evaluations: [
      {
        id: "eval-1",
        round: "technical",
        question:
          "Explain how you would design an idempotent payment processing API.",
        candidateAnswer:
          "Used unique idempotency keys in Redis with short TTL and database row-level locking.",
        score: 9,
        maxScore: 10,
        feedback:
          "Excellent understanding of distributed locking and transaction atomicity.",
        strongPoints: [
          "Clear understanding of Redis TTL",
          "Addressed network retry failure modes",
        ],
        improvements: ["Could mention database dead-letter queue recovery"],
      },
    ],
  },
  {
    id: "sample-dsa-1",
    type: "dsa",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    displayScore: 3,
    maxScore: 3,
    title: "Amazon",
    subtitle: "90-Min Mock OA",
    questions: [
      { id: "q1", title: "Merge K Sorted Lists", difficulty: "HARD" },
    ],
    submissions: [
      {
        questionId: "q1",
        verdict: "AC",
        code: "# Sample Python AC Code",
        language: "python",
      },
    ],
  },
  {
    id: "sample-voice-2",
    type: "voice",
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    displayScore: 88,
    maxScore: 110,
    title: "Meta",
    subtitle: "Frontend Infrastructure",
    evaluations: [],
  },
];

const LEARNING_ROADMAPS = [
  {
    id: "dsa",
    title: "DSA Roadmaps",
    subtitle: "Striver A2Z & Blind 75",
    badge: "450+ Qs",
    color: "text-purple-400",
    border: "border-purple-500/20",
    bg: "bg-purple-500/10",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
        />
      </svg>
    ),
  },
  {
    id: "cp",
    title: "Competitive Programming",
    subtitle: "Codeforces 800 - 2000 Rating",
    badge: "Tiered",
    color: "text-green-400",
    border: "border-green-500/20",
    bg: "bg-green-500/10",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
        />
      </svg>
    ),
  },
  {
    id: "cs-core",
    title: "CS Core Subjects",
    subtitle: "DBMS, OS, OOPS, Networks",
    badge: "Theory",
    color: "text-amber-400",
    border: "border-amber-500/20",
    bg: "bg-amber-500/10",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
    ),
  },
  {
    id: "system-design",
    title: "System Design",
    subtitle: "High-Level Architecture",
    badge: "Case Studies",
    color: "text-rose-400",
    border: "border-rose-500/20",
    bg: "bg-rose-500/10",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"
        />
      </svg>
    ),
  },
];

export default function Dashboard() {
  const { user, isAuthenticate } = useUserStore();
  const navigate = useNavigate();

  const [unifiedHistory, setUnifiedHistory] = useState<any[]>([]);
  const [dsaSubmissions, setDsaSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    voiceScore: 0,
    totalVoice: 0,
    dsaSolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    if (!isAuthenticate) {
      setStats({ voiceScore: 92, totalVoice: 2, dsaSolved: 14 });
      setUnifiedHistory(SAMPLE_GUEST_HISTORY);
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        let voiceSessions = [];
        try {
          const voiceRes = await getInterviewHistory();
          voiceSessions =
            voiceRes.data.sessions ||
            voiceRes.data.history ||
            voiceRes.data.data ||
            voiceRes.data ||
            [];
          if (!Array.isArray(voiceSessions)) voiceSessions = [];
        } catch (e) {
          console.error("Voice History API failed:", e);
        }

        let dsaSessions = [];
        try {
          const dsaMockRes = await getDSARoundHistory();
          dsaSessions =
            dsaMockRes.data.history ||
            dsaMockRes.data.sessions ||
            dsaMockRes.data.data ||
            [];
        } catch (e) {
          console.error("DSA History API failed:", e);
        }

        let practiceSubs = [];
        try {
          const dsaRes = await getDsaSubmissions();
          practiceSubs = dsaRes.data.data || [];
        } catch (e) {
          console.error("Practice Subs API failed:", e);
        }

        const totalVoice = voiceSessions.length;
        const voiceScore =
          totalVoice > 0
            ? Math.round(
                voiceSessions.reduce(
                  (acc: number, curr: any) => acc + (curr.totalScore || 0),
                  0,
                ) / totalVoice,
              )
            : 0;
        const dsaSolved =
          practiceSubs.filter((sub: any) => sub.verdict === "AC").length || 0;
        setStats({ voiceScore, totalVoice, dsaSolved });
        setDsaSubmissions(practiceSubs);

        const combined = [
          ...voiceSessions.map((s: any) => ({
            ...s,
            type: "voice",
            date: s.createdAt,
            displayScore: s.totalScore || 0,
            maxScore: 110,
            title: s.company || "Mock Interview",
            subtitle: s.role || "General",
          })),
          ...dsaSessions.map((s: any) => ({
            ...s,
            type: "dsa",
            date: s.completedAt || s.startedAt,
            displayScore: s.score || 0,
            maxScore: 3,
            title: s.company || "Company",
            subtitle: "90-Min Mock OA",
          })),
        ].filter((item) => isValidDate(item.date));

        combined.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setUnifiedHistory(combined);
      } catch (err) {
        console.error("Critical Dashboard Error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [isAuthenticate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleShare = (sessionId: string) => {
    if (!isAuthenticate) {
      navigate("/login", {
        state: { message: "Please log in to share report cards." },
      });
      return;
    }
    const shareUrl = `${window.location.origin}/report/${sessionId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(sessionId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const heatmapData = isAuthenticate
    ? [
        ...unifiedHistory.map((item) => ({
          createdAt: item.date,
          type: "interview" as const,
        })),
        ...dsaSubmissions
          .filter((sub) => sub.verdict === "AC" && isValidDate(sub.createdAt))
          .map((sub) => ({ createdAt: sub.createdAt, type: "dsa" as const })),
      ]
    : [
        {
          createdAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          type: "interview" as const,
        },
        {
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          type: "dsa" as const,
        },
        {
          createdAt: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          type: "dsa" as const,
        },
        {
          createdAt: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          type: "interview" as const,
        },
        {
          createdAt: new Date(
            Date.now() - 6 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          type: "dsa" as const,
        },
        {
          createdAt: new Date(
            Date.now() - 9 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          type: "interview" as const,
        },
      ];

  const displayedHistory = showAllHistory
    ? unifiedHistory
    : unifiedHistory.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#050505] font-sans relative overflow-hidden flex flex-col selection:bg-purple-500/30">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-20">
        <Navbar />
      </div>

      <main className="flex-grow px-4 py-8 relative z-10 max-w-7xl mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* GUEST MODE BANNER */}
          {!isAuthenticate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900/20 via-blue-900/10 to-transparent border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse shrink-0"></div>
                <div>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    Guest Mode Preview
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Interactive
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    You are exploring RoundOne freely without logging in. Try
                    any feature — create a free account anytime to compile code
                    and save your history.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-gray-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(170,59,255,0.3)] hover:-translate-y-0.5"
                >
                  Create Free Account
                </Link>
              </div>
            </motion.div>
          )}

          {/* Welcome Header */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                {isAuthenticate ? (
                  <>
                    Welcome back,{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </>
                ) : (
                  <>
                    Welcome to{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                      RoundOne
                    </span>
                  </>
                )}
              </h1>
              <p className="text-gray-400 mt-2 text-lg">
                {isAuthenticate
                  ? "Your technical profile and interview progress."
                  : "Explore the technical preparation arena in guest preview mode."}
              </p>
            </div>
          </motion.div>

          {/* BENTO BOX GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN: Stats, Actions & Learning Roadmaps */}
            <div className="lg:col-span-1 space-y-6">
              {/* Stats Card */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 gap-4"
              >
                <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-col justify-center shadow-lg">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
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
                        d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                      />
                    </svg>
                  </div>
                  <p className="text-2xl font-extrabold text-white">
                    {stats.totalVoice}
                  </p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                    Voice Mocks
                  </p>
                </div>
                <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-col justify-center shadow-lg">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
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
                        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                      />
                    </svg>
                  </div>
                  <p className="text-2xl font-extrabold text-white">
                    {stats.dsaSolved}
                  </p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                    DSA Solved
                  </p>
                </div>
                <div className="col-span-2 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden">
                  <div className="absolute right-[-10%] top-[-50%] w-32 h-32 bg-purple-500/10 blur-[30px] rounded-full"></div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                      Avg Voice Score
                    </p>
                    <div className="flex items-end gap-2">
                      <p
                        className={`text-4xl font-extrabold ${stats.voiceScore >= 80 ? "text-green-400" : stats.voiceScore >= 50 ? "text-yellow-400" : "text-red-400"}`}
                      >
                        {stats.voiceScore}
                      </p>
                      <span className="text-gray-500 mb-1">/ 110</span>
                    </div>
                  </div>
                  <div className="w-16 h-16">
                    <svg
                      viewBox="0 0 36 36"
                      className="w-full h-full transform -rotate-90"
                    >
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="3"
                        strokeDasharray={`${(stats.voiceScore / 110) * 100}, 100`}
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions (Now 4 buttons) */}
              <motion.div
                variants={itemVariants}
                className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-lg"
              >
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/practice")}
                    className="w-full bg-purple-600 text-white rounded-xl py-3.5 font-bold hover:bg-purple-500 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                      />
                    </svg>
                    Practice DSA
                  </button>

                  <button
                    onClick={() => navigate("/learning")}
                    className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl py-3.5 font-bold hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                      />
                    </svg>
                    Learning Hub & Roadmaps
                  </button>

                  <button
                    onClick={() => navigate("/dsa-mock/setup")}
                    className="w-full bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl py-3.5 font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 group-hover:rotate-12 transition-transform"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Take Mock OA
                  </button>

                  <button
                    onClick={() => navigate("/resume-upload")}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3.5 font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                      />
                    </svg>
                    Voice Mock Interview
                  </button>
                </div>
              </motion.div>

              {/* DEDICATED CURRICULUM & ROADMAPS WIDGET */}
              <motion.div
                variants={itemVariants}
                className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Curriculum Tracks
                    </h2>
                  </div>
                  <Link
                    to="/learning"
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 group"
                  >
                    View All
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {LEARNING_ROADMAPS.map((roadmap) => (
                    <div
                      key={roadmap.id}
                      onClick={() => navigate(`/learning/${roadmap.id}`)}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border ${roadmap.bg} ${roadmap.border} ${roadmap.color}`}
                        >
                          {roadmap.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                            {roadmap.title}
                          </p>
                          <p className="text-[11px] text-gray-500 font-medium">
                            {roadmap.subtitle}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        {roadmap.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Heatmap & Assessments List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Heatmap */}
              <motion.div
                variants={itemVariants}
                className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-lg"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">
                      Consistency Heatmap
                    </h2>
                    {!isAuthenticate && (
                      <span className="text-[10px] text-gray-500 font-bold border border-white/10 px-2 py-0.5 rounded">
                        Sample
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-sm bg-purple-500"></div>{" "}
                      Interviews
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-sm bg-blue-500"></div>{" "}
                      Code AC
                    </span>
                  </div>
                </div>
                <ActivityHeatmap activities={heatmapData} />
              </motion.div>

              {/* Assessments List */}
              <motion.div
                variants={itemVariants}
                className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg overflow-hidden flex flex-col max-h-[600px]"
              >
                <div className="p-6 border-b border-white/10 bg-white/5 shrink-0 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-white">
                    Recent Assessments
                  </h2>
                  {!isAuthenticate && (
                    <span className="text-xs text-purple-400 font-semibold">
                      Demo Assessments
                    </span>
                  )}
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-20 bg-white/5 rounded-xl animate-pulse"
                        ></div>
                      ))}
                    </div>
                  ) : error ? (
                    <p className="text-red-400 text-sm">{error}</p>
                  ) : unifiedHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">
                        No assessments completed yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {displayedHistory.map((session) => (
                        <div
                          key={session.id}
                          className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/10 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${session.type === "voice" ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}
                            >
                              {session.type === "voice" ? (
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
                                    d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                                  />
                                </svg>
                              ) : (
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
                                    d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                                  />
                                </svg>
                              )}
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                                {session.title}{" "}
                                <span className="text-gray-500 font-normal text-sm ml-1">
                                  • {session.subtitle}
                                </span>
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(session.date)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 sm:mt-0 flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <p
                                className={`font-bold text-xl font-mono ${session.type === "voice" ? (session.displayScore >= 80 ? "text-green-400" : session.displayScore >= 50 ? "text-yellow-400" : "text-red-400") : session.displayScore === 3 ? "text-green-400" : session.displayScore > 0 ? "text-yellow-400" : "text-red-400"}`}
                              >
                                {session.displayScore}{" "}
                                <span className="text-xs font-sans text-gray-500">
                                  / {session.maxScore}
                                </span>
                              </p>
                            </div>

                            {session.type === "voice" && (
                              <button
                                onClick={() => handleShare(session.id)}
                                className="px-3 py-2 bg-black/50 border border-white/10 text-xs font-bold text-gray-400 rounded-lg hover:border-white/30 hover:text-white transition-all w-[85px] flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                {copiedId === session.id ? (
                                  <>✓ Copied</>
                                ) : (
                                  <>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={2}
                                      stroke="currentColor"
                                      className="w-3.5 h-3.5"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                                      />
                                    </svg>{" "}
                                    Share
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (
                                  !isAuthenticate &&
                                  session.id.startsWith("sample-")
                                ) {
                                  navigate(`/review/${session.id}`, {
                                    state: { session },
                                  });
                                } else {
                                  navigate(
                                    session.type === "voice"
                                      ? `/review/${session.id}`
                                      : `/dsa-mock/review/${session.id}`,
                                    { state: { session } },
                                  );
                                }
                              }}
                              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border cursor-pointer ${session.type === "voice" ? "bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500 hover:text-white" : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500 hover:text-white"}`}
                            >
                              Review
                            </button>
                          </div>
                        </div>
                      ))}

                      {unifiedHistory.length > 4 && (
                        <button
                          onClick={() => setShowAllHistory(!showAllHistory)}
                          className="w-full py-3 text-sm text-gray-400 font-bold hover:text-white transition-colors bg-white/5 rounded-xl border border-white/10 border-dashed hover:border-solid hover:border-white/30 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {showAllHistory ? (
                            <>
                              Show Less{" "}
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
                                  d="M4.5 15.75l7.5-7.5 7.5 7.5"
                                />
                              </svg>
                            </>
                          ) : (
                            <>
                              View All History{" "}
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
                                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                />
                              </svg>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
