import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="page-card" style={{ overflow: 'hidden', position: 'relative' }}>
      <div className="hero">
        <div>
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 700 }}>Intelligent Learning Ecosystem</p>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Modern College <span style={{ color: 'var(--primary)' }}>Portal</span> with <br/> Peer Learning
          </h1>
          <p className="muted" style={{ fontSize: '1.25rem', marginTop: '1.5rem', maxWidth: '500px' }}>
            Elevate your academic journey. Manage courses, connect with expert student mentors, and resolve doubts in real-time.
          </p>
          <div className="hero-actions" style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
            <Link className="btn btn-primary" to="/dashboard" style={{ padding: '1rem 2rem' }}>
              Go to Dashboard
            </Link>
            <Link className="btn btn-soft" to="/peer-learning" style={{ padding: '1rem 2rem' }}>
              Explore Mentors
            </Link>
          </div>
        </div>
        
        <div className="hero-side" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', borderRadius: '24px', padding: '2rem' }}>
          <div className="space-y-6">
            <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
              <p className="eyebrow" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>Core Modules</p>
              <p style={{ fontWeight: 800, fontSize: '1.25rem' }}>3+ Integrated Systems</p>
              <p className="muted" style={{ fontSize: '0.85rem' }}>Courses, Peer Learning, Doubts</p>
            </div>
            <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
              <p className="eyebrow" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>Security</p>
              <p style={{ fontWeight: 800, fontSize: '1.25rem' }}>JWT Secured</p>
              <p className="muted" style={{ fontSize: '0.85rem' }}>Role-based access for all users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

