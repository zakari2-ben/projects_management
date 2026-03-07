import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/http";
function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await register(name, email, password, passwordConfirmation);
      toast.success("Account created");
      navigate("/dashboard");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not register"));
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto mt-16 max-w-md rounded-xl bg-white p-6 shadow", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-slate-900", children: "Register" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "mt-5 space-y-3", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: name,
          onChange: (e) => setName(e.target.value),
          placeholder: "Name",
          className: "w-full rounded-md border border-slate-300 px-3 py-2",
          required: true
        }
      ),
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
        "input",
        {
          type: "password",
          value: passwordConfirmation,
          onChange: (e) => setPasswordConfirmation(e.target.value),
          placeholder: "Password confirmation",
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
          children: submitting ? "Loading..." : "Create account"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mt-4 text-sm text-slate-600", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-blue-600", children: "Login" })
    ] })
  ] });
}
export {
  RegisterPage as default
};
