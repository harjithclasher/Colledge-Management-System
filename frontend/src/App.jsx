import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, NavLink, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/useAuth";
import { listNotifications, markNotificationRead } from "./services/notificationService";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import PeerLearningPage from "./pages/PeerLearningPage";
import DoubtRequestsPage from "./pages/DoubtRequestsPage";
import AdmissionsPage from "./pages/AdmissionsPage";
import FeedbackPage from "./pages/FeedbackPage";
import PlacementsPage from "./pages/PlacementsPage";
import GalleryPage from "./pages/GalleryPage";
import ArticlesPage from "./pages/ArticlesPage";

import NoticesPage from "./pages/NoticesPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingNotifications(true);
    listNotifications()
      .then((data) => setNotifications(data))
      .finally(() => setLoadingNotifications(false));
  }, [user]);

  const unreadCount = user
    ? notifications.filter((n) => !n.readBy?.includes(user._id)).length
    : 0;

  const handleOpenNotification = async (notification) => {
    try {
      await markNotificationRead(notification._id);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id
            ? { ...n, readBy: [...(n.readBy || []), user._id] }
            : n
        )
      );
    } catch (err) {
      // ignore
    }
    if (notification.link) {
      navigate(notification.link);
    }
    setShowNotifications(false);
  };
  
  return (
    <header className="topnav">
      <div className="site-name">
        <Link to="/">College Portal</Link>
      </div>
      <nav className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
        {user && <NavLink to="/dashboard">Dashboard</NavLink>}
        {user && <NavLink to="/courses">Courses</NavLink>}
        {user && <NavLink to="/peer-learning">Peer Mentoring</NavLink>}
        {user && <NavLink to="/doubt-requests">Doubt Requests</NavLink>}
        {user && <NavLink to="/placements">Placements</NavLink>}
        {user && <NavLink to="/notices">Notices</NavLink>}
        {user && <NavLink to="/articles">Articles</NavLink>}
        {user && <NavLink to="/gallery">Gallery</NavLink>}
        {user && <NavLink to="/admissions">Admissions</NavLink>}
        {user && <NavLink to="/feedback">Feedback</NavLink>}
        {user && (
          <div style={{ position: "relative" }}>
            <button
              className="btn btn-soft"
              type="button"
              onClick={() => setShowNotifications((prev) => !prev)}
              style={{ marginLeft: "0.5rem", position: "relative" }}
            >
              Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: "999px",
                    padding: "2px 6px",
                    fontSize: "0.7rem",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "48px",
                  width: "320px",
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.12)",
                  zIndex: 40,
                  padding: "0.5rem",
                }}
              >
                <div className="flex-between" style={{ padding: "0.5rem 0.5rem 0.25rem" }}>
                  <strong>Notifications</strong>
                  <button
                    className="btn btn-soft"
                    type="button"
                    style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                    onClick={() => setShowNotifications(false)}
                  >
                    Close
                  </button>
                </div>
                {loadingNotifications ? (
                  <p className="muted" style={{ padding: "0.75rem" }}>Loading...</p>
                ) : notifications.length === 0 ? (
                  <p className="muted" style={{ padding: "0.75rem" }}>No notifications.</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n._id}
                      type="button"
                      onClick={() => handleOpenNotification(n)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        border: "none",
                        background: "transparent",
                        padding: "0.5rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{n.title}</div>
                      {n.message && (
                        <div className="muted" style={{ fontSize: "0.8rem", marginTop: "0.15rem" }}>
                          {n.message}
                        </div>
                      )}
                      <div className="muted" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        {!user && <NavLink to="/login" className="btn btn-soft" style={{ marginLeft: '1rem', color: '#1e293b' }}>Login</NavLink>}
        {!user && <NavLink to="/register" className="btn btn-primary" style={{ marginLeft: '0.5rem' }}>Join Now</NavLink>}
        {user && (
          <button 
            className="btn btn-soft" 
            style={{ marginLeft: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} 
            onClick={logout}
          >
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="app-shell">
            <TopNav />
            <main className="page-wrap bounce-in">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/dashboard"
                  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
                />
                <Route
                  path="/courses"
                  element={<ProtectedRoute><CoursesPage /></ProtectedRoute>}
                />
                <Route
                  path="/peer-learning"
                  element={<ProtectedRoute><PeerLearningPage /></ProtectedRoute>}
                />
                <Route
                  path="/doubt-requests"
                  element={<ProtectedRoute><DoubtRequestsPage /></ProtectedRoute>}
                />
                <Route
                  path="/placements"
                  element={<ProtectedRoute><PlacementsPage /></ProtectedRoute>}
                />
                <Route
                  path="/notices"
                  element={<ProtectedRoute><NoticesPage /></ProtectedRoute>}
                />
                <Route
                  path="/articles"
                  element={<ProtectedRoute><ArticlesPage /></ProtectedRoute>}
                />
                <Route
                  path="/articles/:articleId"
                  element={<ProtectedRoute><ArticleDetailPage /></ProtectedRoute>}
                />
                <Route
                  path="/gallery"
                  element={<ProtectedRoute><GalleryPage /></ProtectedRoute>}
                />
                <Route
                  path="/admissions"
                  element={<ProtectedRoute><AdmissionsPage /></ProtectedRoute>}
                />
                <Route
                  path="/feedback"
                  element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
