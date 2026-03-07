import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
function ProjectCard({ project }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-slate-900", children: project.name }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-600", children: project.description || "No description provided." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-3 text-xs text-slate-500", children: [
      "Invite code: ",
      project.invite_code
    ] }),
    /* @__PURE__ */ jsx(
      Link,
      {
        to: `/projects/${project.id}`,
        className: "mt-4 inline-block rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white",
        children: "Open project"
      }
    )
  ] });
}
export {
  ProjectCard as default
};
