import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import * as projectsApi from "../api/projects.api";
import * as tasksApi from "../api/tasks.api";
const statuses = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" }
];
function TaskDetailsPage() {
  const { projectId, taskId } = useParams();
  const projectIdNumber = Number(projectId);
  const taskIdNumber = Number(taskId);
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("todo");
  const [assignedUserId, setAssignedUserId] = useState("");
  useEffect(() => {
    const load = async () => {
      try {
        const [taskData, memberData] = await Promise.all([
          tasksApi.getTask(projectIdNumber, taskIdNumber),
          projectsApi.getProjectMembers(projectIdNumber)
        ]);
        setTask(taskData);
        setMembers(memberData);
        setName(taskData.name);
        setDescription(taskData.description || "");
        setDueDate(taskData.due_date || "");
        setStatus(taskData.status);
        setAssignedUserId(taskData.assigned_user_id ? String(taskData.assigned_user_id) : "");
      } catch {
        toast.error("Could not load task");
      }
    };
    void load();
  }, [projectIdNumber, taskIdNumber]);
  const handleSave = async (event) => {
    event.preventDefault();
    try {
      const updated = await tasksApi.updateTask(projectIdNumber, taskIdNumber, {
        name,
        description,
        due_date: dueDate || void 0,
        status,
        assigned_user_id: assignedUserId ? Number(assignedUserId) : null
      });
      setTask(updated);
      toast.success("Task updated");
    } catch {
      toast.error("Could not update task");
    }
  };
  const handleDelete = async () => {
    if (!task) return;
    try {
      await tasksApi.deleteTask(projectIdNumber, task.id);
      toast.success("Task deleted");
      navigate(`/projects/${projectIdNumber}`);
    } catch {
      toast.error("Could not delete task");
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-3xl px-4 py-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-slate-900", children: "Task Details" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSave, className: "mt-5 space-y-3 rounded-xl bg-white p-5 shadow", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: name,
            onChange: (event) => setName(event.target.value),
            className: "w-full rounded-md border border-slate-300 px-3 py-2",
            required: true
          }
        ),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: description,
            onChange: (event) => setDescription(event.target.value),
            className: "w-full rounded-md border border-slate-300 px-3 py-2",
            rows: 4
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-3", children: [
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
            "select",
            {
              value: status,
              onChange: (event) => setStatus(event.target.value),
              className: "rounded-md border border-slate-300 px-3 py-2",
              children: statuses.map((statusItem) => /* @__PURE__ */ jsx("option", { value: statusItem.value, children: statusItem.label }, statusItem.value))
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
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("button", { type: "submit", className: "rounded-md bg-blue-600 px-3 py-2 text-white", children: "Save changes" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => void handleDelete(),
              className: "rounded-md border border-rose-300 px-3 py-2 text-rose-600",
              children: "Delete task"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  TaskDetailsPage as default
};
