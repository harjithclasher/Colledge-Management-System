import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { createArticle, listArticles } from "../services/articleService";

export default function ArticlesPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "faculty";
  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    tag: "Insights",
  });
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["articles"],
    queryFn: listArticles,
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      setForm({ title: "", summary: "", content: "", tag: "Insights" });
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.summary.trim()) return;
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Campus Articles</p>
        <h2>Articles</h2>
        <p className="muted">Faculty and staff share academic insights.</p>
      </header>

      {isStaff && (
        <section className="page-card">
          <h3>Write an Article</h3>
          <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: "1.5rem" }}>
            <label>
              Title
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                required
              />
            </label>
            <label>
              Category
              <select
                value={form.tag}
                onChange={(event) => setForm({ ...form, tag: event.target.value })}
              >
                <option>Insights</option>
                <option>Tutorial</option>
                <option>Research</option>
                <option>Campus</option>
              </select>
            </label>
            <label>
              Summary
              <textarea
                rows={4}
                value={form.summary}
                onChange={(event) => setForm({ ...form, summary: event.target.value })}
                required
              />
            </label>
            <label>
              Full Content
              <textarea
                rows={6}
                value={form.content}
                onChange={(event) => setForm({ ...form, content: event.target.value })}
                placeholder="Write the full article content here..."
              />
            </label>
            <button className="btn btn-primary" type="submit">
              Publish Article
            </button>
          </form>
        </section>
      )}

      <section className="page-card">
        <div className="flex-between">
          <h3>Latest Articles</h3>
          <span className="pill">{articles.length} posts</span>
        </div>
        <div className="grid cards">
          {isLoading ? (
            <p className="muted" style={{ padding: "1rem" }}>Loading articles...</p>
          ) : (
            articles.map((article) => (
              <Link
                key={article._id}
                to={`/articles/${article._id}`}
                className="card-sm card-link"
                style={{ minHeight: "220px", display: "flex", flexDirection: "column" }}
              >
                <span className="badge" style={{ alignSelf: "start" }}>{article.tag}</span>
                <h4 style={{ marginTop: "0.75rem", fontSize: "1.15rem" }}>{article.title}</h4>
                <p className="muted" style={{ fontSize: "0.9rem" }}>{article.summary}</p>
                <div className="meta-row" style={{ marginTop: "auto" }}>
                  <span>{article.author}</span>
                  <span>{article.createdAt ? new Date(article.createdAt).toLocaleDateString() : "Today"}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
