import { api } from "../lib/api-client";

export const listArticles = () =>
  api.get("/articles").then((res) => res.data);

export const getArticle = (id) =>
  api.get(`/articles/${id}`).then((res) => res.data);

export const createArticle = (payload) =>
  api.post("/articles", payload).then((res) => res.data);
