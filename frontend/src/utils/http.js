import axios from "axios";
function getApiErrorMessage(error, fallback) {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }
  const response = error.response?.data;
  if (!response) {
    return fallback;
  }
  const firstFieldErrors = response.errors ? Object.values(response.errors)[0] : void 0;
  const firstFieldMessage = firstFieldErrors?.[0];
  return firstFieldMessage || response.message || fallback;
}
export {
  getApiErrorMessage
};
