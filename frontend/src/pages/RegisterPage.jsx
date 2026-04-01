import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [errorMessage, setErrorMessage] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password, role });
      navigate("/");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="page-card max-w-md">
      <h2>Register student or faculty</h2>
      <p className="muted">Create a new account and start using the portal.</p>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Full name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
