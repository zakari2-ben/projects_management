import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
function DashboardPage() {
  const { user } = useAuth();
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-6xl px-4 py-6", children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-bold text-slate-900", children: [
        "Hello, ",
        user?.name
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-slate-600", children: "Manage your projects and tasks from one place." }),
      /* @__PURE__ */ jsx("div", { className: "mt-6 grid gap-4 md:grid-cols-2", children: /* @__PURE__ */ jsxs(Link, { to: "/projects", className: "rounded-xl bg-white p-5 shadow", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Projects" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Create, join, and manage project members." })
      ] }) })
    ] })
  ] });
}
export {
  DashboardPage as default
};
