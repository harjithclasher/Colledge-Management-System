import { api } from "../lib/api-client";

export const listPeers = (skill) =>
  api
    .get("/peer/profiles", { params: skill ? { skill } : {} })
    .then((res) => res.data);

export const createPeerProfile = (data) =>
  api.post("/peer/profiles", data).then((res) => res.data);

