import { api } from "../lib/api-client";

export const createFeedback = (data) =>
  api.post("/feedback", data).then((res) => res.data);

export const getFeedback = () =>
  api.get("/feedback").then((res) => res.data);

export const respondToFeedback = (id, response) =>
  api.patch(`/feedback/${id}/respond`, { response }).then((res) => res.data);
