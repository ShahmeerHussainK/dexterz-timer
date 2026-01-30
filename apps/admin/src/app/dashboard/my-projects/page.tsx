'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { FolderKanban, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [myTasks, allProjects, currentUser] = await Promise.all([
        api.getMyTasks(),
        api.getProjects('ACTIVE'),
        api.getCurrentUser()
      ])
      setTasks(myTasks)

      // Show projects from user's team OR projects where user has tasks
      const taskProjectIds = [...new Set(myTasks.map((t: any) => t.projectId))]
      const myProjects = allProjects.filter((p: any) =>
        (currentUser.teamId && p.teamId === currentUser.teamId) || taskProjectIds.includes(p.id)
      )
      setProjects(myProjects)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Projects</h1>
        <p className="text-sm text-gray-500">Projects assigned to you</p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <FolderKanban className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No projects yet</h3>
          <p className="mt-2 text-sm text-gray-500">You haven't been assigned to any projects</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const projectTasks = tasks.filter((t: any) => t.projectId === project.id)
            const completedTasks = projectTasks.filter((t: any) => t.status === 'COMPLETED').length
            const totalTasks = projectTasks.length

            return (
              <Link key={project.id} href={`/dashboard/my-projects/${project.id}`} className="block rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2" style={{ backgroundColor: `${project.color}20` }}>
                    <FolderKanban className="h-5 w-5" style={{ color: project.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-xs text-gray-500">{totalTasks} tasks assigned</p>
                  </div>
                </div>
                {project.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{project.description}</p>
                )}
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">{completedTasks} completed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">{totalTasks - completedTasks} pending</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
