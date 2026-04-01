import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listCourses, createCourse, deleteCourse, updateCourseSyllabus } from "../services/courseService";
import { useAuth } from "../contexts/useAuth";

export default function CoursesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", department: "Computer Science" });
  const [activeCourse, setActiveCourse] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [syllabusForm, setSyllabusForm] = useState({ text: "", url: "" });

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: listCourses,
  });

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setForm({ name: "", department: "Computer Science" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  const syllabusMutation = useMutation({
    mutationFn: ({ id, syllabusText, syllabusUrl }) =>
      updateCourseSyllabus(id, { syllabusText, syllabusUrl }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setActiveCourse(updated);
      setEditMode(false);
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    createMutation.mutate(form);
  };

  const isStaff = user?.role === 'admin' || user?.role === 'faculty';
  const openView = (course) => {
    setActiveCourse(course);
    setEditMode(false);
    setSyllabusForm({ text: course.syllabusText || "", url: course.syllabusUrl || "" });
  };

  const openEdit = (course) => {
    setActiveCourse(course);
    setEditMode(true);
    setSyllabusForm({ text: course.syllabusText || "", url: course.syllabusUrl || "" });
  };

  const saveSyllabus = () => {
    if (!activeCourse) return;
    syllabusMutation.mutate({
      id: activeCourse._id,
      syllabusText: syllabusForm.text,
      syllabusUrl: syllabusForm.url,
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Academic Catalog</p>
        <h2>Available Courses</h2>
        <p className="muted">Explore educational offerings across various departments.</p>
      </header>

      {isStaff && (
        <section className="page-card" style={{ borderBottom: '4px solid var(--primary)' }}>
          <h3>Admin: Add New Course</h3>
          <form onSubmit={onSubmit} className="form-grid" style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <label>
              Course Name
              <input
                placeholder="Introduction to..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Department
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                {[
                  "Computer Science",
                  "Electronics",
                  "Mechanical",
                  "Civil",
                  "Business",
                  "Mathematics",
                  "Physics",
                  "Chemistry",
                ].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>
            <button className="btn btn-primary" type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Course'}
            </button>
          </form>
        </section>
      )}

      <div style={{ marginTop: '2rem' }}>
        {isLoading ? (
          <p>Loading course catalog...</p>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="muted">No courses are currently available.</p>
          </div>
        ) : (
          <div className="grid cards">
            {courses.map((course) => (
              <div key={course._id} className="card-sm" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>{course.department}</span>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)' }}></div>
                  </div>
                  <p className="label" style={{ marginTop: '0.5rem', fontSize: '1.2rem', lineHeight: 1.2 }}>{course.name}</p>
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    className="btn btn-soft"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => openView(course)}
                  >
                    View Syllabus
                  </button>
                  {isStaff && (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <button
                        className="btn btn-link"
                        style={{ color: '#0f172a', fontSize: '0.8rem' }}
                        onClick={() => openEdit(course)}
                      >
                        Edit Syllabus
                      </button>
                      <button
                        className="btn btn-link"
                        style={{ color: '#ef4444', fontSize: '0.8rem' }}
                        onClick={() => deleteMutation.mutate(course._id)}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {activeCourse && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!editMode) setActiveCourse(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setActiveCourse(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "2rem",
          }}
        >
          <div
            role="presentation"
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "1.5rem",
              width: "min(720px, 95vw)",
              boxShadow: "0 16px 40px rgba(15, 23, 42, 0.2)",
            }}
          >
            <div className="flex-between">
              <div>
                <h3 style={{ marginBottom: "0.25rem" }}>{activeCourse.name}</h3>
                <p className="muted" style={{ fontSize: "0.85rem" }}>{activeCourse.department}</p>
              </div>
              <button className="btn btn-soft" type="button" onClick={() => setActiveCourse(null)}>
                Close
              </button>
            </div>

            {editMode ? (
              <div style={{ marginTop: "1rem" }}>
                <label>
                  Syllabus Text
                  <textarea
                    rows={6}
                    value={syllabusForm.text}
                    onChange={(e) => setSyllabusForm((prev) => ({ ...prev, text: e.target.value }))}
                    placeholder="Paste syllabus outline here..."
                  />
                </label>
                <label>
                  Syllabus Link (optional)
                  <input
                    value={syllabusForm.url}
                    onChange={(e) => setSyllabusForm((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                  />
                </label>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <button className="btn btn-primary" type="button" onClick={saveSyllabus} disabled={syllabusMutation.isPending}>
                    {syllabusMutation.isPending ? "Saving..." : "Save Syllabus"}
                  </button>
                  <button className="btn btn-soft" type="button" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: "1rem" }}>
                {activeCourse.syllabusText ? (
                  <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{activeCourse.syllabusText}</p>
                ) : (
                  <p className="muted">No syllabus available yet.</p>
                )}
                {activeCourse.syllabusUrl && (
                  <a
                    href={activeCourse.syllabusUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-soft"
                    style={{ marginTop: "0.75rem" }}
                  >
                    Open Syllabus Link
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


