import { api } from "../lib/api-client";

export const getNotices = () =>
  api.get("/notices").then((res) => res.data);

export const createNotice = (payload) =>
  api.post("/notices", payload).then((res) => res.data);
