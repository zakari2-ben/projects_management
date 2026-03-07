import { jsx, jsxs } from "react/jsx-runtime";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../context/AuthContext";
import { ProjectProvider } from "../context/ProjectContext";
function AppProviders({ children }) {
  return /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsxs(ProjectProvider, { children: [
    children,
    /* @__PURE__ */ jsx(Toaster, { position: "top-right" })
  ] }) });
}
export {
  AppProviders
};
