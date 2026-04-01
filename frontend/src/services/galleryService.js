import { api } from "../lib/api-client";

export const getGalleryItems = () =>
  api.get("/gallery").then((res) => res.data);

export const createGalleryItem = (payload) => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("category", payload.category);
  formData.append("color", payload.color);
  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }
  return api
    .post("/gallery", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

export const deleteGalleryItem = (id) =>
  api.delete(`/gallery/${id}`).then((res) => res.data);
