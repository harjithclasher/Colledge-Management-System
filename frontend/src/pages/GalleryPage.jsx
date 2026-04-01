import { useEffect, useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { api } from "../lib/api-client";
import { createGalleryItem, deleteGalleryItem, getGalleryItems } from "../services/galleryService";

export default function GalleryPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "faculty";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [form, setForm] = useState({
    title: "",
    category: "Campus Life",
    color: "linear-gradient(135deg, #e0e7ff, #f5d0fe)",
    imageFile: null,
    imagePreview: "",
  });

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError("");
    getGalleryItems()
      .then((data) => setItems(data))
      .catch(() => setError("Failed to load gallery."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    try {
      setUploading(true);
      const created = await createGalleryItem({
        title: form.title,
        category: form.category,
        color: form.color,
        imageFile: form.imageFile,
      });
      setItems((prev) => [created, ...prev]);
      setForm({
        title: "",
        category: "Campus Life",
        color: "linear-gradient(135deg, #e0e7ff, #f5d0fe)",
        imageFile: null,
        imagePreview: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add gallery item.");
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setForm((prev) => ({ ...prev, imageFile: null, imagePreview: "" }));
      return;
    }
    const preview = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imageFile: file, imagePreview: preview }));
  };

  const resolveImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const base = api.defaults.baseURL?.replace(/\/api\/?$/, "") || "";
    return `${base}${path}`;
  };

  const handleDelete = async (id) => {
    try {
      await deleteGalleryItem(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete gallery item.");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Campus Gallery</p>
        <h2>Gallery</h2>
        <p className="muted">Explore campus life through photos and moments.</p>
      </header>

      {isStaff && (
        <section className="page-card">
          <h3>Add a Gallery Item</h3>
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
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              >
                <option>Campus Life</option>
                <option>Events</option>
                <option>Labs</option>
                <option>Sports</option>
              </select>
            </label>
            <label>
              Card Style
              <select
                value={form.color}
                onChange={(event) => setForm({ ...form, color: event.target.value })}
              >
                <option value="linear-gradient(135deg, #e0e7ff, #f5d0fe)">
                  Violet Blend
                </option>
                <option value="linear-gradient(135deg, #fee2e2, #fde68a)">
                  Sunset Glow
                </option>
                <option value="linear-gradient(135deg, #bbf7d0, #a5f3fc)">
                  Fresh Mint
                </option>
              </select>
            </label>
            <label>
              Upload Image
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>
            <button className="btn btn-primary" type="submit" disabled={uploading}>
              {uploading ? "Adding..." : "Add to Gallery"}
            </button>
          </form>
        </section>
      )}

      <section className="page-card">
        <div className="flex-between">
          <h3>Campus Moments</h3>
          <span className="pill">{items.length} photos</span>
        </div>
        <div className="grid cards">
          {loading ? (
            <p className="muted" style={{ padding: "1rem" }}>
              Loading gallery...
            </p>
          ) : (
            items.map((item) => (
              <div key={item._id} className="card-sm" style={{ padding: 0, overflow: "hidden" }}>
                {item.imageUrl ? (
                  <img
                    src={resolveImageUrl(item.imageUrl)}
                    alt={item.title}
                    style={{ width: "100%", height: "160px", objectFit: "cover" }}
                    onClick={() =>
                      setActiveImage({
                        src: resolveImageUrl(item.imageUrl),
                        title: item.title,
                      })
                    }
                  />
                ) : (
                  <div style={{ height: "160px", background: item.color }}></div>
                )}
                <div style={{ padding: "1rem" }}>
                  <div className="flex-between">
                    <span className="badge">{item.category}</span>
                    {isStaff && (
                      <button
                        className="btn btn-soft"
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        style={{ padding: "0.25rem 0.6rem" }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="label" style={{ marginTop: "0.5rem" }}>
                    {item.title}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        {error && (
          <p className="muted" style={{ color: "var(--danger)", marginTop: "1rem" }}>
            {error}
          </p>
        )}
      </section>
      {activeImage && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveImage(null)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setActiveImage(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "2rem",
          }}
        >
          <div style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
            <img
              src={activeImage.src}
              alt={activeImage.title}
              style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "16px" }}
            />
            <p style={{ color: "#e2e8f0", marginTop: "0.75rem", textAlign: "center" }}>
              {activeImage.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
