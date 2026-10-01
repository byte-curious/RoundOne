import { useState } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import ResumePDF from "@/components/resume-builder/ResumePDF";
import PersonalInfoForm from "@/components/resume-builder/PersonalInfoForm";
import ProjectsForm from "@/components/resume-builder/ProjectsForm";
import EducationForm from "@/components/resume-builder/EducationForm";
import SkillsForm from "@/components/resume-builder/SkillsForm";
import ExperienceForm from "@/components/resume-builder/ExperienceForm";
import AchievementsForm from "@/components/resume-builder/AchievementsForm";
import ReviewForm from "@/components/resume-builder/ReviewForm";
import useResumeBuilderStore from "@/store/resumeBuilderStore";
import { trackResumeDownload } from "@/services/api";
import useUserStore from "@/store/authStore";
import { useNavigate } from "react-router-dom";

type Tab =
  | "personal"
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "achievements"
  | "review";

function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [showMobilePreview, setShowMobilePreview] = useState(false); // Mobile toggle state
  const state = useResumeBuilderStore();

  // Premium SVGs for Tabs
  const tabs: { id: Tab; label: string; icon: any }[] = [
    {
      id: "personal",
      label: "Personal",
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
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      ),
    },
    {
      id: "education",
      label: "Education",
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
            d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
          />
        </svg>
      ),
    },
    {
      id: "skills",
      label: "Skills",
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
            d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
          />
        </svg>
      ),
    },
    {
      id: "experience",
      label: "Experience",
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
            d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
          />
        </svg>
      ),
    },
    {
      id: "projects",
      label: "Projects",
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
            d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.438 4.438 0 002.798 2.839m9.022-6.234a4.492 4.492 0 003.15 3.152 4.442 4.442 0 002.876-2.04"
          />
        </svg>
      ),
    },
    {
      id: "achievements",
      label: "Achievements",
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
            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
          />
        </svg>
      ),
    },
    {
      id: "review",
      label: "Review & Export",
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
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  let strengthScore = 0;
  if (state.personalInfo.fullName) strengthScore += 10;
  if (state.personalInfo.email && state.personalInfo.phone) strengthScore += 10;
  if (state.personalInfo.linkedin && state.personalInfo.github)
    strengthScore += 10;
  if (state.education.length > 0) strengthScore += 15;
  if (state.skills.some((s) => s.items.length > 0)) strengthScore += 15;
  if (state.projects.length > 0) strengthScore += 20;
  if (state.experience.length > 0 || state.achievements.length > 0)
    strengthScore += 20;

  const strengthColor =
    strengthScore >= 80
      ? "bg-[var(--success)]"
      : strengthScore >= 50
        ? "bg-[var(--warning)]"
        : "bg-[var(--danger)]";
  const { isAuthenticate } = useUserStore();
  const navigate = useNavigate();
  return (
    <div className="min-h-[100dvh] bg-[var(--bg)] font-sans flex flex-col">
      <Navbar />

      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden relative">
        {/* LEFT SIDE: The Editor */}
        <div
          className={`w-full lg:w-1/2 flex-col bg-[var(--bg)] border-r border-[var(--border)] h-[calc(100dvh-64px)] relative ${showMobilePreview ? "hidden" : "flex"}`}
        >
          <div className="px-4 sm:px-6 py-4 bg-[var(--surface)] border-b border-[var(--border)]">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Resume Strength
              </span>
              <span
                className={`text-sm font-bold flex items-center gap-1.5 ${strengthScore >= 80 ? "text-[var(--success)]" : strengthScore >= 50 ? "text-[var(--warning)]" : "text-[var(--danger)]"}`}
              >
                {strengthScore}%
                {strengthScore === 100 && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-orange-500 animate-pulse"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
                    />
                  </svg>
                )}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${strengthScore}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full ${strengthColor}`}
              />
            </div>
          </div>

          <div className="flex overflow-x-auto border-b border-[var(--border)] bg-[var(--surface)] p-2 gap-2 hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/50" : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-white border border-transparent"}`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-grow overflow-y-auto p-4 sm:p-6 md:p-10 relative">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "personal" && <PersonalInfoForm />}
              {activeTab === "education" && <EducationForm />}
              {activeTab === "skills" && <SkillsForm />}
              {activeTab === "experience" && <ExperienceForm />}
              {activeTab === "projects" && <ProjectsForm />}
              {activeTab === "achievements" && <AchievementsForm />}
              {activeTab === "review" && <ReviewForm />}
            </motion.div>
          </div>

          {/* MOBILE  :  Floating button to open Preview on small screens */}
          <button
            onClick={() => setShowMobilePreview(true)}
            className="lg:hidden absolute bottom-6 right-6 z-40 bg-[var(--accent)] text-white shadow-[0_0_20px_rgba(170,59,255,0.4)] px-5 py-3.5 rounded-full font-bold flex items-center gap-2 hover:bg-[var(--accent-hover)] transition-transform active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
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
            Preview PDF
          </button>
        </div>

        {/* RIGHT SIDE: Live PDF Preview */}
        <div
          className={`${showMobilePreview ? "flex fixed inset-0 z-50 bg-[var(--bg)]" : "hidden"} lg:static lg:flex w-full lg:w-1/2 bg-[#333] flex-col relative border-l border-[var(--border)] lg:h-[calc(100dvh-64px)]`}
        >
          <div className="h-[60px] lg:h-[70px] bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-4 sm:px-6 shrink-0">
            {/* Mobile Back Button */}
            <button
              onClick={() => setShowMobilePreview(false)}
              className="lg:hidden text-sm font-bold text-[var(--text)] flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[var(--border)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
                />
              </svg>
              Back to Edit
            </button>

            <button
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to clear all data and start a new resume?",
                  )
                )
                  state.resetBuilder();
              }}
              className="hidden lg:flex text-xs font-bold text-[var(--danger)] hover:text-red-400 transition-colors items-center gap-2 bg-[var(--danger)]/10 px-3 py-1.5 rounded-md border border-[var(--danger)]/20"
            >
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
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              Start Fresh
            </button>

            <PDFDownloadLink
              document={<ResumePDF />}
              fileName="RoundOne_Resume.pdf"
              onClick={(e) => {
                if (!isAuthenticate) {
                  e.preventDefault();
                  navigate("/login", {
                    state: {
                      message: "Please log in to download your resume PDF.",
                    },
                  });
                  return;
                }
                trackResumeDownload().catch(console.error);
              }}
              className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-bold rounded-lg hover:bg-[var(--accent-hover)] transition-all shadow-lg flex items-center gap-2 group"
            >
              {({ loading }) =>
                loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Preparing...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-4 h-4 group-hover:translate-y-0.5 transition-transform"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    Download PDF
                  </>
                )
              }
            </PDFDownloadLink>
          </div>

          {/* PDF Viewer */}
          <div className="flex-grow w-full overflow-hidden h-[calc(100dvh-60px)] lg:h-full">
            <PDFViewer
              key={state.sectionOrder.join("-")}
              width="100%"
              height="100%"
              className="border-none bg-[#333]"
            >
              <ResumePDF />
            </PDFViewer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;
