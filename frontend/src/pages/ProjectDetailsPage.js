import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import * as projectsApi from "../api/projects.api";
import * as tasksApi from "../api/tasks.api";
const columns = [
  { key: "todo", title: "To Do" },
  { key: "in_progress", title: "In Progress" },
  { key: "done", title: "Done" }
];
function ProjectDetailsPage() {
  const { projectId } = useParams();
  const id = Number(projectId);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const groupedTasks = useMemo(() => {
    return {
      todo: tasks.filter((task) => task.status === "todo"),
      in_progress: tasks.filter((task) => task.status === "in_progress"),
      done: tasks.filter((task) => task.status === "done")
    };
  }, [tasks]);
  useEffect(() => {
    const load = async () => {
      try {
        const [projectData, memberData, taskData] = await Promise.all([
          projectsApi.getProject(id),
          projectsApi.getProjectMembers(id),
          tasksApi.getTasks(id)
        ]);
        setProject(projectData);
        setMembers(memberData);
        setTasks(taskData);
      } catch {
        toast.error("Could not load project details");
      }
    };
    void load();
  }, [id]);
  const handleCreateTask = async (event) => {
    event.preventDefault();
    try {
      const newTask = await tasksApi.createTask(id, {
        name,
        description,
        due_date: dueDate || void 0,
        assigned_user_id: assignedUserId ? Number(assignedUserId) : null
      });
      setTasks((prev) => [newTask, ...prev]);
      setName("");
      setDescription("");
      setDueDate("");
      setAssignedUserId("");
      toast.success("Task created");
    } catch {
      toast.error("Could not create task");
    }
  };
  const quickMove = async (task, status) => {
    try {
      const updated = await tasksApi.updateTaskStatus(id, task.id, status);
      setTasks((prev) => prev.map((item) => item.id === task.id ? updated : item));
    } catch {
      toast.error("Could not update task status");
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-7xl px-4 py-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: project?.name || "Project" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-600", children: project?.description || "No description" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
        "Invite code: ",
        project?.invite_code
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mt-6 rounded-xl bg-white p-4 shadow", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Create task" }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleCreateTask, className: "mt-3 grid gap-3 md:grid-cols-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: name,
              onChange: (event) => setName(event.target.value),
              placeholder: "Task name",
              className: "rounded-md border border-slate-300 px-3 py-2",
              required: true
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: dueDate,
              onChange: (event) => setDueDate(event.target.value),
              className: "rounded-md border border-slate-300 px-3 py-2"
            }
          ),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: description,
              onChange: (event) => setDescription(event.target.value),
              placeholder: "Description",
              className: "rounded-md border border-slate-300 px-3 py-2 md:col-span-2",
              rows: 3
            }
          ),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: assignedUserId,
              onChange: (event) => setAssignedUserId(event.target.value),
              className: "rounded-md border border-slate-300 px-3 py-2",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Unassigned" }),
                members.map((member) => /* @__PURE__ */ jsx("option", { value: member.id, children: member.name }, member.id))
              ]
            }
          ),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "rounded-md bg-blue-600 px-3 py-2 text-white", children: "Create task" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("section", { className: "mt-6 grid gap-4 md:grid-cols-3", children: columns.map((column) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-slate-100 p-3", children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-3 font-semibold text-slate-900", children: column.title }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: groupedTasks[column.key].map((task) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(TaskCard, { projectId: id, task }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 flex gap-1", children: columns.filter((item) => item.key !== task.status).map((target) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => void quickMove(task, target.key),
              className: "rounded border border-slate-300 bg-white px-2 py-1 text-xs",
              children: [
                "Move to ",
                target.title
              ]
            },
            target.key
          )) })
        ] }, task.id)) })
      ] }, column.key)) })
    ] })
  ] });
}
export {
  ProjectDetailsPage as default
};
