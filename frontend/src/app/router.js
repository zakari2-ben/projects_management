import { Fragment, jsx } from "react/jsx-runtime";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import ProjectDetailsPage from "../pages/ProjectDetailsPage";
import ProjectsPage from "../pages/ProjectsPage";
import RegisterPage from "../pages/RegisterPage";
import TaskDetailsPage from "../pages/TaskDetailsPage";
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-6", children: "Loading..." });
  }
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/login", replace: true });
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-6", children: "Loading..." });
  }
  if (isAuthenticated) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/dashboard", replace: true });
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}
const router = createBrowserRouter([
  { path: "/", element: /* @__PURE__ */ jsx(Navigate, { to: "/dashboard", replace: true }) },
  {
    path: "/login",
    element: /* @__PURE__ */ jsx(GuestRoute, { children: /* @__PURE__ */ jsx(LoginPage, {}) })
  },
  {
    path: "/register",
    element: /* @__PURE__ */ jsx(GuestRoute, { children: /* @__PURE__ */ jsx(RegisterPage, {}) })
  },
  {
    path: "/dashboard",
    element: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(DashboardPage, {}) })
  },
  {
    path: "/projects",
    element: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(ProjectsPage, {}) })
  },
  {
    path: "/projects/:projectId",
    element: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(ProjectDetailsPage, {}) })
  },
  {
    path: "/projects/:projectId/tasks/:taskId",
    element: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(TaskDetailsPage, {}) })
  }
]);
export {
  router
};
