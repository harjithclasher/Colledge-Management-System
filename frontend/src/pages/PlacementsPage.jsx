import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/useAuth";
import {
  createPlacementOpportunity,
  createPlacementApplication,
  listAllPlacementApplications,
  listMyPlacementApplications,
  listPlacementOpportunities,
} from "../services/placementService";

export default function PlacementsPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "faculty";
  const queryClient = useQueryClient();
  const [activeJob, setActiveJob] = useState(null);
  const [form, setForm] = useState({
    company: "",
    role: "",
    package: "",
    location: "",
    deadline: "",
  });
  const [applyError, setApplyError] = useState("");
  const [applyForm, setApplyForm] = useState({
    name: user?.name || "",
    registerNumber: "",
    cgpa: "",
    skills: "",
    resumeImage: "",
  });
  const [filters, setFilters] = useState({
    company: "All",
    skill: "",
    cgpaMin: "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.company.trim() || !form.role.trim()) return;
    createOpportunityMutation.mutate(form);
  };

  const { data: applications = [] } = useQuery({
    queryKey: ["placement-applications", isStaff ? "all" : "me"],
    queryFn: isStaff ? listAllPlacementApplications : listMyPlacementApplications,
    enabled: !!user,
  });

  const applyMutation = useMutation({
    mutationFn: createPlacementApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placement-applications"] });
    },
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ["placement-opportunities"],
    queryFn: listPlacementOpportunities,
    enabled: !!user,
  });

  const createOpportunityMutation = useMutation({
    mutationFn: createPlacementOpportunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placement-opportunities"] });
      setForm({ company: "", role: "", package: "", location: "", deadline: "" });
    },
  });

  const handleApply = (job) => {
    setActiveJob(job);
  };

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setApplyForm((prev) => ({ ...prev, resumeImage: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const submitApplication = (event) => {
    event.preventDefault();
    if (!activeJob) return;
    if (!applyForm.name.trim() || !applyForm.registerNumber.trim() || !applyForm.cgpa.trim()) {
      return;
    }
    const newApplication = {
      jobId: activeJob._id,
      company: activeJob.company,
      role: activeJob.role,
      registerNumber: applyForm.registerNumber,
      cgpa: applyForm.cgpa,
      skills: applyForm.skills,
      resumeImage: applyForm.resumeImage,
    };
    setApplyError("");
    applyMutation.mutate(newApplication, {
      onSuccess: () => {
        setApplyForm((prev) => ({
          ...prev,
          registerNumber: "",
          cgpa: "",
          skills: "",
          resumeImage: "",
        }));
        setActiveJob(null);
      },
      onError: (err) => {
        const message =
          err?.response?.data?.message ||
          "Failed to submit application. Please try again.";
        setApplyError(message);
      },
    });
  };

  const companyOptions = Array.from(
    new Set(applications.map((app) => app.company).filter(Boolean))
  );

  const filteredApplications = applications.filter((app) => {
    if (filters.company !== "All" && app.company !== filters.company) return false;
    if (filters.skill.trim()) {
      const skillMatch = (app.skills || "").toLowerCase().includes(filters.skill.trim().toLowerCase());
      if (!skillMatch) return false;
    }
    if (filters.cgpaMin.trim()) {
      const appCgpa = Number(app.cgpa);
      const minCgpa = Number(filters.cgpaMin);
      if (!Number.isNaN(minCgpa) && !Number.isNaN(appCgpa) && appCgpa < minCgpa) {
        return false;
      }
    }
    return true;
  });

  const exportCsv = () => {
    const rows = [
      ["Student Name", "Email", "Register Number", "CGPA", "Skills", "Company", "Role", "Submitted"],
      ...filteredApplications.map((app) => [
        app.studentName || "",
        app.studentEmail || "",
        app.registerNumber || "",
        app.cgpa || "",
        app.skills || "",
        app.company || "",
        app.role || "",
        app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "",
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "placement-applications.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Placements</p>
        <h2>Placement Opportunities</h2>
        <p className="muted">Career opportunities curated for students.</p>
      </header>

      {isStaff && (
        <section className="page-card">
          <h3>Add Opportunity</h3>
          <form
            onSubmit={handleSubmit}
            className="form-grid"
            style={{
              marginTop: "1.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            <label>
              Company
              <input
                value={form.company}
                onChange={(event) => setForm({ ...form, company: event.target.value })}
                required
              />
            </label>
            <label>
              Role
              <input
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                required
              />
            </label>
            <label>
              Package
              <input
                value={form.package}
                onChange={(event) => setForm({ ...form, package: event.target.value })}
                placeholder="e.g. 24 LPA"
              />
            </label>
            <label>
              Location
              <input
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
              />
            </label>
            <label>
              Deadline
              <input
                value={form.deadline}
                onChange={(event) => setForm({ ...form, deadline: event.target.value })}
                placeholder="e.g. May 01, 2026"
              />
            </label>
            <button className="btn btn-primary" type="submit">
              Publish
            </button>
          </form>
        </section>
      )}

      <section className="page-card">
        <div className="flex-between">
          <h3>Latest Opportunities</h3>
          <span className="pill">{opportunities.length} roles</span>
        </div>
        <div className="grid cards">
          {opportunities.map((job) => (
            <div key={job._id} className="card-sm" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div className="flex-between">
                <p className="label">{job.company}</p>
                <span className="badge">{job.tag || "New"}</span>
              </div>
              <p style={{ fontWeight: 600 }}>{job.role}</p>
              <div className="meta-row">
                <span>{job.package || "Package TBD"}</span>
                <span>{job.location || "Location TBD"}</span>
              </div>
              <div className="meta-row">
                <span>Deadline: {job.deadline || "TBA"}</span>
              </div>
              <button className="btn btn-primary" type="button" onClick={() => handleApply(job)}>
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {!isStaff && activeJob && (
        <section className="page-card">
          <div className="flex-between">
            <div>
              <h3>Apply for {activeJob.company}</h3>
              <p className="muted" style={{ fontSize: "0.9rem" }}>
                Role: {activeJob.role}
              </p>
            </div>
            <button className="btn btn-soft" type="button" onClick={() => setActiveJob(null)}>
              Close
            </button>
          </div>
          <form onSubmit={submitApplication} className="form-grid" style={{ marginTop: "1.5rem" }}>
            <label>
              Student Name
              <input
                value={applyForm.name}
                onChange={(event) => setApplyForm({ ...applyForm, name: event.target.value })}
                required
              />
            </label>
            <label>
              Register Number
              <input
                value={applyForm.registerNumber}
                onChange={(event) =>
                  setApplyForm({ ...applyForm, registerNumber: event.target.value })
                }
                required
              />
            </label>
            <label>
              CGPA
              <input
                value={applyForm.cgpa}
                onChange={(event) => setApplyForm({ ...applyForm, cgpa: event.target.value })}
                placeholder="e.g. 8.2"
                required
              />
            </label>
            <label>
              Skills
              <input
                value={applyForm.skills}
                onChange={(event) => setApplyForm({ ...applyForm, skills: event.target.value })}
                placeholder="e.g. React, Node.js, Python"
              />
            </label>
            <label>
              Upload Resume (Image)
              <input type="file" accept="image/*" onChange={handleResumeChange} />
            </label>
            {applyForm.resumeImage && (
              <img
                src={applyForm.resumeImage}
                alt="Resume preview"
                style={{ width: "220px", borderRadius: "8px", border: "1px solid var(--border)" }}
              />
            )}
            {applyError && <p className="error">{applyError}</p>}
            <button className="btn btn-primary" type="submit">
              {applyMutation.isPending ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </section>
      )}

      <section className="page-card">
        <div className="flex-between">
          <div>
            <h3>{isStaff ? "Student Applications" : "My Applications"}</h3>
            {isStaff && (
              <p className="muted" style={{ fontSize: "0.9rem" }}>
                Filter by company, minimum CGPA, or skill keyword.
              </p>
            )}
          </div>
          <div className="flex-between">
            <span className="pill">{filteredApplications.length} submissions</span>
            {isStaff && (
              <button className="btn btn-soft" type="button" onClick={exportCsv}>
                Export CSV
              </button>
            )}
          </div>
        </div>
        {isStaff && (
          <div className="form-grid" style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            <label>
              Company
              <select
                value={filters.company}
                onChange={(event) => setFilters((prev) => ({ ...prev, company: event.target.value }))}
              >
                <option value="All">All</option>
                {companyOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
            <label>
              Minimum CGPA
              <input
                value={filters.cgpaMin}
                onChange={(event) => setFilters((prev) => ({ ...prev, cgpaMin: event.target.value }))}
                placeholder="e.g. 7.5"
              />
            </label>
            <label>
              Skill Contains
              <input
                value={filters.skill}
                onChange={(event) => setFilters((prev) => ({ ...prev, skill: event.target.value }))}
                placeholder="e.g. React"
              />
            </label>
          </div>
        )}
        <div className="stack" style={{ marginTop: "1.5rem" }}>
          {filteredApplications.length === 0 ? (
            <p className="muted" style={{ textAlign: "center", padding: "2rem 0" }}>
              No applications submitted yet.
            </p>
          ) : (
            filteredApplications.map((app) => (
              <div key={app._id} className="card-sm" style={{ padding: "1.25rem" }}>
                <div className="flex-between">
                  <div>
                    <p className="label">{app.studentName}</p>
                    <p className="muted" style={{ fontSize: "0.85rem" }}>
                      {app.studentEmail} · {app.registerNumber}
                    </p>
                  </div>
                  <span className="badge">{app.company}</span>
                </div>
                <div className="meta-row" style={{ marginTop: "0.75rem" }}>
                  <span>Role: {app.role}</span>
                  <span>CGPA: {app.cgpa}</span>
                  <span>Submitted: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Today"}</span>
                </div>
                {app.skills && (
                  <p className="muted" style={{ marginTop: "0.5rem" }}>
                    Skills: {app.skills}
                  </p>
                )}
                {app.resumeImage && (
                  <img
                    src={app.resumeImage}
                    alt={`${app.studentName} resume`}
                    style={{
                      marginTop: "0.75rem",
                      width: "220px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
