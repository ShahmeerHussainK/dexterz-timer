'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { CheckCircle2, Circle, Clock, AlertCircle, Plus } from 'lucide-react'

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

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', projectId: '', priority: 'MEDIUM' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [myTasks, allProjects] = await Promise.all([
        api.getMyTasks(),
        api.getProjects('ACTIVE')
      ])
      setTasks(myTasks)
      setProjects(allProjects)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createTask(formData)
      setShowModal(false)
      setFormData({ title: '', description: '', projectId: '', priority: 'MEDIUM' })
      loadData()
    } catch (error: any) {
      alert(error.message)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-sm text-gray-500">Tasks assigned to you</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Personal Task
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
                    </div>
                    {task.project && (
                      <div className="mt-2 rounded bg-gray-50 p-2">
                        <p className="text-xs text-gray-600">{task.project.name}</p>
                      </div>
                    )}
                    {task.dueDate && (
                      <p className="mt-2 text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    )}
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
            <h2 className="mb-4 text-xl font-bold">Add Personal Task</h2>
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
                <label className="block text-sm font-medium">Project</label>
                <select value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" required>
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
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
              <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded bg-primary px-4 py-2 text-white hover:bg-primary/90">Create</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded border px-4 py-2 hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
