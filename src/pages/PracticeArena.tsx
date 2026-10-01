import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import {
  getPracticeQuestionBySlug,
  submitCode,
  submitPracticeCode,
  getCodeResult,
  getQuestionSubmissions,
} from "@/services/api";
import { useSTT } from "@/hooks/useSTT";
import useUserStore from "@/store/authStore";
// --- BOILERPLATE CODE TEMPLATES ---
const BOILERPLATES: Record<string, string> = {
  python:
    "import sys\n\ndef solve():\n    # Read all standard input\n    input_data = sys.stdin.read().split()\n    if not input_data: return\n    \n    # Write your logic here\n    \n\nif __name__ == '__main__':\n    solve()",
  cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Read from standard input\n    \n    // Write your logic here\n    \n    return 0;\n}",
  java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        \n        // Write your logic here\n        \n    }\n}",
  javascript:
    "const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');\n    if (!input.length || input[0] === '') return;\n    \n    // Write your logic here\n    \n}\n\nsolve();",
};

export default function PracticeArena() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticate } = useUserStore();
  // Data State
  const [question, setQuestion] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState("description"); // "description" | "submissions"

  // Editor State
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(BOILERPLATES["python"]);
  const [userApproach, setUserApproach] = useState("");

  // Custom STT Hook (Whisper/Groq)
  const { isRecording, isProcessing, startRecording, stopRecording } = useSTT();

  // Execution State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Helper to fetch submissions
  const fetchSubmissions = async (questionId: string) => {
    if (!isAuthenticate) {
      setSubmissions([]);
      return;
    }
    try {
      const subRes = await getQuestionSubmissions(questionId);
      setSubmissions(subRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    }
  };
  // 1. Initial Data Fetch (Question + Submissions)
  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        const res = await getPracticeQuestionBySlug(slug as string);
        const qData = res.data.data;
        setQuestion(qData);
        if (isAuthenticate) {
          // Fetch submissions right after getting the question ID
          await fetchSubmissions(qData.id);
        }
      } catch (error) {
        console.error("Failed to fetch question:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestionData();
  }, [slug, isAuthenticate]);

  // 2. Handle Language Change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(BOILERPLATES[newLang]);
  };

  // 3. Speech-to-Text Toggle using your Custom Hook
  const toggleListening = async () => {
    if (!isAuthenticate) {
      navigate("/login", {
        state: {
          message: "Please log in to explain your approach using AI voice.",
        },
      });
      return;
    }
    if (isRecording) {
      try {
        // stopRecording returns a promise with the transcribed text!
        const transcript = await stopRecording();

        // Append the text to the textarea, adding a space if there's already text there
        setUserApproach((prev) => prev + (prev ? " " : "") + transcript);
      } catch (error) {
        console.error("Transcription failed", error);
        alert("Failed to transcribe audio.");
      }
    } else {
      startRecording();
    }
  };

  // 4. Polling Logic for Execution
  const pollResult = (jobId: string, isSubmitType: boolean) => {
    const interval = setInterval(async () => {
      try {
        const res = await getCodeResult(jobId);
        const jobData = res.data;

        if (jobData.status === "completed") {
          clearInterval(interval);

          if (isSubmitType) {
            // THIS WAS A REAL SUBMISSION
            setResult({
              isRunOnly: false,
              verdict: jobData.result.verdict,
              aiFeedback:
                "AI is generating your code review in the background. Check your Submissions tab in a few seconds!",
              timeComplexity: "",
              spaceComplexity: "",
            });

            // Automatically fetch the latest submissions so it shows up in the tab!
            if (question) fetchSubmissions(question.id);
          } else {
            const executionResult = jobData.result.result;

            const dockerResult = Array.isArray(executionResult.results)
              ? executionResult.results[0]
              : executionResult;

            const actualOutput = (
              dockerResult.stdout ||
              dockerResult.stderr ||
              ""
            ).trim();
            const expectedOutput = (
              dockerResult.expectedOutput ||
              question.testCases[0]?.expectedOutput ||
              ""
            ).trim();

            const verdict =
              dockerResult.verdict === "AC"
                ? "Accepted"
                : dockerResult.verdict === "WA"
                  ? "Wrong Answer"
                  : dockerResult.verdict;

            setResult({
              isRunOnly: true,
              verdict,
              stdout: actualOutput,
              input: question.testCases[0]?.input,
              expectedOutput,
            });
          }

          setIsRunning(false);
          setIsSubmitting(false);
        } else if (jobData.status === "failed") {
          clearInterval(interval);
          setResult({
            isRunOnly: true,
            verdict: "System Error",
            stdout: "Execution failed.",
          });
          setIsRunning(false);
          setIsSubmitting(false);
        }
      } catch (err) {
        clearInterval(interval);
        setIsRunning(false);
        setIsSubmitting(false);
      }
    }, 1000);
  };

  //  Handle Run Code
  const handleRunCode = async () => {
    if (!isAuthenticate) {
      navigate("/login", {
        state: { message: "Please log in to run your code." },
      });
      return;
    }
    if (!code.trim()) return;
    setIsRunning(true);
    setResult(null);

    try {
      const response = await submitCode({
        language,
        code,
        testCases: question.testCases, // Pass only visible test cases
      });
      pollResult(response.data.submissionId, false);
    } catch (error) {
      console.error(error);
      setIsRunning(false);
    }
  };

  // 6. Handle Submit Code
  const handleSubmit = async () => {
    if (!isAuthenticate) {
      navigate("/login", {
        state: { message: "Please log in to submit your solution." },
      });
      return;
    }
    if (!code.trim()) return;
    setIsSubmitting(true);
    setResult(null);
    setActiveTab("description"); // Switch back to description on new submit to see live results

    try {
      const response = await submitPracticeCode({
        questionId: question.id,
        language,
        code,
        userApproach,
      });
      pollResult(response.data.jobId, true);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-white">
        <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mr-3"></div>
        Loading Arena...
      </div>
    );
  if (!question)
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-white">
        Question not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--bg)] font-sans flex flex-col h-screen overflow-hidden selection:bg-purple-500/30">
      <Navbar />

      <div className="flex-grow flex flex-col lg:flex-row w-full h-[calc(100vh-70px)] p-4 gap-4">
        {/* --- LEFT PANEL: Tabs, Description, Submissions --- */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 h-full overflow-hidden">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex flex-col overflow-hidden h-full shadow-lg relative"
          >
            {/* Tabs Header */}
            <div className="flex border-b border-[var(--border)] bg-[var(--bg)]/50 shrink-0">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === "description" ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--text-muted)] hover:text-white"}`}
              >
                {/* Document SVG */}
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
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                Description
              </button>
              <button
                onClick={() => setActiveTab("submissions")}
                className={`px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === "submissions" ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--text-muted)] hover:text-white"}`}
              >
                {/* Clock / History SVG */}
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
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Submissions{" "}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "submissions" ? "bg-[var(--accent)]/20" : "bg-[var(--border)] text-[var(--text)]"}`}
                >
                  {submissions.length}
                </span>
              </button>
            </div>

            {/* Tab Content Area */}
            <div className="p-6 overflow-y-auto flex-grow flex flex-col relative custom-scrollbar">
              {activeTab === "description" ? (
                // TAB 1: DESCRIPTION
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md border ${
                        question.difficulty === "EASY"
                          ? "text-green-400 bg-green-400/10 border-green-400/20"
                          : question.difficulty === "MEDIUM"
                            ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                            : "text-red-400 bg-red-400/10 border-red-400/20"
                      }`}
                    >
                      {question.difficulty}
                    </span>
                    {question.companies.map((c: string) => (
                      <span
                        key={c}
                        className="text-[10px] uppercase font-bold text-[var(--text-muted)] bg-[var(--bg)] px-2 py-1.5 rounded border border-[var(--border)]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  <h1 className="text-3xl font-extrabold text-white mb-6 tracking-tight">
                    {question.title}
                  </h1>

                  <div className="prose prose-invert prose-p:text-gray-300 prose-pre:bg-[var(--bg)] prose-pre:border prose-pre:border-[var(--border)] max-w-none mb-8 flex-grow">
                    <ReactMarkdown>{question.description}</ReactMarkdown>
                  </div>
                  {/* Test Cases / Examples - LeetCode style */}
                  {question.testCases && question.testCases.length > 0 && (
                    <div className="mb-8 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                        Examples
                      </h3>
                      {question.testCases.map((tc: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4"
                        >
                          <p className="text-xs font-bold text-[var(--text-muted)] mb-3">
                            Example {idx + 1}
                          </p>
                          <div className="space-y-2 font-mono text-sm text-gray-300">
                            <div>
                              <span className="text-[var(--text-muted)] font-sans font-bold">
                                Input:{" "}
                              </span>
                              <span className="whitespace-pre-wrap">
                                {tc.input}
                              </span>
                            </div>
                            <div>
                              <span className="text-[var(--text-muted)] font-sans font-bold">
                                Output:{" "}
                              </span>
                              <span className="whitespace-pre-wrap">
                                {tc.expectedOutput}
                              </span>
                            </div>
                            {tc.explanation && (
                              <div>
                                <span className="text-[var(--text-muted)] font-sans font-bold">
                                  Explanation:{" "}
                                </span>
                                <span>{tc.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* STT User Approach Box */}
                  <div className="mt-auto border-t border-[var(--border)] pt-6 relative">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-2">
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
                            d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.2m-1.5.2a6.01 6.01 0 01-1.5-.2m1.5.2V8.25m0 0c0-1.657 1.343-3 3-3h1.5M12 8.25c0-1.657-1.343-3-3-3H7.5m10.5 3a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Explain approach to AI
                      </label>

                      {/* UPDATED STT BUTTON */}
                      <button
                        onClick={toggleListening}
                        disabled={isProcessing}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          isRecording
                            ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse"
                            : isProcessing
                              ? "bg-[var(--warning)]/20 text-[var(--warning)] border-[var(--warning)]/50"
                              : "bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)] hover:text-white hover:border-[var(--accent)]/50"
                        } disabled:opacity-50`}
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-3 h-3 border-2 border-[var(--warning)] border-t-transparent rounded-full animate-spin"></div>{" "}
                            Processing...
                          </>
                        ) : isRecording ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-3.5 h-3.5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z"
                                clipRule="evenodd"
                              />
                            </svg>{" "}
                            Stop
                          </>
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
                                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                              />
                            </svg>{" "}
                            Speak
                          </>
                        )}
                      </button>
                    </div>

                    <textarea
                      value={userApproach}
                      onChange={(e) => setUserApproach(e.target.value)}
                      placeholder="I plan to use a hash map to keep track of..."
                      className={`w-full h-24 bg-[var(--bg)] border rounded-xl p-3 text-sm text-[var(--text)] outline-none resize-none transition-all ${
                        isRecording
                          ? "border-[var(--accent)] shadow-[0_0_15px_rgba(170,59,255,0.2)]"
                          : "border-[var(--border)] focus:border-[var(--accent)]"
                      }`}
                    />
                  </div>
                </>
              ) : (
                // TAB 2: SUBMISSIONS HISTORY
                <div className="space-y-6">
                  {submissions.length === 0 ? (
                    <div className="text-center text-[var(--text-muted)] py-10 flex flex-col items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1}
                        stroke="currentColor"
                        className="w-12 h-12 opacity-20"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
                        />
                      </svg>
                      You have not submitted any code for this problem yet.
                    </div>
                  ) : (
                    submissions.map((sub: any) => (
                      <div
                        key={sub.id}
                        className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-lg"
                      >
                        {/* Submission Header */}
                        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]/50">
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-lg font-black ${sub.verdict === "AC" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                            >
                              {sub.verdict === "AC"
                                ? "Accepted"
                                : sub.verdict === "WA"
                                  ? "Wrong Answer"
                                  : sub.verdict}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] px-2 py-1 bg-[var(--border)] rounded-md uppercase font-bold tracking-wider">
                              {sub.language}
                            </span>
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            {new Date(sub.createdAt).toLocaleDateString()} at{" "}
                            {new Date(sub.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>

                        {/* AI Feedback Area */}
                        {sub.aiFeedback && (
                          <div className="p-5 bg-[var(--accent)]/5 border-b border-[var(--accent)]/10">
                            <p className="text-xs text-[var(--accent)] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
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
                                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                                />
                              </svg>
                              AI Code Review
                            </p>
                            <p className="text-sm text-[var(--text)] leading-relaxed italic">
                              "{sub.aiFeedback}"
                            </p>

                            {sub.verdict === "AC" && (
                              <div className="flex gap-4 mt-4">
                                <span className="text-[10px] text-[var(--text-muted)] font-mono bg-[var(--bg)] px-2 py-1.5 rounded border border-[var(--border)] uppercase tracking-widest">
                                  Time:{" "}
                                  <span className="text-white font-bold">
                                    {sub.timeComplexity}
                                  </span>
                                </span>
                                <span className="text-[10px] text-[var(--text-muted)] font-mono bg-[var(--bg)] px-2 py-1.5 rounded border border-[var(--border)] uppercase tracking-widest">
                                  Space:{" "}
                                  <span className="text-white font-bold">
                                    {sub.spaceComplexity}
                                  </span>
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Code Viewer (Read Only) */}
                        <div className="p-4 bg-[#0d0d0d]">
                          <pre className="text-xs text-gray-400 font-mono overflow-x-auto whitespace-pre-wrap">
                            {sub.code}
                          </pre>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* --- RIGHT PANEL: Editor & Console --- */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 h-full">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-t-2xl p-3 flex justify-between items-center shrink-0 shadow-sm z-10">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-[var(--bg)] border border-[var(--border)] text-white text-sm rounded-lg px-3 py-1.5 outline-none cursor-pointer focus:border-[var(--accent)]/50 transition-colors"
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
            </select>

            <div className="flex gap-3">
              <button
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-[var(--surface)] hover:text-white transition-all disabled:opacity-50 flex items-center gap-2 group"
              >
                {isRunning ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {isRunning ? "Running..." : "Run Code"}
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isRunning}
                className="bg-[var(--accent)] text-white px-5 py-1.5 rounded-lg text-sm font-bold hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(170,59,255,0.3)] hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-3.5 h-3.5 -rotate-45 -mt-0.5"
                    >
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex-grow border-x border-[var(--border)] overflow-hidden shadow-2xl relative">
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 },
                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
              }}
            />
          </div>

          {/* CONSOLE WINDOW */}
          <div className="h-64 bg-[#0a0a0a]/90 backdrop-blur-xl border border-[var(--border)] rounded-b-2xl p-4 overflow-y-auto shrink-0 relative shadow-2xl custom-scrollbar z-10">
            {!result ? (
              <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm italic">
                Run or Submit your code to see results.
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3
                  className={`text-2xl font-black tracking-tight flex items-center gap-2 ${result.verdict === "Accepted" || result.verdict === "AC" || result.verdict === "Success" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                >
                  {result.verdict === "AC" ||
                  result.verdict === "Accepted" ||
                  result.verdict === "Success" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {result.verdict === "AC"
                    ? "Accepted"
                    : result.verdict === "WA"
                      ? "Wrong Answer"
                      : result.verdict}
                </h3>

                {result.isRunOnly ? (
                  <div className="flex flex-col gap-3 mt-4">
                    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden">
                      <div className="bg-white/5 px-4 py-2 border-b border-[var(--border)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                        Input
                      </div>
                      <pre className="p-4 text-sm text-[var(--text)] font-mono whitespace-pre-wrap">
                        {result.input}
                      </pre>
                    </div>

                    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden">
                      <div className="bg-white/5 px-4 py-2 border-b border-[var(--border)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                        Your Output
                      </div>
                      <pre
                        className={`p-4 text-sm font-mono whitespace-pre-wrap ${result.verdict === "Accepted" || result.verdict === "Success" ? "text-green-400" : "text-red-400"}`}
                      >
                        {result.stdout || "No output generated."}
                      </pre>
                    </div>

                    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden">
                      <div className="bg-white/5 px-4 py-2 border-b border-[var(--border)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                        Expected Output
                      </div>
                      <pre className="p-4 text-sm text-[var(--text)] font-mono whitespace-pre-wrap">
                        {result.expectedOutput}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <>
                    {result.verdict === "AC" && (
                      <div className="flex gap-4">
                        <div className="bg-[var(--bg)] border border-[var(--border)] px-4 py-2 rounded-lg">
                          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
                            Time Complexity
                          </p>
                          <p className="text-[var(--text)] font-mono font-bold mt-1">
                            {result.timeComplexity}
                          </p>
                        </div>
                        <div className="bg-[var(--bg)] border border-[var(--border)] px-4 py-2 rounded-lg">
                          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
                            Space Complexity
                          </p>
                          <p className="text-[var(--text)] font-mono font-bold mt-1">
                            {result.spaceComplexity}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-5 rounded-xl mt-4">
                      <p className="text-xs text-[var(--accent)] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
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
                            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                          />
                        </svg>
                        AI Feedback
                      </p>
                      <p className="text-sm text-[var(--text)] leading-relaxed italic">
                        "{result.aiFeedback}"
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
