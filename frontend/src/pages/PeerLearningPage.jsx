import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/useAuth";
import { listPeers, createPeerProfile } from "../services/peerService";
import { createDoubt } from "../services/doubtService";

export default function PeerLearningPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState({
    skills: "",
    bio: "",
  });
  const [doubt, setDoubt] = useState({
    subject: "",
    message: "",
    skill: "",
    toEmail: "",
  });

  const queryClient = useQueryClient();

  const studentName = user?.name || "";
  const studentEmail = user?.email || "";

  const { data: peers = [], isLoading } = useQuery({
    queryKey: ["peers", search],
    queryFn: () => listPeers(search || undefined),
  });

  const saveProfileMutation = useMutation({
    mutationFn: createPeerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peers"] });
      alert("Peer profile updated successfully!");
    },
  });

  const sendDoubtMutation = useMutation({
    mutationFn: createDoubt,
    onSuccess: () => {
      alert("Doubt request sent! The helper will see it on their dashboard.");
      setDoubt({ subject: "", message: "", skill: "", toEmail: "" });
    },
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    saveProfileMutation.mutate({
      ...profile,
      studentName,
      studentEmail,
    });
  };

  const handleDoubtSubmit = (e) => {
    e.preventDefault();
    sendDoubtMutation.mutate(doubt);
  };

  const askPeer = (peer) => {
    setDoubt((d) => ({
      ...d,
      toEmail: peer.studentEmail,
      skill: search || (peer.skills?.[0] || ""),
      subject: `Help with ${search || "Doubt"}`,
    }));
    // Scroll to doubt form
    const form = document.getElementById("doubt-form");
    if (form) form.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <header style={{ marginBottom: '2rem' }}>
        <p className="eyebrow">Collaboration Space</p>
        <h2>Peer Learning</h2>
        <p className="muted">Search student mentors by skills and collaborate on doubts.</p>
      </header>

      <div className="grid" style={{ gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        <div className="space-y-6">
          <section className="page-card">
            <div className="flex-between">
              <div>
                <h3>Find mentors by skill</h3>
                <p className="muted">Filter students who can help you.</p>
              </div>
              <input
                style={{ maxWidth: '300px' }}
                placeholder="e.g. React, Python, DSA..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            {isLoading ? (
              <p style={{ marginTop: '1rem' }}>Loading peers...</p>
            ) : peers.length ? (
              <div className="grid cards" style={{ marginTop: '1.5rem' }}>
                {peers.map((peer) => (
                  <div key={peer._id} className="card-sm">
                    <p className="label">{peer.studentName}</p>
                    <p className="muted" style={{ fontSize: '0.85rem' }}>{peer.studentEmail}</p>
                    <div style={{ margin: '0.75rem 0', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {peer.skills?.map(s => (
                        <span key={s} style={{ background: '#eef2ff', color: '#6366f1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {s}
                        </span>
                      ))}
                    </div>
                    <div style={{ marginTop: "1rem", display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => askPeer(peer)}>
                        Ask Doubt
                      </button>
                      <a
                        className="btn btn-soft"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        href={`mailto:${peer.studentEmail}?subject=${encodeURIComponent("Collaboration Request")}`}
                      >
                        Mail
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <p className="muted">No mentors found for this skill yet.</p>
              </div>
            )}
          </section>

          <section className="page-card" id="doubt-form">
            <h3>Send a doubt request</h3>
            <p className="muted" style={{ marginBottom: '1.5rem' }}>The mentor will see this in their "Incoming Doubts" dashboard.</p>
            <form onSubmit={handleDoubtSubmit} className="form-grid">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label>
                  Helper Email
                  <input
                    required
                    placeholder="mentor@college.edu"
                    value={doubt.toEmail}
                    onChange={(e) => setDoubt({ ...doubt, toEmail: e.target.value })}
                  />
                </label>
                <label>
                  Topic / Skill
                  <input
                    placeholder="e.g. React Hook errors"
                    value={doubt.skill}
                    onChange={(e) => setDoubt({ ...doubt, skill: e.target.value })}
                  />
                </label>
              </div>
              <label>
                Subject
                <input
                  required
                  placeholder="What do you need help with?"
                  value={doubt.subject}
                  onChange={(e) => setDoubt({ ...doubt, subject: e.target.value })}
                />
              </label>
              <label>
                Message
                <textarea
                  required
                  placeholder="Describe your issue in detail..."
                  value={doubt.message}
                  onChange={(e) => setDoubt({ ...doubt, message: e.target.value })}
                />
              </label>
              <button 
                className="btn btn-primary" 
                type="submit" 
                disabled={sendDoubtMutation.isPending}
              >
                {sendDoubtMutation.isPending ? 'Sending...' : 'Send Request'}
              </button>
            </form>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="page-card">
            <h3>Become a Mentor</h3>
            <p className="muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              List your skills so others can find you and ask for help.
            </p>
            <form onSubmit={handleProfileSubmit} className="form-grid">
              <label>
                Full Name
                <input
                  disabled
                  value={studentName}
                />
              </label>
              <label>
                College Email
                <input
                  disabled
                  value={studentEmail}
                />
              </label>
              <label>
                Skills (comma-separated)
                <input
                  placeholder="React, AWS, Figma..."
                  value={profile.skills}
                  onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                />
              </label>
              <label>
                Short Bio
                <textarea
                  style={{ minHeight: '80px' }}
                  placeholder="Tell students about your expertise..."
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
              </label>
              <button 
                className="btn btn-primary" 
                type="submit"
                disabled={saveProfileMutation.isPending}
              >
                {saveProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}


