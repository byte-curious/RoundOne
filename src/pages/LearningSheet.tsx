import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { learningData } from "../data/learningSheet"; // Make sure path is correct!
import { getProgress, toggleProgress } from "@/services/api";
import useUserStore from "@/store/authStore";

function LearningSheet() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticate } = useUserStore();
  const data = categoryId ? learningData[categoryId] : null;

  // Track which sheet in the category is currently active
  const [activeSheetId, setActiveSheetId] = useState<string>("");
  const [sheetData, setSheetData] = useState<any>(null);

  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [loadingSheet, setLoadingSheet] = useState(true);

  const [expandedLectures, setExpandedLectures] = useState<
    Record<string, boolean>
  >({});

  // 1. Set the initial active sheet when the page loads
  useEffect(() => {
    if (!data) {
      navigate("/learning");
      return;
    }
    setActiveSheetId(data.sheets[0].id);
  }, [data, navigate]);

  // 2. Fetch the JSON file and the Database Progress whenever the active sheet changes
  useEffect(() => {
    if (!activeSheetId) return;

    const fetchSheetAndProgress = async () => {
      setLoadingSheet(true);
      setLoadingProgress(true);

      try {
        // Fetch the massive JSON file from our public folder!
        const sheetResponse = await fetch(`/data/sheets/${activeSheetId}.json`);
        if (sheetResponse.ok) {
          const json = await sheetResponse.json();
          setSheetData(json);
        } else {
          console.error("JSON file not found in public/data/sheets/");
          setSheetData(null);
        }
        if (isAuthenticate) {
          const progressResponse = await getProgress(activeSheetId);
          setCompletedTasks(progressResponse.data.completedTasks ?? []);
        } else {
          setCompletedTasks([]);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoadingSheet(false);
        setLoadingProgress(false);
      }
    };

    fetchSheetAndProgress();
  }, [activeSheetId, isAuthenticate]);

  const toggleLecture = (lectureId: string) => {
    setExpandedLectures((prev) => ({ ...prev, [lectureId]: !prev[lectureId] }));
  };

  const handleToggleTask = async (taskId: string) => {
    if (!isAuthenticate) {
      navigate("/login", {
        state: {
          message: "Please log in to track your learning sheet progress.",
        },
      });
      return;
    }
    const isCompleted = completedTasks.includes(taskId);
    setCompletedTasks((prev) =>
      isCompleted ? prev.filter((id) => id !== taskId) : [...prev, taskId],
    );

    try {
      await toggleProgress({ sheetId: activeSheetId, taskId });
    } catch (error) {
      console.error("Backend failed to save", error);
      setCompletedTasks((prev) =>
        isCompleted ? [...prev, taskId] : prev.filter((id) => id !== taskId),
      );
    }
  };

  if (!data) return null;

  const activeSheetMeta =
    data.sheets.find((s: any) => s.id === activeSheetId) || data.sheets[0];
  const safeCompletedTasks = completedTasks ?? [];

  // --- NEW: Calculate Total Sheet Progress ---
  let totalSheetProblems = 0;
  let totalSheetCompleted = 0;

  if (sheetData && sheetData.steps) {
    const allSheetTaskIds = sheetData.steps.flatMap((step: any) =>
      step.lectures.flatMap((lec: any) => lec.tasks.map((t: any) => t.id)),
    );
    totalSheetProblems = allSheetTaskIds.length;
    totalSheetCompleted = allSheetTaskIds.filter((id: string) =>
      safeCompletedTasks.includes(id),
    ).length;
  }
  // -----------------------------------------

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0d0d0d] px-4 py-10 font-sans text-gray-200">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <button
              onClick={() => navigate("/learning")}
              className="text-gray-500 hover:text-gray-300 text-sm font-medium mb-4 flex items-center gap-2 transition-colors group"
            >
              {/* Arrow Left SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
                />
              </svg>
              Back to Hub
            </button>
          </div>

          {/* TAB MENU: Switch between Striver, Blind 75, etc. */}
          {data.sheets.length > 1 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
              {data.sheets.map((sheet: any) => (
                <button
                  key={sheet.id}
                  onClick={() => setActiveSheetId(sheet.id)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors border ${
                    activeSheetId === sheet.id
                      ? "bg-[#ff4a1c]/10 text-[#ff4a1c] border-[#ff4a1c]/50 shadow-[0_0_15px_rgba(255,74,28,0.15)]"
                      : "bg-[#1a1a1a] text-gray-400 border-[#2a2a2a] hover:bg-[#252525]"
                  }`}
                >
                  {sheet.name}
                </button>
              ))}
            </div>
          )}

          {loadingSheet || loadingProgress ? (
            <div className="text-center py-20 text-gray-500 animate-pulse flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-[#ff4a1c]/30 border-t-[#ff4a1c] rounded-full animate-spin"></div>
              Loading sheet data...
            </div>
          ) : !sheetData ? (
            <div className="text-center py-20 text-red-500 bg-red-500/10 rounded-lg border border-red-500/20">
              Data file for this sheet is missing. Make sure{" "}
              <b>public/data/sheets/{activeSheetId}.json</b> exists!
            </div>
          ) : (
            <div className="space-y-6">
              {/*  CODOLIO STYLE HERO CARD */}
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex-1">
                  <h1 className="text-3xl font-extrabold text-white mb-3">
                    {activeSheetMeta.name}
                  </h1>
                  <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
                    {data.description} Follow this structured roadmap from top
                    to bottom. Click the checkboxes to track your progress,
                    which automatically syncs to your global Heatmap!
                  </p>
                </div>

                {/* The Giant Score Circle */}
                <div className="shrink-0 flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 border-[#2a2a2a] bg-[#0d0d0d] shadow-[0_0_20px_rgba(255,74,28,0.15)] relative">
                  {/* Subtle glowing ring based on progress */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                    <circle
                      cx="60"
                      cy="60"
                      r="58"
                      stroke="transparent"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="58"
                      stroke="#ff4a1c"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray="364"
                      strokeDashoffset={
                        364 -
                        364 *
                          (totalSheetProblems === 0
                            ? 0
                            : totalSheetCompleted / totalSheetProblems)
                      }
                      className="transition-all duration-1000 ease-out opacity-50"
                    />
                  </svg>
                  <span className="text-3xl font-extrabold text-white">
                    {totalSheetCompleted}
                  </span>
                  <div className="w-12 h-px bg-gray-700 my-1"></div>
                  <span className="text-sm font-bold text-gray-500">
                    {totalSheetProblems}
                  </span>
                </div>
              </div>

              {/* The Steps Accordion */}
              {sheetData.steps.map((step: any) => {
                const allTaskIds = step.lectures.flatMap((lecture: any) =>
                  lecture.tasks.map((task: any) => task.id),
                );
                const completedCount = allTaskIds.filter((id: string) =>
                  safeCompletedTasks.includes(id),
                ).length;
                const progress =
                  allTaskIds.length === 0
                    ? 0
                    : (completedCount / allTaskIds.length) * 100;

                return (
                  <div
                    key={step.id}
                    className="overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] shadow-lg"
                  >
                    <div className="flex items-center justify-between border-b border-[#2a2a2a] px-6 py-4">
                      <h2 className="text-lg font-bold text-white">
                        {step.title}
                      </h2>
                      <div className="flex items-center gap-4">
                        <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-gray-700 md:block">
                          <div
                            className="h-full bg-[#ff4a1c] transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400 font-mono">
                          {completedCount} / {allTaskIds.length}
                        </span>
                      </div>
                    </div>

                    {step.lectures.map((lecture: any) => {
                      const isExpanded = expandedLectures[lecture.id] ?? false;

                      return (
                        <div
                          key={lecture.id}
                          className="border-b border-[#2a2a2a] last:border-0"
                        >
                          <div
                            onClick={() => toggleLecture(lecture.id)}
                            className="flex cursor-pointer items-center justify-between px-6 py-4 transition-colors hover:bg-[#252525] group"
                          >
                            <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                              {lecture.title}
                            </span>
                            <span className="text-gray-500">
                              {/* Chevron SVG */}
                              {isExpanded ? (
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
                              ) : (
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
                                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                  />
                                </svg>
                              )}
                            </span>
                          </div>

                          {isExpanded && (
                            <div className="bg-[#141414]">
                              <div className="grid grid-cols-[40px_1fr_80px_100px_80px] gap-4 border-y border-[#2a2a2a] px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                                <div className="text-center">Status</div>
                                <div>Problem</div>
                                <div className="text-center">YouTube</div>
                                <div className="text-center">Practice</div>
                                <div className="text-center">Difficulty</div>
                              </div>

                              {lecture.tasks.map((task: any) => {
                                const isChecked = safeCompletedTasks.includes(
                                  task.id,
                                );
                                return (
                                  <div
                                    key={task.id}
                                    className="grid grid-cols-[40px_1fr_80px_100px_80px] items-center gap-4 px-6 py-3.5 transition-colors hover:bg-[#1a1a1a] border-b border-[#2a2a2a]/50 last:border-0 group/task"
                                  >
                                    <div className="flex justify-center">
                                      <button
                                        onClick={() =>
                                          handleToggleTask(task.id)
                                        }
                                        className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${isChecked ? "border-[#ff4a1c] bg-[#ff4a1c]" : "border-gray-600 hover:border-gray-400"}`}
                                      >
                                        {isChecked && (
                                          /* Checkmark SVG */
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={3}
                                            stroke="currentColor"
                                            className="w-3.5 h-3.5 text-white"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M4.5 12.75l6 6 9-13.5"
                                            />
                                          </svg>
                                        )}
                                      </button>
                                    </div>
                                    <div
                                      className={`text-sm font-medium transition-colors ${isChecked ? "text-gray-500 line-through" : "text-gray-200 group-hover/task:text-white"}`}
                                    >
                                      {task.title}
                                    </div>
                                    <div className="flex justify-center">
                                      {task.ytLink ? (
                                        <a
                                          href={task.ytLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-red-500 transition-colors hover:text-red-400"
                                          title="Watch Solution"
                                        >
                                          {/* YouTube Play Icon SVG */}
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="w-6 h-6"
                                          >
                                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                          </svg>
                                        </a>
                                      ) : (
                                        <span className="text-gray-600">-</span>
                                      )}
                                    </div>
                                    <div className="flex justify-center">
                                      <a
                                        href={task.practiceLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-semibold text-[#ff4a1c] transition-colors hover:text-orange-400 flex items-center gap-1.5 bg-[#ff4a1c]/10 px-3 py-1 rounded-md border border-[#ff4a1c]/20 hover:bg-[#ff4a1c]/20"
                                      >
                                        {/* Code SVG */}
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
                                            d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                                          />
                                        </svg>
                                        Solve
                                      </a>
                                    </div>
                                    <div className="flex justify-center">
                                      <span
                                        className={`rounded-md px-3 py-1 text-[10px] font-bold text-white tracking-wide ${task.difficulty === "Easy" || task.difficulty === "Basic" ? "bg-green-600" : task.difficulty === "Medium" ? "bg-yellow-500" : "bg-red-600"}`}
                                      >
                                        {task.difficulty}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default LearningSheet;
