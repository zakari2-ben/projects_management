import { jsx, jsxs } from "react/jsx-runtime";
function Modal({
  open,
  title,
  onClose,
  children
}) {
  if (!open) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md rounded-xl bg-white p-5 shadow-lg", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: title }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "text-slate-500", children: "Close" })
    ] }),
    children
  ] }) });
}
export {
  Modal as default
};
