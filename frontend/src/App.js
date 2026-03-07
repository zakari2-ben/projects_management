import { jsx } from "react/jsx-runtime";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
function App() {
  return /* @__PURE__ */ jsx(RouterProvider, { router });
}
export {
  App as default
};
