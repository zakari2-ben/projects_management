import { api } from "./axios";
async function getProjects() {
  const { data } = await api.get("/projects");
  return data.data;
}
async function getProject(projectId) {
  const { data } = await api.get(`/projects/${projectId}`);
  return data;
}
async function createProject(payload) {
  const { data } = await api.post("/projects", payload);
  return data.project;
}
async function updateProject(projectId, payload) {
  const { data } = await api.put(`/projects/${projectId}`, payload);
  return data.project;
}
async function deleteProject(projectId) {
  await api.delete(`/projects/${projectId}`);
}
async function joinProject(inviteCode) {
  const { data } = await api.post("/projects/join", {
    invite_code: inviteCode
  });
  return data.project;
}
async function getProjectMembers(projectId) {
  const { data } = await api.get(`/projects/${projectId}/users`);
  return data.data;
}
export {
  createProject,
  deleteProject,
  getProject,
  getProjectMembers,
  getProjects,
  joinProject,
  updateProject
};
