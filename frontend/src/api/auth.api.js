import { api, initializeCsrf } from "./axios";
async function register(payload) {
  await initializeCsrf();
  const { data } = await api.post("/register", payload);
  return data;
}
async function login(payload) {
  await initializeCsrf();
  const { data } = await api.post("/login", payload);
  return data;
}
async function logout() {
  const { data } = await api.post("/logout");
  return data;
}
async function me() {
  const { data } = await api.get("/me");
  return data;
}
async function updateProfile(payload) {
  const { data } = await api.put("/profile", payload);
  return data;
}
async function updatePassword(payload) {
  const { data } = await api.put("/profile/password", payload);
  return data;
}
export {
  login,
  logout,
  me,
  register,
  updatePassword,
  updateProfile
};
