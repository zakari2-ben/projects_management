import { jsx, jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  return /* @__PURE__ */ jsx("nav", { className: "border-b border-slate-200 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx(Link, { to: "/dashboard", className: "font-semibold text-slate-900", children: "PM App" }),
      /* @__PURE__ */ jsx(Link, { to: "/projects", className: "text-sm text-slate-600", children: "Projects" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-500", children: user?.name }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: handleLogout,
          className: "rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white",
          children: "Logout"
        }
      )
    ] })
  ] }) });
}
export {
  Navbar as default
};
