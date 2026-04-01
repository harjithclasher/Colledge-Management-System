import { api } from "../lib/api-client";

export const listCourses = () =>
  api.get("/courses").then((res) => res.data);

export const createCourse = (data) =>
  api.post("/courses", data).then((res) => res.data);

export const deleteCourse = (id) =>
  api.delete(`/courses/${id}`).then((res) => res.data);

export const updateCourseSyllabus = (id, payload) =>
  api.patch(`/courses/${id}/syllabus`, payload).then((res) => res.data);

