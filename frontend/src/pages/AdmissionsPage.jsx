import { useEffect, useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { api } from "../lib/api-client";
import {
  createAdmission,
  getAdmissions,
  updateAdmission,
  uploadAdmissionDocument,
} from "../services/admissionsService";

export default function AdmissionsPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "faculty";
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    program: "B.Tech Computer Science",
    score: "",
  });
  const [responses, setResponses] = useState({});
  const [scheduleDates, setScheduleDates] = useState({});
  const [uploading, setUploading] = useState({});
  const [pendingFiles, setPendingFiles] = useState({});

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
    getAdmissions()
      .then((data) => setApplications(data))
      .catch(() => setError("Failed to load applications."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.program.trim() || !form.score.trim()) return;
    try {
      const created = await createAdmission({
        program: form.program,
        score: form.score,
      });
      setApplications((prev) => [created, ...prev]);
      setForm((prev) => ({ ...prev, score: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application.");
    }
  };

  const handleStatusUpdate = async (id, status) => {
    let message = responses[id]?.trim() || "";
    const scheduledVisitDate = scheduleDates[id] || "";
    if (status === "Approved" && !scheduledVisitDate) {
      setError("Please select a visit date before approving.");
      return;
    }
    if (status === "Approved" && !message) {
      message = `Approved. Please come to college on ${formatDate(scheduledVisitDate)}.`;
    }
    try {
      const updated = await updateAdmission(id, {
        status,
        message,
        scheduledVisitDate: scheduledVisitDate || undefined,
      });
      setApplications((prev) => prev.map((app) => (app._id === updated._id ? updated : app)));
      setResponses((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update application.");
    }
  };

  const handleUpload = async (id) => {
    const file = pendingFiles[id];
    if (!file) return;
    try {
      setUploading((prev) => ({ ...prev, [id]: true }));
      const updated = await uploadAdmissionDocument(id, file);
      setApplications((prev) => prev.map((app) => (app._id === updated._id ? updated : app)));
      setPendingFiles((prev) => ({ ...prev, [id]: null }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload document.");
    } finally {
      setUploading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString();
  };

  const resolveDocumentUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const base = api.defaults.baseURL?.replace(/\/api\/?$/, "") || "";
    return `${base}${path}`;
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Admissions</p>
        <h2>Admission Applications</h2>
        <p className="muted">Students can submit applications, and staff can review and respond.</p>
      </header>

      {!isStaff && (
        <section className="page-card">
          <h3>Apply for Admission</h3>
          <p className="muted" style={{ fontSize: "0.9rem" }}>
            Submit your details and track the review status below.
          </p>
          <form
            onSubmit={handleSubmit}
            className="form-grid"
            style={{
              marginTop: "1.5rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
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
              Program
              <select
                value={form.program}
                onChange={(event) => setForm({ ...form, program: event.target.value })}
              >
                <option>B.Tech Computer Science</option>
                <option>B.Tech Electronics</option>
                <option>BBA</option>
                <option>MBA</option>
                <option>M.Tech Data Science</option>
              </select>
            </label>
            <label>
              Last Exam Score
              <input
                placeholder="e.g. 91%"
                value={form.score}
                onChange={(event) => setForm({ ...form, score: event.target.value })}
                required
              />
            </label>
            <button className="btn btn-primary" type="submit">
              Submit Application
            </button>
          </form>
        </section>
      )}

      <section className="page-card">
        <div className="flex-between">
          <div>
            <h3>{isStaff ? "Review Applications" : "My Applications"}</h3>
            <p className="muted" style={{ fontSize: "0.9rem" }}>
              {isStaff
                ? "Approve, request documents, or respond to applicants."
                : "Track your submitted applications and staff responses."}
            </p>
          </div>
          <span className="pill">{applications.length} total</span>
        </div>

        <div className="stack" style={{ marginTop: "1.5rem" }}>
          {loading ? (
            <p className="muted" style={{ textAlign: "center", padding: "2rem 0" }}>
              Loading applications...
            </p>
          ) : applications.length === 0 ? (
            <p className="muted" style={{ textAlign: "center", padding: "2rem 0" }}>
              No applications yet.
            </p>
          ) : (
            applications.map((app) => (
              <div key={app._id} className="card-sm" style={{ padding: "1.25rem" }}>
                <div className="flex-between">
                  <div>
                    <p className="label">{app.name}</p>
                    <p className="muted" style={{ fontSize: "0.85rem" }}>
                      {app.email} - {app.program}
                    </p>
                  </div>
                  <span className="badge">{app.status}</span>
                </div>
                <div className="meta-row" style={{ marginTop: "0.75rem" }}>
                  <span>Score: {app.score}</span>
                  <span>Submitted: {formatDate(app.createdAt) || "Today"}</span>
                </div>
                {app.staffMessage && (
                  <div className="note" style={{ marginTop: "0.75rem" }}>
                    Staff Message: {app.staffMessage}
                  </div>
                )}
                {app.status === "Approved" && app.scheduledVisitDate && !isStaff && (
                  <div className="note" style={{ marginTop: "0.75rem" }}>
                    Approved. Please come to college on {formatDate(app.scheduledVisitDate)}.
                  </div>
                )}
                {app.documentUrl && (
                  <div className="note" style={{ marginTop: "0.75rem" }}>
                    Document: <a href={resolveDocumentUrl(app.documentUrl)} target="_blank" rel="noreferrer">{app.documentName || "View"}</a>
                  </div>
                )}

                {!isStaff && app.status === "Documents Requested" && (
                  <div style={{ marginTop: "1rem" }}>
                    <div className="response-row">
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(event) =>
                          setPendingFiles((prev) => ({
                            ...prev,
                            [app._id]: event.target.files?.[0] || null,
                          }))
                        }
                      />
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => handleUpload(app._id)}
                        disabled={uploading[app._id] || !pendingFiles[app._id]}
                      >
                        {uploading[app._id] ? "Uploading..." : "Upload 12th Marksheet"}
                      </button>
                    </div>
                  </div>
                )}

                {isStaff && (
                  <div style={{ marginTop: "1rem" }}>
                    <div className="button-row">
                      <button
                        className="btn btn-soft"
                        type="button"
                        onClick={() => handleStatusUpdate(app._id, "Approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-soft"
                        type="button"
                        onClick={() => handleStatusUpdate(app._id, "Documents Requested")}
                      >
                        Request Docs
                      </button>
                      <button
                        className="btn btn-soft"
                        type="button"
                        onClick={() => handleStatusUpdate(app._id, "Rejected")}
                        style={{ color: "#b91c1c" }}
                      >
                        Reject
                      </button>
                    </div>
                    <div className="response-row" style={{ marginTop: "0.5rem" }}>
                      <input
                        placeholder="Write a response to the applicant"
                        value={responses[app._id] || ""}
                        onChange={(event) =>
                          setResponses((prev) => ({
                            ...prev,
                            [app._id]: event.target.value,
                          }))
                        }
                      />
                      <input
                        type="date"
                        value={scheduleDates[app._id] || ""}
                        onChange={(event) =>
                          setScheduleDates((prev) => ({
                            ...prev,
                            [app._id]: event.target.value,
                          }))
                        }
                      />
                    </div>
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
