import { api } from "../lib/api-client";

export const listStudents = (skill) =>
  api
    .get("/students/search", { params: skill ? { skill } : {} })
    .then((res) => res.data);

export const updateSkills = (skills) =>
  api.put("/users/skills", { skills }).then((res) => res.data);

export const fetchStudents = () => api.get("/students").then((res) => res.data);
