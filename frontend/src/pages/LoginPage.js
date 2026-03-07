import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/http";
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Invalid credentials"));
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto mt-20 max-w-md rounded-xl bg-white p-6 shadow", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-slate-900", children: "Login" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "mt-5 space-y-3", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "email",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          placeholder: "Email",
          className: "w-full rounded-md border border-slate-300 px-3 py-2",
          required: true
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "password",
          value: password,
          onChange: (e) => setPassword(e.target.value),
          placeholder: "Password",
          className: "w-full rounded-md border border-slate-300 px-3 py-2",
          required: true
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: submitting,
          className: "w-full rounded-md bg-blue-600 px-3 py-2 text-white disabled:opacity-60",
          children: submitting ? "Loading..." : "Login"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mt-4 text-sm text-slate-600", children: [
      "No account?",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/register", className: "text-blue-600", children: "Register" })
    ] })
  ] });
}
export {
  LoginPage as default
};
