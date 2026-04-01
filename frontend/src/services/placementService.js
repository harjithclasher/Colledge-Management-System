import { api } from "../lib/api-client";

export const listAllPlacementApplications = () =>
  api.get("/placements/applications").then((res) => res.data);

export const listMyPlacementApplications = () =>
  api.get("/placements/applications/me").then((res) => res.data);

export const createPlacementApplication = (data) =>
  api.post("/placements/applications", data).then((res) => res.data);

export const listPlacementOpportunities = () =>
  api.get("/placements/opportunities").then((res) => res.data);

export const createPlacementOpportunity = (data) =>
  api.post("/placements/opportunities", data).then((res) => res.data);
