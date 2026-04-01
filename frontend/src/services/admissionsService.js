import { api } from "../lib/api-client";

export const createAdmission = (data) =>
  api.post("/admissions", data).then((res) => res.data);

export const getAdmissions = () =>
  api.get("/admissions").then((res) => res.data);

export const updateAdmission = (id, payload) =>
  api.patch(`/admissions/${id}`, payload).then((res) => res.data);

export const uploadAdmissionDocument = (id, file) => {
  const formData = new FormData();
  formData.append("document", file);
  return api
    .post(`/admissions/${id}/document`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};
