import { api } from "../lib/api-client";

export const createDoubt = (data) =>
  api.post("/doubts", data).then((res) => res.data);

export const getIncomingDoubts = () =>
  api.get("/doubts/incoming").then((res) => res.data);

export const getSentDoubts = () =>
  api.get("/doubts/sent").then((res) => res.data);

export const answerDoubt = (id, answer) =>
  api.patch(`/doubts/${id}/answer`, { answer }).then((res) => res.data);

