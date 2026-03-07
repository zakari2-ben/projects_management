import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import { useProjects } from "../context/ProjectContext";
function ProjectsPage() {
  const { projects, loading, fetchProjects, createProject, joinProject } = useProjects();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isJoinOpen, setJoinOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);
  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      await createProject(name, description);
      toast.success("Project created");
      setName("");
      setDescription("");
      setCreateOpen(false);
    } catch {
      toast.error("Could not create project");
    }
  };
  const handleJoin = async (event) => {
    event.preventDefault();
    try {
      await joinProject(inviteCode);
      toast.success("Joined project");
      setInviteCode("");
      setJoinOpen(false);
    } catch {
      toast.error("Invalid invite code");
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-6xl px-4 py-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-slate-900", children: "Projects" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setJoinOpen(true),
              className: "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
              children: "Join project"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setCreateOpen(true),
              className: "rounded-md bg-blue-600 px-3 py-2 text-sm text-white",
              children: "New project"
            }
          )
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsx("p", { className: "mt-6", children: "Loading..." }) : null,
      !loading && projects.length === 0 ? /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(EmptyState, { title: "No projects yet", description: "Create or join a project to start." }) }) : null,
      /* @__PURE__ */ jsx("div", { className: "mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: projects.map((project) => /* @__PURE__ */ jsx(ProjectCard, { project }, project.id)) })
    ] }),
    /* @__PURE__ */ jsx(Modal, { open: isCreateOpen, title: "Create project", onClose: () => setCreateOpen(false), children: /* @__PURE__ */ jsxs("form", { onSubmit: handleCreate, className: "space-y-3", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: name,
          onChange: (event) => setName(event.target.value),
          placeholder: "Project name",
          className: "w-full rounded-md border border-slate-300 px-3 py-2",
          required: true
        }
      ),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: description,
          onChange: (event) => setDescription(event.target.value),
          placeholder: "Description",
          className: "w-full rounded-md border border-slate-300 px-3 py-2",
          rows: 3
        }
      ),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "rounded-md bg-blue-600 px-3 py-2 text-white", children: "Create" })
    ] }) }),
    /* @__PURE__ */ jsx(Modal, { open: isJoinOpen, title: "Join project", onClose: () => setJoinOpen(false), children: /* @__PURE__ */ jsxs("form", { onSubmit: handleJoin, className: "space-y-3", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: inviteCode,
          onChange: (event) => setInviteCode(event.target.value),
          placeholder: "Invite code",
          className: "w-full rounded-md border border-slate-300 px-3 py-2 uppercase",
          required: true
        }
      ),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "rounded-md bg-blue-600 px-3 py-2 text-white", children: "Join" })
    ] }) })
  ] });
}
export {
  ProjectsPage as default
};
