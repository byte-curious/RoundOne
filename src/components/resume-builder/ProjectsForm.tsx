import useResumeBuilderStore from "@/store/resumeBuilderStore";
import { useState } from "react";
import { enhanceBullets } from "@/services/api";
import useUserStore from "@/store/authStore";
import { useNavigate } from "react-router-dom";

export default function ProjectsForm() {
  const {
    projects,
    addProject,
    updateProject,
    updateProjectBulk,
    removeProject,
  } = useResumeBuilderStore();

  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const { isAuthenticate } = useUserStore();
  const navigate = useNavigate();

  const handleGenerateBullets = async (
    projectId: string,
    techStack: string,
    brainDump: string,
    userFeedback?: string,
  ) => {
    if (!isAuthenticate) {
      navigate("/login", {
        state: { message: "Please log in to use the AI bullet writer." },
      });
      return;
    }
    setError("");
    if (!techStack || !brainDump) {
      setError(
        "Please provide both Tech Stack and a Project Description first.",
      );
      return;
    }

    try {
      setLoadingProjectId(projectId);

      const response = await enhanceBullets({
        techStack,
        brainDump,
        userFeedback,
      });
      const { status, followUpQuestion, bullets } = response.data;

      if (status === "needs_info") {
        updateProject(projectId, "followUpQuestion", followUpQuestion);
        updateProject(projectId, "bullets", []);
      } else if (status === "success") {
        updateProjectBulk(projectId, {
          bullets: bullets,
          followUpQuestion: "",
          userFeedback: "",
        });
      } else {
        setError("Failed to generate bullets.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || "AI Service Unavailable.");
    } finally {
      setLoadingProjectId(null);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-lg text-[var(--accent)]">
            {/* Code Brackets SVG */}
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
                d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
        </div>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          Showcase your best work. Use our AI to turn a rough brain-dump into
          FAANG-level bullets.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-center flex items-center justify-center gap-2">
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
          <p className="text-sm font-medium text-[var(--danger)]">{error}</p>
        </div>
      )}

      {projects.map((project, index) => (
        <div
          key={project.id}
          className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl relative group transition-all hover:border-[var(--accent)]/50 shadow-lg"
        >
          <button
            onClick={() => removeProject(project.id)}
            className="absolute top-4 right-4 text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--danger)]/10 p-2 rounded-md"
            title="Remove Project"
          >
            {/* Clean Trash SVG */}
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
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>

          <h3 className="text-lg font-bold text-white mb-5 border-b border-[var(--border)] pb-3">
            Project {index + 1}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Project Title
              </label>
              <input
                value={project.title}
                onChange={(e) =>
                  updateProject(project.id, "title", e.target.value)
                }
                placeholder="e.g. Full-Stack E-Commerce"
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Tech Stack
              </label>
              <input
                value={project.techStack}
                onChange={(e) =>
                  updateProject(project.id, "techStack", e.target.value)
                }
                placeholder="e.g. React, Node.js, PostgreSQL"
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Start Date
              </label>
              <input
                value={project.startDate}
                onChange={(e) =>
                  updateProject(project.id, "startDate", e.target.value)
                }
                placeholder="e.g. Jan 2023"
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                End Date
              </label>
              <input
                value={project.endDate}
                onChange={(e) =>
                  updateProject(project.id, "endDate", e.target.value)
                }
                placeholder="e.g. Present"
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                GitHub URL
              </label>
              <input
                value={project.githubUrl}
                onChange={(e) =>
                  updateProject(project.id, "githubUrl", e.target.value)
                }
                placeholder="github.com/..."
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Live URL (Optional)
              </label>
              <input
                value={project.liveUrl}
                onChange={(e) =>
                  updateProject(project.id, "liveUrl", e.target.value)
                }
                placeholder="yourproject.com"
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {/* The Brain Dump Section */}
          <div className="flex flex-col gap-2 mt-6 border-t border-[var(--border)] pt-5">
            <label className="text-sm font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-2">
              {/* Lightbulb Idea SVG */}
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
                  d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.2m-1.5.2a6.01 6.01 0 01-1.5-.2m1.5.2V8.25m0 0c0-1.657 1.343-3 3-3h1.5M12 8.25c0-1.657-1.343-3-3-3H7.5m10.5 3a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              The Brain Dump
            </label>
            <p className="text-xs text-[var(--text-muted)] mb-2">
              Explain what you built, any challenges you faced, and the business
              impact. Don't worry about formatting.
            </p>
            <textarea
              value={project.brainDump}
              onChange={(e) =>
                updateProject(project.id, "brainDump", e.target.value)
              }
              rows={3}
              placeholder="I built a blog app where users can login. It was hard to figure out JWTs but I got it working. It loads pretty fast."
              className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] resize-none"
            />

            {!project.followUpQuestion && (
              <button
                onClick={() =>
                  handleGenerateBullets(
                    project.id,
                    project.techStack,
                    project.brainDump,
                  )
                }
                disabled={loadingProjectId === project.id}
                className="mt-3 w-full py-3 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] font-bold border border-[var(--accent)]/30 hover:bg-[var(--accent)] hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingProjectId === project.id ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Analyzing Project...
                  </>
                ) : (
                  <>
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
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                      />
                    </svg>
                    Generate Professional Bullets
                  </>
                )}
              </button>
            )}
          </div>

          {/* THE AI INTERROGATION UI */}
          {project.followUpQuestion && (
            <div className="mt-5 p-5 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  {/* AI / CPU Microchip SVG */}
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
                      d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                    AI Architect needs more info
                  </p>
                  <p className="text-sm text-blue-100 leading-relaxed">
                    {project.followUpQuestion}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-2 pl-0 sm:pl-12">
                <input
                  value={project.userFeedback || ""}
                  onChange={(e) =>
                    updateProject(project.id, "userFeedback", e.target.value)
                  }
                  placeholder="Type your reply here..."
                  className="flex-grow rounded-xl border border-blue-500/30 bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-blue-500 shadow-inner"
                />
                <button
                  onClick={() =>
                    handleGenerateBullets(
                      project.id,
                      project.techStack,
                      project.brainDump,
                      project.userFeedback,
                    )
                  }
                  disabled={
                    loadingProjectId === project.id || !project.userFeedback
                  }
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap flex items-center justify-center gap-2"
                >
                  {loadingProjectId === project.id ? (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Reply & Generate"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* The Editable AI Result Section */}
          {project.bullets && project.bullets.length > 0 && (
            <div className="mt-6 p-5 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold uppercase tracking-wider text-[var(--success)] flex items-center gap-2">
                  {/* Check Circle SVG */}
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
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Final Resume Bullets
                </label>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Review and edit your bullets below.{" "}
                <b className="text-[var(--warning)]">
                  Replace any [Bracketed Placeholders] with real numbers
                </b>{" "}
                before downloading!
              </p>

              <textarea
                value={project.bullets.join("\n")}
                onChange={(e) =>
                  updateProject(
                    project.id,
                    "bullets",
                    e.target.value.split("\n"),
                  )
                }
                rows={5}
                className="w-full rounded-xl border border-[var(--success)]/50 bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--success)] resize-y font-mono leading-relaxed"
              />
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addProject}
        className="w-full py-4 border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--text-muted)] font-bold hover:text-white hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all duration-200 flex items-center justify-center gap-2 group"
      >
        {/* Bold Plus SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-5 h-5 group-hover:scale-110 transition-transform"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        Add Another Project
      </button>
    </div>
  );
}
