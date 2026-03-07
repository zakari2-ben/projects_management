import { api } from "./axios";
async function getTasks(projectId) {
  const { data } = await api.get(`/projects/${projectId}/tasks`);
  return data.data;
}
async function getTask(projectId, taskId) {
  const { data } = await api.get(`/projects/${projectId}/tasks/${taskId}`);
  return data;
}
async function createTask(projectId, payload) {
  const { data } = await api.post(`/projects/${projectId}/tasks`, payload);
  return data.task;
}
async function updateTask(projectId, taskId, payload) {
  const { data } = await api.put(
    `/projects/${projectId}/tasks/${taskId}`,
    payload
  );
  return data.task;
}
async function updateTaskStatus(projectId, taskId, status) {
  const { data } = await api.patch(
    `/projects/${projectId}/tasks/${taskId}/status`,
    { status }
  );
  return data.task;
}
async function assignTask(projectId, taskId, assignedUserId) {
  const { data } = await api.patch(
    `/projects/${projectId}/tasks/${taskId}/assign`,
    { assigned_user_id: assignedUserId }
  );
  return data.task;
}
async function deleteTask(projectId, taskId) {
  await api.delete(`/projects/${projectId}/tasks/${taskId}`);
}
export {
  assignTask,
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask,
  updateTaskStatus
};
