'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'

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

export default function MyProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [projectData, myTasks, userData] = await Promise.all([
        api.getProject(params.id as string),
        api.getMyTasks(),
        api.getCurrentUser()
      ])
      setProject(projectData)
      setTasks(myTasks.filter((t: any) => t.projectId === params.id))
      setUser(userData)
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
    </div>
  )
}
