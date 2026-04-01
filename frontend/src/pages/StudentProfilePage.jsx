import { useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { updateSkills } from "../services/studentService";

const defaultSkills = ["DSA", "Java", "React", "DBMS", "OS", "ML"];

export default function StudentProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [skills, setSkills] = useState(() => user?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [message, setMessage] = useState("");


  const addSkill = () => {
    const clean = newSkill.trim();
    if (!clean) return;
    if (!skills.includes(clean)) {
      setSkills((prev) => [...prev, clean]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSave = async () => {
    setMessage("");
    try {
      await updateSkills(skills);
      setMessage("Skills updated successfully.");
      await refreshProfile();
    } catch (err) {
      console.error(err);
      setMessage("Failed to save skills. Try again.");
    }
  };

  return (
    <div className="page-card">
      <div className="flex-between">
        <div>
          <h2>My Skill Profile</h2>
          <p className="muted">Add topics you're strong in and share your learning profile.</p>
        </div>
      </div>

      <div className="form-grid">
        <label>
          Name
          <input value={user?.name || ""} disabled />
        </label>
        <label>
          Email
          <input value={user?.email || ""} disabled />
        </label>
      </div>

      <div className="form-grid">
        <label>
          Add Skill
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. Data Structures"
            />
            <button type="button" className="btn btn-primary" onClick={addSkill}>
              Add
            </button>
          </div>
        </label>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {skills.map((skill) => (
            <span key={skill} className="skill-tag">
              {skill}
              <button
                type="button"
                className="skill-close"
                onClick={() => removeSkill(skill)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="label">Suggested skills</div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
        {defaultSkills.map((skill) => (
          <button
            key={skill}
            type="button"
            className="btn btn-soft"
            onClick={() => {
              if (!skills.includes(skill)) setSkills((prev) => [...prev, skill]);
            }}
          >
            {skill}
          </button>
        ))}
      </div>

      <button className="btn btn-primary" onClick={handleSave}>
        Save Skills
      </button>
      {message && <p className="muted" style={{ marginTop: "8px" }}>{message}</p>}
    </div>
  );
}
