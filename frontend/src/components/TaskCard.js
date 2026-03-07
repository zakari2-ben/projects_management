import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
function TaskCard({ projectId, task }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-3", children: [
    /* @__PURE__ */ jsx("h4", { className: "font-medium text-slate-900", children: task.name }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-600", children: task.description || "No description" }),
    /* @__PURE__ */ jsxs("div", { className: "mt-2 text-xs text-slate-500", children: [
      "Due: ",
      task.due_date || "N/A",
      " | Assignee: ",
      task.assignee?.name || "Unassigned"
    ] }),
    /* @__PURE__ */ jsx(
      Link,
      {
        to: `/projects/${projectId}/tasks/${task.id}`,
        className: "mt-3 inline-block text-sm font-medium text-blue-600",
        children: "View details"
      }
    )
  ] });
}
export {
  TaskCard as default
};
