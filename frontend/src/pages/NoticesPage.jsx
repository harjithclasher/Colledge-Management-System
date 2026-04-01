import { useEffect, useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { createNotice, getNotices } from "../services/noticeService";

export default function NoticesPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "faculty";
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", body: "", tag: "General" });

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError("");
    getNotices()
      .then((data) => setNotices(data))
      .catch(() => setError("Failed to load notices."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    try {
      const created = await createNotice(form);
      setNotices((prev) => [created, ...prev]);
      setForm({ title: "", body: "", tag: "General" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish notice.");
    }
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Campus Notices</p>
        <h2>Notices</h2>
        <p className="muted">Share important announcements with everyone.</p>
      </header>

      {isStaff && (
        <section className="page-card">
          <h3>Post a Notice</h3>
          <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: "1.5rem" }}>
            <label>
              Title
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                required
              />
            </label>
            <label>
              Category
              <select
                value={form.tag}
                onChange={(event) => setForm({ ...form, tag: event.target.value })}
              >
                <option>General</option>
                <option>Exam</option>
                <option>Event</option>
                <option>Placement</option>
                <option>Holiday</option>
              </select>
            </label>
            <label>
              Notice Details
              <textarea
                rows={4}
                value={form.body}
                onChange={(event) => setForm({ ...form, body: event.target.value })}
                required
              />
            </label>
            <button className="btn btn-primary" type="submit">
              Publish Notice
            </button>
          </form>
        </section>
      )}

      <section className="page-card">
        <div className="flex-between">
          <h3>Latest Notices</h3>
          <span className="pill">{notices.length} updates</span>
        </div>
        <div className="stack" style={{ marginTop: "1.5rem" }}>
          {loading ? (
            <p className="muted" style={{ textAlign: "center", padding: "2rem 0" }}>
              Loading notices...
            </p>
          ) : notices.length === 0 ? (
            <p className="muted" style={{ textAlign: "center", padding: "2rem 0" }}>
              No notices yet.
            </p>
          ) : (
            notices.map((notice) => (
              <div key={notice._id} className="card-sm" style={{ padding: "1.25rem" }}>
                <div className="flex-between">
                  <p className="label">{notice.title}</p>
                  <span className="badge">{notice.tag}</span>
                </div>
                <p className="muted" style={{ marginTop: "0.5rem" }}>
                  {notice.body}
                </p>
                <div className="meta-row" style={{ marginTop: "0.75rem" }}>
                  <span>{formatDate(notice.createdAt) || "Today"}</span>
                </div>
              </div>
            ))
          )}
        </div>
        {error && (
          <p className="muted" style={{ color: "var(--danger)", marginTop: "1rem" }}>
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
