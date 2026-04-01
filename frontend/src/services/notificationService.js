import { api } from "../lib/api-client";

export const listNotifications = () =>
  api.get("/notifications").then((res) => res.data);

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`).then((res) => res.data);
