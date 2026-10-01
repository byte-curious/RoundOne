import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import VerifyOtp from "./pages/VerifyOtp";
import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import Onboarding from "./pages/Onboarding";
import Interview from "./pages/Interview";
import Feedback from "./pages/Feedback";
import AtsChecker from "./pages/AtsChecker";
import Review from "./pages/Review";
import PublicReport from "./pages/PublicReport";
import LearningHub from "./pages/LearningHub";
import LearningSheet from "./pages/LearningSheet";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import { getMe } from "./services/api";
import useUserStore from "./store/authStore";
import ProtectedRoute from "./components/ProtectedRoute";
import Privacy from "./pages/Privacy";
import VerifyResetOtp from "./pages/VerifyResetPassword";
import PracticeDashboard from "./pages/PractiseDashboard";
import PracticeArena from "./pages/PracticeArena";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import ResumeBuilder from "./pages/ResumeBuilder";
import MockSetup from "./pages/DsaMockSetup";
import DsaMockArena from "./pages/DsaMockArena";
import DsaMockReview from "./pages/DsaMockReview";

const rawUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const BACKEND_URL = rawUrl.replace(/\/$/, "");

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    let clientId = localStorage.getItem("visitor_client_id");
    if (!clientId) {
      clientId = uuidv4();
      localStorage.setItem("visitor_client_id", clientId);
    }

    const trackPage = async () => {
      try {
        await axios.post(`${BACKEND_URL}/analytics/track`, {
          page: window.location.origin + location.pathname + location.search,
          clientId: clientId,
        });
      } catch (error) {
        console.error("Tracking error:", error);
      }
    };

    trackPage();
  }, [location]);

  return null;
}

function App() {
  const { isAuthenticate, setUser, clearUser } = useUserStore();
  const [isAuthCheck, setIsAuthCheck] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await getMe();
        if (response.status === 200) {
          setUser(response.data.user);
        }
      } catch (error) {
        clearUser();
      } finally {
        setIsAuthCheck(false);
      }
    };
    checkAuthStatus();
  }, [setUser, clearUser]);

  const renderAuthRoute = (element: React.ReactNode) => {
    if (isAuthCheck) {
      return (
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    if (isAuthenticate) {
      return <Navigate to="/dashboard" replace />;
    }
    return element;
  };

  return (
    <BrowserRouter>
      <AnalyticsTracker />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />{" "}
        {/* <-- Now open to guests */}
        <Route path="/practice" element={<PracticeDashboard />} />
        <Route path="/practice/:slug" element={<PracticeArena />} />
        <Route path="/learning" element={<LearningHub />} />
        <Route path="/learning/:categoryId" element={<LearningSheet />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/ats-check" element={<AtsChecker />} />
        <Route path="/resume-upload" element={<ResumeUpload />} />
        <Route path="/dsa-mock/setup" element={<MockSetup />} />
        <Route path="/report/:id" element={<PublicReport />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        {/* Auth Routes */}
        <Route path="/register" element={renderAuthRoute(<Registration />)} />
        <Route path="/login" element={renderAuthRoute(<Login />)} />
        <Route path="/verify-otp" element={renderAuthRoute(<VerifyOtp />)} />
        <Route
          path="/forgot-password"
          element={renderAuthRoute(<ForgotPassword />)}
        />
        <Route
          path="/verify-reset-otp"
          element={renderAuthRoute(<VerifyResetOtp />)}
        />
        <Route
          path="/reset-password"
          element={renderAuthRoute(<ResetPassword />)}
        />
        {/* Protected Personal / Live Session Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthCheck={isAuthCheck}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute isAuthCheck={isAuthCheck}>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <ProtectedRoute isAuthCheck={isAuthCheck}>
              <Interview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute isAuthCheck={isAuthCheck}>
              <Feedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/arena/:sessionId"
          element={
            <ProtectedRoute isAuthCheck={isAuthCheck}>
              <DsaMockArena />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dsa-mock/review/:sessionId"
          element={
            <ProtectedRoute isAuthCheck={isAuthCheck}>
              <DsaMockReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review/:id"
          element={
            <ProtectedRoute isAuthCheck={isAuthCheck}>
              <Review />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
