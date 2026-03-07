import { jsx } from "react/jsx-runtime";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AppProviders } from "./app/providers";
createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsx(
    StrictMode, 
    { children: /* @__PURE__ */ jsx(
      AppProviders, { children: /* @__PURE__ */ jsx(App, {}) }
    ) }
  )
);
