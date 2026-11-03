import { evaluateInterview, submitCode } from "@/services/api"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import useSessionStore from "@/store/sessionStore"
import type { EvaluateResult } from "@/types/index"
import CodeEditor from "@/components/CodeEditor"
import Navbar from "@/components/Navbar"
import { useSTT } from "@/hooks/useSTT"
import { playQuestionAudio, stopQuestionAudio } from "../utils/audioPlayer"

const BOILERPLATE_CODE: Record<string, string> = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n\t// your code goes here\n\treturn 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\n\t// your code goes here\n\treturn 0;\n}`,
  javascript: `function main() {\n\t// your code goes here\n}\n\nmain();`,
  python: `def main():\n\t# your code goes here\n\tpass\n\nif __name__ == "__main__":\n\tmain()`,
  json: `{\n\t"message": "your code goes here"\n}`,
  java: `import java.util.*;\n\npublic class Main {\n\tpublic static void main(String[] args) {\n\t\t// your code goes here\n\t}\n}`,
};

function Interview() {
  const navigate = useNavigate()

  const [currentRound, setCurrentRound] = useState<"hr" | "technical" | "dsa">("hr")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [evaluation, setEvaluation] = useState<EvaluateResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [code, setCode] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any[]>([]);

  // DSA spoken approach
  const [spokenApproach, setSpokenApproach] = useState<string>("");

  // Cached Audio State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);

  // STT hook
  const { startRecording, stopRecording, isRecording, isProcessing } = useSTT();

  // zustand store
  const { hr, technical, dsa, company, addEvaluation } = useSessionStore()

  const language = dsa?.language || "";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://api.roundoneprep.me";

  useEffect(() => {
    if (currentRound === "dsa" && language) {
      setCode(BOILERPLATE_CODE[language] || "")
    }
  }, [language, currentRound])

  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  }

  useEffect(() => {
    if (!hr || !technical || !dsa) {
      navigate("/onboarding")
    }
  }, [hr, technical, dsa, navigate]);

  const getCurrentQuestion = (): string => {
    if (currentRound === "hr") return hr?.questions[currentQuestionIndex]?.question ?? ""
    if (currentRound === "technical") return technical?.questions[currentQuestionIndex]?.question ?? ""
    if (currentRound === "dsa") return dsa?.problem.description ?? ""
    return ""
  }

  const getRoundLabel = (): string => {
    if (currentRound === "hr") return `HR Round — Question ${currentQuestionIndex + 1}/5`
    if (currentRound === "technical") return `Technical Round — Question ${currentQuestionIndex + 1}/5`
    if (currentRound === "dsa") return "DSA Round — Problem 1/1"
    return ""
  }

  // Audio Playback with Cache
  const handleSpeak = (text: string) => {
    if (!text) return;
    setIsLoadingAudio(true);
    playQuestionAudio(text, backendUrl, {
      onStart: () => {
        setIsLoadingAudio(false);
        setIsSpeaking(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsLoadingAudio(false);
      },
      onError: (err) => {
        console.error("Audio error:", err);
        setIsSpeaking(false);
        setIsLoadingAudio(false);
      }
    });
  };

  const handleStopAudio = () => {
    stopQuestionAudio();
    setIsSpeaking(false);
    setIsLoadingAudio(false);
  };

  // Speak question automatically when question changes
  useEffect(() => {
    const questionText = getCurrentQuestion();
    if (questionText && !evaluation) {
      handleSpeak(questionText);
    }
    return () => {
      handleStopAudio();
    };
  }, [currentRound, currentQuestionIndex, hr, technical, dsa, evaluation]);

  // Speech To Text Handlers (Click to Toggle)
  const handleToggleRecording = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (isRecording) {
      try {
        const transcript = await stopRecording();
        if (currentRound === "dsa") {
          setSpokenApproach(transcript);
        } else {
          setAnswer(prev => prev + (prev ? " " : "") + transcript);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to process audio. Please try typing.");
      }
    } else {
      setError("");
      // ECHO PREVENTION: Cut off AI voice immediately before recording mic starts
      handleStopAudio();
      await startRecording();
    }
  };

  // Instant Native Code Execution (No Polling Loop)
  const handleRunCode = async () => {
    setError("");
    setTestResult([]);

    if (!code.trim()) {
      setError("Write Code before running");
      return;
    }
    if (!language) {
      setError("Select a language in onboarding");
      return;
    }

    try {
      setIsRunning(true);

      const testCases = (dsa?.problem.examples || []).map(ex => ({
        input: ex.input,
        expectedOutput: ex.output
      }));

      // Direct execution response
      const submitResponse = await submitCode({ language, code, testCases });

      if (submitResponse.status === 200 || submitResponse.status === 202) {
        const results = submitResponse.data?.result?.results || submitResponse.data?.results || [];
        setTestResult(results);
      } else {
        setError("Code execution returned an unexpected status");
      }

    } catch (error: any) {
      console.error(error);
      setError(error?.response?.data?.error || "Execution failed. Check your syntax.");
    } finally {
      setIsRunning(false);
    }
  }

  const handleSubmit = async () => {
    setError("")

    const currentSession = currentRound === "dsa" ? code : answer
    if (!currentSession.trim()) {
      setError("Please write an answer before submitting")
      return
    }
    setLoading(true)
    handleStopAudio();

    try {
      const response = await evaluateInterview({
        round: currentRound,
        question: getCurrentQuestion(),
        answer: currentSession,
        company,
        ...(currentRound === "dsa" && { spokenApproach: spokenApproach })
      })
      if (response.status !== 200) {
        setError("Evaluation failed")
        return
      }
      const result: EvaluateResult = response.data.evaluateResult
      result.question = getCurrentQuestion();
      result.answer = currentSession;
      setEvaluation(result)
      addEvaluation(result)
    } catch (error: any) {
      setError(error?.response?.data?.error || "Something went wrong during evaluation")
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    handleStopAudio();
    setEvaluation(null)
    setAnswer("")
    setSpokenApproach("")
    setError("")
    setTestResult([])

    if (currentRound === "hr") {
      if (currentQuestionIndex < 4) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        setCurrentRound("technical")
        setCurrentQuestionIndex(0)
      }
    } else if (currentRound === "technical") {
      if (currentQuestionIndex < 4) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        setCurrentRound("dsa")
        setCurrentQuestionIndex(0)
      }
    } else if (currentRound === "dsa") {
      navigate("/feedback");
      return;
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 8) return "var(--success)"
    if (score >= 5) return "var(--warning)"
    return "var(--danger)"
  }

  const renderVerdictIcon = (v: string) => {
    if (v === "AC") return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[var(--success)]"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>;
    if (v === "WA") return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[var(--danger)]"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" /></svg>;
    if (v === "TLE") return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[var(--warning)]"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    if (v === "MLE") return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-orange-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[var(--danger)]"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--bg)] px-4 py-10">
        <div className="max-w-2xl mx-auto">

          {/* Round label */}
          <div className="mb-6">
            <span className="text-xs font-medium uppercase tracking-widest text-[var(--accent)]">
              {getRoundLabel()}
            </span>
            <div className="mt-2 h-1 w-full rounded-full bg-[var(--surface)]">
              <div
                className="h-1 rounded-full bg-[var(--accent)] transition-all duration-500"
                style={{
                  width: currentRound === "hr"
                    ? `${((currentQuestionIndex + 1) / 5) * 33}%`
                    : currentRound === "technical"
                      ? `${33 + ((currentQuestionIndex + 1) / 5) * 33}%`
                      : "100%"
                }}
              />
            </div>
          </div>

          {/* Question card */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 mb-6 shadow-lg shadow-black/20">
            {currentRound === "dsa" && dsa && (
              <p className="text-xs font-bold text-[var(--accent)] mb-3 uppercase tracking-wider">
                {dsa.problem.title}
              </p>
            )}

            {/* Voice Controls UI with Cache Support */}
            <div className="flex items-center gap-3 mb-4 h-8">
              {isLoadingAudio ? (
                <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                  Loading audio...
                </span>
              ) : isSpeaking ? (
                <button onClick={handleStopAudio} className="text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20 rounded-md hover:bg-[var(--danger)]/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" /></svg>
                  Stop Audio
                </button>
              ) : (
                <button onClick={() => handleSpeak(getCurrentQuestion())} className="text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded-md hover:bg-[var(--accent)]/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
                  {evaluation ? "Listen Again" : "Replay Question"}
                </button>
              )}
            </div>

            <p className="text-[var(--text)] text-base leading-relaxed font-medium">
              {getCurrentQuestion()}
            </p>

            {currentRound === "dsa" && dsa?.problem.examples && (
              <div className="mt-5 space-y-3">
                {dsa.problem.examples.map((ex, i) => (
                  <div key={i} className="rounded-lg bg-[var(--bg)] border border-[var(--border)] p-4 text-sm font-mono text-[var(--text-muted)] space-y-1">
                    <p><span className="text-[var(--accent)] font-bold">Input:</span> {ex.input}</p>
                    <p><span className="text-[var(--accent)] font-bold">Output:</span> {ex.output}</p>
                    <p><span className="text-[var(--accent)] font-bold">Explanation:</span> {ex.explanation}</p>
                  </div>
                ))}
              </div>
            )}
            {currentRound === "dsa" && dsa?.problem.constraints && (
              <div className="mt-4">
                <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider mb-2">Constraints:</p>
                <ul className="list-disc list-inside space-y-1">
                  {dsa.problem.constraints.map((c, i) => (
                    <li key={i} className="text-xs font-mono text-[var(--text-muted)]">{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Answer input & Buttons */}
          {!evaluation && (
            <div className="space-y-4">
              {currentRound === "dsa" ? (
                <>
                  <CodeEditor
                    value={code}
                    language={language || "plaintext"}
                    onChange={(newValue) => setCode(newValue || "")}
                    onMount={handleEditorDidMount}
                  />
                  {spokenApproach && (
                    <div className="mt-2 p-4 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20 shadow-inner">
                      <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
                        Your Recorded Approach
                      </p>
                      <p className="text-sm text-[var(--text)] italic leading-relaxed">"{spokenApproach}"</p>
                    </div>
                  )}
                </>
              ) : (
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={6}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none shadow-inner"
                />
              )}

              {error && (
                <div className="p-3 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 flex items-center gap-2 text-[var(--danger)] text-sm font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {error}
                </div>
              )}

              {/* ACTION BUTTONS (Microphone + Run + Submit) */}
              <div className="flex flex-col gap-3 pt-2">

                {/* Click to Speak Toggle Button with Echo Prevention */}
                <button
                  onClick={handleToggleRecording}
                  disabled={loading || isRunning || isProcessing}
                  className={`w-full rounded-xl px-4 py-3.5 text-sm font-bold transition-all select-none flex items-center justify-center gap-2
                    ${isRecording
                      ? "bg-[var(--danger)] text-white scale-[1.02] shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                      : isProcessing
                        ? "bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed"
                        : "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--border)] hover:text-white hover:-translate-y-0.5"
                    }
                    `}
                >
                  {isProcessing ? (
                    <>
                        <div className="w-4 h-4 border-2 border-[var(--text-muted)] border-t-transparent rounded-full animate-spin"></div>
                        Transcribing Audio...
                    </>
                  ) : isRecording ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 animate-pulse"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
                        Recording... Click to Stop
                    </>
                  ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--text-muted)]"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
                        {currentRound === "dsa"
                          ? (spokenApproach ? "Click to Re-record Approach" : "Click to Explain Approach (Optional)")
                          : "Click to Speak Answer"}
                    </>
                  )}
                </button>

                {/* Submit & Run Buttons */}
                <div className="flex gap-3">
                  {currentRound === "dsa" && (
                    <button
                      onClick={handleRunCode}
                      disabled={isRunning || loading}
                      className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      {isRunning ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" /></svg>
                      )}
                      {isRunning ? "Running..." : "Run Code"}
                    </button>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading || isRunning || isRecording || isProcessing}
                    className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : null}
                    {loading ? "Evaluating..." : "Submit Answer"}
                  </button>
                </div>
              </div>

              {/* Test Results UI */}
              {Array.isArray(testResult) && testResult.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider mb-2">Test Results:</h3>

                  {testResult.map((result: any, index: number) => {
                    const isPassed = result.verdict === "AC" || result.passed === true;
                    const getVerdictLabel = (v: string) => {
                      if (v === "AC") return "Accepted";
                      if (v === "WA") return "Wrong Answer";
                      if (v === "TLE") return "Time Limit Exceeded";
                      if (v === "MLE") return "Memory Limit Exceeded";
                      if (v === "RTE") return "Runtime Error";
                      if (v === "CE") return "Compilation Error";
                      return isPassed ? "Accepted" : "Failed";
                    };

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border ${isPassed ? 'border-[var(--success)]/50 bg-[var(--success)]/10' : 'border-[var(--danger)]/50 bg-[var(--danger)]/10'}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                            {renderVerdictIcon(result.verdict || (isPassed ? "AC" : "WA"))}
                            <p className={`text-sm font-bold ${isPassed ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                              Test Case {index + 1}: {getVerdictLabel(result.verdict)}
                            </p>
                        </div>

                        {!isPassed && (
                          <div className="mt-3 text-xs font-mono bg-black/40 rounded-lg p-3 space-y-2 border border-white/5">
                            {result.stderr ? (
                              <p className="text-[var(--danger)] whitespace-pre-wrap">{result.stderr}</p>
                            ) : (
                              <>
                                <p><span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px] block mb-1">Expected:</span> <span className="text-[var(--text)]">{result.expectedOutput}</span></p>
                                <p><span className="text-[var(--danger)] uppercase tracking-wider text-[10px] block mb-1">Actual:</span> <span className="text-[var(--text)]">{result.stdout}</span></p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Evaluation result */}
          {evaluation && (
            <div className="space-y-6 mt-6">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8 shadow-xl shadow-black/20">
                {/* Score */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[var(--border)] pb-6">
                  <span className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Your Score</span>
                  <span
                    className="text-4xl font-extrabold"
                    style={{ color: getScoreColor(evaluation.score) }}
                  >
                    {evaluation.score}<span className="text-lg text-[var(--text-muted)] font-normal">/{evaluation.maxScore}</span>
                  </span>
                </div>

                {/* Feedback */}
                <div className="mb-6 bg-blue-500/5 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="text-sm font-bold uppercase tracking-wider text-blue-500 mb-1">AI Analysis</p>
                    <p className="text-sm text-[var(--text)] leading-relaxed">
                        {evaluation.feedback}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Strong points */}
                    <div className="bg-[var(--success)]/5 border border-[var(--success)]/20 p-4 rounded-xl">
                    <p className="text-xs font-bold text-[var(--success)] uppercase tracking-wide mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        Strong Points
                    </p>
                    <ul className="space-y-2">
                        {evaluation.strongPoints.map((point, i) => (
                        <li key={i} className="text-sm text-[var(--text)] flex items-start gap-2">
                            <span className="text-[var(--success)] mt-0.5">•</span>
                            <span className="leading-relaxed">{point}</span>
                        </li>
                        ))}
                    </ul>
                    </div>

                    {/* Improvements */}
                    <div className="bg-[var(--warning)]/5 border border-[var(--warning)]/20 p-4 rounded-xl">
                    <p className="text-xs font-bold text-[var(--warning)] uppercase tracking-wide mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>
                        Areas to Improve
                    </p>
                    <ul className="space-y-2">
                        {evaluation.improvements.map((item, i) => (
                        <li key={i} className="text-sm text-[var(--text)] flex items-start gap-2">
                            <span className="text-[var(--warning)] mt-0.5">•</span>
                            <span className="leading-relaxed">{item}</span>
                        </li>
                        ))}
                    </ul>
                    </div>
                </div>

                {/* Suggestion */}
                <div className="rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20 p-4 flex gap-3 items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[var(--accent)] shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.2m-1.5.2a6.01 6.01 0 01-1.5-.2m1.5.2V8.25m0 0c0-1.657 1.343-3 3-3h1.5M12 8.25c0-1.657-1.343-3-3-3H7.5m10.5 3a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <div>
                      <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-wide mb-1">
                        Key Takeaway
                      </p>
                      <p className="text-sm text-[var(--text-muted)] italic">{evaluation.suggestion}</p>
                  </div>
                </div>
              </div>

              {/* Next button */}
              <button
                onClick={handleNext}
                className="w-full rounded-xl bg-[var(--accent)] px-4 py-4 text-sm font-bold text-white hover:bg-[var(--accent-hover)] transition-all flex items-center justify-center gap-2 group hover:-translate-y-0.5 shadow-lg"
              >
                {currentRound === "dsa" ? "See Final Feedback" : "Next Question"}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Interview
