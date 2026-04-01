import { api } from "../lib/api-client";

export const loginUser = (data) => api.post("/auth/login", data).then((res) => res.data);
export const registerUser = (data) => api.post("/auth/register", data).then((res) => res.data);
export const fetchMe = () => api.get("/users/me").then((res) => res.data);
