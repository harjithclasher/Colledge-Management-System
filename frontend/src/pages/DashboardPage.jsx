import { useAuth } from "../contexts/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getIncomingDoubts } from "../services/doubtService";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  
  const { data: incoming = [] } = useQuery({
    queryKey: ["doubts-incoming"],
    queryFn: getIncomingDoubts,
    enabled: !!user
  });

  return (
    <div className="space-y-6">
      <header className="page-card" style={{ padding: '2rem' }}>
        <p className="eyebrow">User Dashboard</p>
        <div className="flex-between">
          <div>
            <h1 style={{ marginBottom: '0.25rem', fontSize: '2.5rem' }}>Hi, {user?.name || "Student"}!</h1>
            <p className="muted">Role: <span style={{ textTransform: 'capitalize', color: 'var(--primary)', fontWeight: 600 }}>{user?.role || "student"}</span> • {user?.email}</p>
          </div>
          <button className="btn btn-soft" onClick={logout}>Sign out</button>
        </div>
      </header>

      <div className="grid cards">
        <Link to="/courses" className="card-sm" style={{ display: 'block', borderBottom: '4px solid var(--primary)' }}>
          <p className="label">My Courses</p>
          <p className="big" style={{ fontSize: '1.5rem' }}>View Materials</p>
          <p className="muted" style={{ fontSize: '0.85rem' }}>Access your enrolled study contents.</p>
        </Link>
        <Link to="/peer-learning" className="card-sm" style={{ display: 'block', borderBottom: '4px solid var(--secondary)' }}>
          <p className="label">Collaboration</p>
          <p className="big" style={{ fontSize: '1.5rem' }}>Peer Learning</p>
          <p className="muted" style={{ fontSize: '0.85rem' }}>Find mentors or list your skills.</p>
        </Link>
        <Link to="/doubt-requests" className="card-sm" style={{ display: 'block', borderBottom: '4px solid #f43f5e' }}>
          <p className="label">Pending Doubts</p>
          <p className="big" style={{ fontSize: '1.5rem' }}>{incoming.length} Incoming</p>
          <p className="muted" style={{ fontSize: '0.85rem' }}>People are asking for your help!</p>
        </Link>
      </div>

      <section className="page-card">
        <h3>Recent Activity</h3>
        {incoming.length > 0 ? (
          <div style={{ marginTop: '1.5rem' }}>
            <p className="muted" style={{ marginBottom: '1rem' }}>Latest incoming doubt requests:</p>
            {incoming.slice(0, 3).map(d => (
              <div key={d._id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600 }}>{d.subject}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>From: {d.fromName} ({d.fromEmail})</p>
                </div>
                <Link to="/doubt-requests" className="btn btn-soft" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>View Detail</Link>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem 0', textAlign: 'center' }}>
            <p className="muted">No new activity. Start browsing courses or help peers!</p>
          </div>
        )}
      </section>
    </div>
  );
}

