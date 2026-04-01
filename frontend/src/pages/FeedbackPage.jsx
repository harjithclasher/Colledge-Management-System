import { useEffect, useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { createFeedback, getFeedback, respondToFeedback } from "../services/feedbackService";

export default function FeedbackPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "faculty";
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    category: "Academics",
    rating: 5,
    message: "",
  });
  const [responses, setResponses] = useState({});

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
    }));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError("");
    getFeedback()
      .then((data) => setEntries(data))
      .catch(() => setError("Failed to load feedback."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.message.trim()) return;
    try {
      const created = await createFeedback({
        category: form.category,
        rating: form.rating,
        message: form.message,
      });
      setEntries((prev) => [created, ...prev]);
      setForm((prev) => ({ ...prev, message: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback.");
    }
  };

  const sendResponse = async (id) => {
    const message = responses[id]?.trim();
    if (!message) return;
    try {
      const updated = await respondToFeedback(id, message);
      setEntries((prev) => prev.map((entry) => (entry._id === updated._id ? updated : entry)));
      setResponses((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send response.");
    }
  };

  const formatDate = (value) => {
    if (!value) return "Today";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Today";
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Feedback</p>
        <h2>Student Feedback</h2>
        <p className="muted">Students share insights and staff can respond in one place.</p>
      </header>

      {!isStaff && (
        <section className="page-card">
          <h3>Send Feedback</h3>
          <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: "1.5rem" }}>
            <label>
              Full Name
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
                readOnly
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
                readOnly
              />
            </label>
            <label>
              Category
              <select
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              >
                <option>Academics</option>
                <option>Facilities</option>
                <option>Placements</option>
                <option>Hostel</option>
                <option>Events</option>
              </select>
            </label>
            <label>
              Rating
              <select
                value={form.rating}
                onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              Message
              <textarea
                rows={4}
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                placeholder="Share your experience..."
                required
              />
            </label>
            <button className="btn btn-primary" type="submit">
              Submit Feedback
            </button>
          </form>
        </section>
      )}

      <section className="page-card">
        <div className="flex-between">
          <div>
            <h3>{isStaff ? "Feedback Inbox" : "My Feedback"}</h3>
            <p className="muted" style={{ fontSize: "0.9rem" }}>
              {isStaff
                ? "Review student feedback and respond quickly."
                : "Track the status of feedback you submitted."}
            </p>
          </div>
          <span className="pill">{entries.length} entries</span>
        </div>

        <div className="stack" style={{ marginTop: "1.5rem" }}>
          {loading ? (
            <p className="muted" style={{ textAlign: "center", padding: "2rem 0" }}>
              Loading feedback...
            </p>
          ) : entries.length === 0 ? (
            <p className="muted" style={{ textAlign: "center", padding: "2rem 0" }}>
              No feedback yet.
            </p>
          ) : (
            entries.map((entry) => (
              <div key={entry._id} className="card-sm" style={{ padding: "1.25rem" }}>
                <div className="flex-between">
                  <div>
                    <p className="label">{entry.name}</p>
                    <p className="muted" style={{ fontSize: "0.85rem" }}>
                      {entry.email} - {entry.category}
                    </p>
                  </div>
                  <span className="badge">
                    {entry.rating} / 5
                  </span>
                </div>
                <p style={{ marginTop: "0.75rem" }}>{entry.message}</p>
                <div className="meta-row" style={{ marginTop: "0.75rem" }}>
                  <span>Submitted: {formatDate(entry.createdAt)}</span>
                </div>
                {entry.response && (
                  <div className="note" style={{ marginTop: "0.75rem" }}>
                    Staff Response: {entry.response}
                  </div>
                )}
                {isStaff && (
                  <div className="response-row" style={{ marginTop: "0.75rem" }}>
                    <input
                      placeholder="Write a response"
                      value={responses[entry._id] || ""}
                      onChange={(event) =>
                        setResponses((prev) => ({
                          ...prev,
                          [entry._id]: event.target.value,
                        }))
                      }
                    />
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => sendResponse(entry._id)}
                    >
                      Send
                    </button>
                  </div>
                )}
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
