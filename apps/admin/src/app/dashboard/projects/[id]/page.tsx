'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'

const statusIcons = {
  TODO: Circle,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle2,
  BLOCKED: AlertCircle,
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', assignedTo: '', priority: 'MEDIUM', dueDate: '' })

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [projectData, tasksData, usersData] = await Promise.all([
        api.getProject(params.id as string),
        api.getProjectTasks(params.id as string),
        api.getUsers()
      ])
      setProject(projectData)
      setTasks(tasksData)
      
      // Filter users: only show team members if project has a team
      if (projectData.teamId && projectData.team?.members) {
        setUsers(projectData.team.members)
      } else {
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const taskData: any = {
        title: formData.title,
        description: formData.description,
        projectId: params.id as string,
        assignedTo: formData.assignedTo || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
      }
      const newTask = await api.createTask(taskData)
      setTasks([...tasks, newTask])
      setShowModal(false)
      setFormData({ title: '', description: '', assignedTo: '', priority: 'MEDIUM', dueDate: '' })
    } catch (error: any) {
      alert(error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleStatusChange = async (taskId: string, status: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t))
    try {
      await api.updateTask(taskId, { status })
    } catch (error: any) {
      alert(error.message)
      loadData()
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div></div>
  }

  const groupedTasks = {
    TODO: tasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    COMPLETED: tasks.filter(t => t.status === 'COMPLETED'),
    BLOCKED: tasks.filter(t => t.status === 'BLOCKED'),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{project?.name}</h1>
          {project?.description && <p className="text-sm text-gray-500">{project.description}</p>}
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Task
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(groupedTasks).map(([status, statusTasks]) => {
          const Icon = statusIcons[status as keyof typeof statusIcons]
          return (
            <div key={status} className="rounded-lg border bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Icon className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold">{status.replace('_', ' ')}</h3>
                <span className="ml-auto rounded-full bg-gray-200 px-2 py-0.5 text-xs">{statusTasks.length}</span>
              </div>
              <div className="space-y-2">
                {statusTasks.map((task) => (
                  <div key={task.id} className="rounded-lg border bg-white p-3 shadow-sm">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    {task.description && <p className="mt-1 text-xs text-gray-500 line-clamp-2">{task.description}</p>}
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                        {task.priority}
                      </span>
                      {task.assignee && (
                        <span className="text-xs text-gray-500">{task.assignee.fullName || task.assignee.email}</span>
                      )}
                    </div>
                    <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)} className="mt-2 w-full rounded border px-2 py-1 text-xs">
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="BLOCKED">Blocked</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium">Assign To</label>
                <select value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} className="mt-1 w-full rounded border px-3 py-2">
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.fullName || user.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Priority</label>
                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="mt-1 w-full rounded border px-3 py-2">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Due Date</label>
                <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={actionLoading} className="flex-1 rounded bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50">{actionLoading ? 'Creating...' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)} disabled={actionLoading} className="flex-1 rounded border px-4 py-2 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
