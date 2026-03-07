import { jsx, jsxs } from "react/jsx-runtime";
function EmptyState({ title, description }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-slate-900", children: title }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-600", children: description })
  ] });
}
export {
  EmptyState as default
};
