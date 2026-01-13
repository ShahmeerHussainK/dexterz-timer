'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { FolderKanban, Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function ProjectsPage() {
  const [allProjects, setAllProjects] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [filter, setFilter] = useState<string>('ACTIVE')
  const [formData, setFormData] = useState({ name: '', description: '', color: '#3B82F6', teamId: '' })
  const [cache, setCache] = useState<Record<string, any[]>>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const teamsData = await api.getTeams()
      setTeams(teamsData)
      
      // Load all statuses and cache them
      const [active, completed] = await Promise.all([
        api.getProjects('ACTIVE'),
        api.getProjects('COMPLETED')
      ])
      
      setCache({
        ACTIVE: active,
        COMPLETED: completed
      })
      
      setAllProjects(active)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const projects = cache[filter] || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      if (editingProject) {
        const updated = await api.updateProject(editingProject.id, formData)
        // Update cache
        setCache({
          ...cache,
          [filter]: cache[filter].map(p => p.id === editingProject.id ? updated : p)
        })
      } else {
        const newProject = await api.createProject(formData)
        // Add to cache
        setCache({
          ...cache,
          ACTIVE: [newProject, ...(cache.ACTIVE || [])]
        })
      }
      setShowModal(false)
      setFormData({ name: '', description: '', color: '#3B82F6', teamId: '' })
      setEditingProject(null)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project? All tasks will be deleted.')) return
    setActionLoading(true)
    try {
      await api.deleteProject(id)
      // Update cache
      setCache({
        ...cache,
        [filter]: cache[filter].filter(p => p.id !== id)
      })
    } catch (error: any) {
      alert(error.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage projects and tasks</p>
        </div>
        <button onClick={() => { setShowModal(true); setEditingProject(null); setFormData({ name: '', description: '', color: '#3B82F6', teamId: '' }) }} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 py-2.5 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all">
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-gray-200">
        {['ACTIVE', 'COMPLETED'].map((status) => (
          <button 
            key={status} 
            onClick={() => setFilter(status)} 
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
            filter === status
              ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-md shadow-primary/30'
              : 'text-gray-600 hover:bg-gray-100'
          }`}>
            {status}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div key={project.id} className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-200">
            <Link href={`/dashboard/projects/${project.id}`} className="absolute inset-0 rounded-xl" />
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="rounded-xl p-3 shadow-sm" style={{ backgroundColor: `${project.color}15` }}>
                  <FolderKanban className="h-6 w-6" style={{ color: project.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg truncate">{project.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                      {project._count?.tasks || 0} tasks
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                      {project._count?.timeEntries || 0} entries
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                <button onClick={(e) => { e.stopPropagation(); setEditingProject(project); setFormData({ name: project.name, description: project.description || '', color: project.color, teamId: project.teamId || '' }); setShowModal(true) }} className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }} className="rounded-lg p-2 hover:bg-red-50 transition-colors">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
            {project.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3 relative z-0">{project.description}</p>
            )}
            {project.team && (
              <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-2 border border-purple-100 relative z-0">
                <p className="text-xs font-medium text-purple-700">Team: {project.team.name}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold">{editingProject ? 'Edit Project' : 'New Project'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="h-12 w-full rounded-lg border border-gray-300 cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                <select value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                  <option value="">No Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={actionLoading} className="flex-1 rounded-lg bg-gradient-to-r from-primary to-primary/90 px-4 py-2.5 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl transition-all disabled:opacity-50">{actionLoading ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setShowModal(false)} disabled={actionLoading} className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
