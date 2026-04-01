import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getArticle } from "../services/articleService";

export default function ArticleDetailPage() {
  const { articleId } = useParams();

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", articleId],
    queryFn: () => getArticle(articleId),
    enabled: !!articleId,
  });

  if (!article && !isLoading) {
    return (
      <div className="page-card">
        <h2>Article not found</h2>
        <p className="muted">The article you are looking for does not exist.</p>
        <Link to="/articles" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          Back to Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">{article?.tag}</p>
        <h2>{article?.title}</h2>
        <p className="muted">
          {article?.author} - {article?.createdAt ? new Date(article.createdAt).toLocaleDateString() : "Today"}
        </p>
      </header>

      <section className="page-card">
        <p style={{ fontSize: "1.05rem", lineHeight: 1.8 }}>
          {isLoading ? "Loading..." : (article?.content || article?.summary)}
        </p>
        <Link to="/articles" className="btn btn-soft" style={{ marginTop: "1.5rem" }}>
          Back to Articles
        </Link>
      </section>
    </div>
  );
}
