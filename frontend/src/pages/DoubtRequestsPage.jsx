import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { answerDoubt, getIncomingDoubts, getSentDoubts } from "../services/doubtService";
import { useAuth } from "../contexts/useAuth";
import { useState } from "react";

export default function DoubtRequestsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState({});
  
  const { data: incoming = [], isLoading: loadingIncoming } = useQuery({
    queryKey: ["doubts-incoming"],
    queryFn: getIncomingDoubts,
    enabled: !!user
  });
  
  const { data: sent = [], isLoading: loadingSent } = useQuery({
    queryKey: ["doubts-sent"],
    queryFn: getSentDoubts,
    enabled: !!user
  });

  const answerMutation = useMutation({
    mutationFn: ({ id, answer }) => answerDoubt(id, answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doubts-incoming"] });
      queryClient.invalidateQueries({ queryKey: ["doubts-sent"] });
    },
  });

  const handleAnswer = (id) => {
    const answer = answers[id]?.trim();
    if (!answer) return;
    answerMutation.mutate({ id, answer });
    setAnswers((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Doubt Center</p>
        <h2>Doubt Requests</h2>
        <p className="muted">Track collaborate requests and help your fellow students.</p>
      </header>

      <section className="page-card">
        <h3>Incoming Help Requests</h3>
        <p className="muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>These are students who reached out to you for help.</p>
        {loadingIncoming ? <p>Loading incoming requests...</p> : incoming.length ? (
          <div className="grid cards">
            {incoming.map((req) => (
              <div key={req._id} className="card-sm" style={{ borderLeft: '4px solid var(--primary)' }}>
                <p className="label">From: {req.fromName}</p>
                <p className="muted" style={{ fontSize: '0.85rem' }}>{req.fromEmail}</p>
                <div style={{ margin: '1rem 0' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Topic: {req.skill || "General"}</p>
                  <p className="muted" style={{ marginTop: '0.25rem' }}>{req.message}</p>
                </div>
                <div className="flex-between">
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--primary)', background: '#eef2ff', padding: '2px 8px', borderRadius: '4px' }}>
                    {req.status || 'Pending'}
                  </span>
                  <a href={`mailto:${req.fromEmail}`} className="btn btn-soft" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>Reply via Mail</a>
                </div>
                <div style={{ marginTop: "0.75rem" }}>
                  {req.response && (
                    <div className="note" style={{ marginBottom: "0.5rem" }}>
                      Answer: {req.response}
                    </div>
                  )}
                  <div className="response-row">
                    <input
                      placeholder="Write an answer"
                      value={answers[req._id] || ""}
                      onChange={(event) =>
                        setAnswers((prev) => ({ ...prev, [req._id]: event.target.value }))
                      }
                    />
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => handleAnswer(req._id)}
                      disabled={answerMutation.isPending}
                    >
                      {answerMutation.isPending ? "Sending..." : "Send Answer"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem 0', textAlign: 'center' }}>
            <p className="muted">No incoming requests yet. List your skills in "Peer Mentoring" so others can find you.</p>
          </div>
        )}
      </section>

      <section className="page-card">
        <h3>My Sent Queries</h3>
        <p className="muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>These are doubts you've asked other mentors.</p>
        {loadingSent ? <p>Loading your sent requests...</p> : sent.length ? (
          <div className="grid cards">
            {sent.map((req) => (
              <div key={req._id} className="card-sm" style={{ background: '#fafafa' }}>
                <p className="label">To: {req.toEmail}</p>
                <div style={{ margin: '1rem 0' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Topic: {req.skill || "General"}</p>
                  <p className="muted" style={{ marginTop: '0.25rem' }}>{req.message}</p>
                </div>
                <div className="flex-between">
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                    {req.status || 'Sent'}
                  </span>
                </div>
                {req.response && (
                  <div className="note" style={{ marginTop: "0.75rem" }}>
                    Mentor Answer: {req.response}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem 0', textAlign: 'center' }}>
            <p className="muted">You haven't sent any doubts yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}

