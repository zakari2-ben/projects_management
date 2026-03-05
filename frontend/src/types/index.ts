export type User = {
  id: number
  name: string
  email: string
}

export type Project = {
  id: number
  name: string
  description: string | null
  invite_code: string
  created_by: number
  owner?: User
  members?: User[]
  tasks_count?: number
}

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type Task = {
  id: number
  project_id: number
  name: string
  description: string | null
  status: TaskStatus
  due_date: string | null
  assigned_user_id: number | null
  created_by: number
  assignee?: User | null
  creator?: User
}
