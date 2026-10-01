import { useState, useEffect } from "react";
import { uploadResume } from "../services/api.js";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar.js";
import { motion } from "framer-motion";
import useUserStore from "@/store/authStore";

function ResumeUpload() {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticate } = useUserStore();

  // Reset state when the user visits this page
  useEffect(() => {
    setUploadFile(null);
    setError("");
    setLoading(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB");
      return;
    }

    setUploadFile(file);
    setError("");
  };

  const handleUpload = async () => {
    setError("");
    if (!isAuthenticate) {
      navigate("/login", {
        state: { message: "Please log in to start a mock interview." },
      });
      return;
    }
    if (!uploadFile) {
      setError("Please select a PDF file.");
      return;
    }

    try {
      setLoading(true);
      const response = await uploadResume(uploadFile);

      if (response.status !== 200) {
        setError("Upload failed");
        return;
      }
      navigate("/onboarding");
    } catch (error: any) {
      setError(
        error?.response?.data?.error || "Something went wrong during upload",
      );
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-70px)] flex items-center justify-center bg-[var(--bg)] px-6 py-12 relative overflow-hidden font-sans selection:bg-purple-500/30">
        {/* Ambient Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center z-10">
          {/* LEFT SIDE: Animated Timeline to fill the vacant space */}
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
                Personalize your <br />{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[var(--accent)]">
                  interview journey.
                </span>
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-[var(--text-muted)] text-lg leading-relaxed max-w-md"
              >
                Our AI doesn't ask generic questions. We analyze your unique
                background to conduct a highly realistic, tailored mock
                interview.
              </motion.p>
            </div>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.1rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[var(--accent)] before:to-[var(--surface)] before:opacity-30">
              {/* Step 1 */}
              <motion.div
                variants={itemVariants}
                className="relative flex items-start gap-6"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(170,59,255,0.4)] z-10 shrink-0 border-4 border-[var(--bg)]">
                  1
                </div>
                <div className="pt-1">
                  <h3 className="text-white font-bold text-xl mb-1">
                    Upload Resume
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm">
                    We securely extract your skills, projects, and work
                    experience.
                  </p>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                variants={itemVariants}
                className="relative flex items-start gap-6 opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--surface)] border-2 border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] font-bold z-10 shrink-0">
                  2
                </div>
                <div className="pt-1">
                  <h3 className="text-white font-bold text-xl mb-1">
                    Configure Target
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm">
                    Select your dream company, role, and difficulty level.
                  </p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                variants={itemVariants}
                className="relative flex items-start gap-6 opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--surface)] border-2 border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] font-bold z-10 shrink-0">
                  3
                </div>
                <div className="pt-1">
                  <h3 className="text-white font-bold text-xl mb-1">
                    Face the AI
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm">
                    Speak your answers and write real code in our Docker
                    sandbox.
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
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/50 relative overflow-hidden group/card">
              {/* Card internal subtle glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--accent)]/10 rounded-full blur-[80px] group-hover/card:bg-[var(--accent)]/20 transition-colors duration-500"></div>

              <div className="mb-10 text-center relative z-10">
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-600 to-[var(--accent)] flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.4)] transform group-hover/card:scale-105 transition-transform duration-300">
                  {/* Document Search/Scan SVG */}
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Upload Resume
                </h1>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  PDF format only. Maximum 5MB.
                </p>
              </div>

              <div className="space-y-6 relative z-10">
                {/* Styled File Input / Dropzone Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 group/dropzone ${uploadFile ? "border-[var(--success)] bg-[var(--success)]/5" : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5"}`}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {!uploadFile ? (
                    <div className="flex flex-col items-center pointer-events-none">
                      {/* Cloud Upload SVG */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-10 h-10 mb-4 text-[var(--text-muted)] group-hover/dropzone:text-[var(--accent)] transition-colors opacity-80"
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
                      {/* Success Check SVG */}
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
                        Ready to upload
                      </p>
                      <p className="text-xs text-[var(--text-muted)] break-all px-4">
                        {uploadFile.name}
                      </p>
                      <p className="text-xs text-[var(--accent)] mt-5 underline decoration-dashed">
                        Choose a different file
                      </p>
                    </div>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-center flex items-center justify-center gap-2"
                  >
                    {/* Warning SVG */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 text-[var(--danger)] shrink-0"
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
                  onClick={handleUpload}
                  disabled={loading || !uploadFile}
                  className="w-full rounded-xl bg-[var(--accent)] py-4 text-sm font-bold text-white transition-all hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(170,59,255,0.2)] hover:shadow-[0_0_25px_rgba(170,59,255,0.4)] disabled:shadow-none flex justify-center items-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Parsing Resume...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Setup</span>
                      {/* Arrow Right SVG */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
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
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default ResumeUpload;
