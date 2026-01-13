'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Users, Plus, Edit, Trash2, UserPlus } from 'lucide-react'

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', leadId: '' })
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [showMembersView, setShowMembersView] = useState(false)
  const [viewingTeam, setViewingTeam] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [teamsData, usersData] = await Promise.all([api.getTeams(), api.getUsers()])
      setTeams(teamsData)
      setUsers(usersData)
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
      if (editingTeam) {
        const updated = await api.updateTeam(editingTeam.id, formData)
        setTeams(teams.map(t => t.id === editingTeam.id ? updated : t))
      } else {
        const newTeam = await api.createTeam(formData)
        setTeams([newTeam, ...teams])
      }
      setShowModal(false)
      setFormData({ name: '', leadId: '' })
      setEditingTeam(null)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this team?')) return
    setActionLoading(true)
    try {
      await api.deleteTeam(id)
      setTeams(teams.filter(t => t.id !== id))
    } catch (error: any) {
      alert(error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddMember = async (teamId: string) => {
    setSelectedTeamId(teamId)
    setShowMemberModal(true)
  }

  const getAvailableUsers = () => {
    const currentTeam = teams.find(t => t.id === selectedTeamId)
    if (!currentTeam) return []
    
    const teamMemberIds = currentTeam.members?.map((m: any) => m.id) || []
    const teamLeadId = currentTeam.leadId
    
    return users.filter(u => 
      !u.teamId && 
      !teamMemberIds.includes(u.id) && 
      u.id !== teamLeadId
    )
  }

  const handleViewMembers = (team: any) => {
    setViewingTeam(team)
    setShowMembersView(true)
  }

  const handleMemberSubmit = async () => {
    if (selectedUserIds.length === 0) return
    setActionLoading(true)
    try {
      await Promise.all(selectedUserIds.map(userId => api.addTeamMember(selectedTeamId, userId)))
      const updatedTeams = await api.getTeams()
      const updatedUsers = await api.getUsers()
      setTeams(updatedTeams)
      setUsers(updatedUsers)
      setShowMemberModal(false)
      setSelectedUserIds([])
      setSelectedTeamId('')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-sm text-gray-500">Manage teams and team leads</p>
        </div>
        <button onClick={() => { setShowModal(true); setEditingTeam(null); setFormData({ name: '', leadId: '' }) }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Team
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div key={team.id} className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{team.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{team.members?.length || 0} members • {team._count?.projects || 0} projects</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingTeam(team); setFormData({ name: team.name, leadId: team.leadId || '' }); setShowModal(true) }} className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
                <button onClick={() => handleDelete(team.id)} className="rounded-lg p-2 hover:bg-red-50 transition-colors">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
            {team.lead && (
              <div className="mb-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Team Lead</p>
                <p className="text-sm font-semibold text-gray-900">{team.lead.fullName || team.lead.email}</p>
              </div>
            )}
            {team.members && team.members.length > 0 && (
              <div className="mb-3">
                <button onClick={() => handleViewMembers(team)} className="w-full text-left rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-3 border border-purple-100 hover:shadow-md transition-all">
                  <p className="text-xs font-medium text-purple-600 mb-2">Team Members ({team.members.length})</p>
                  <div className="flex -space-x-2">
                    {team.members.slice(0, 5).map((member: any, idx: number) => (
                      <div key={idx} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                        {(member.fullName || member.email).charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {team.members.length > 5 && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white shadow-sm">
                        +{team.members.length - 5}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            )}
            <button onClick={() => handleAddMember(team.id)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-600 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all">
              <UserPlus className="h-4 w-4" /> Add Member
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">{editingTeam ? 'Edit Team' : 'New Team'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Team Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium">Team Lead</label>
                <select value={formData.leadId} onChange={(e) => setFormData({ ...formData, leadId: e.target.value })} className="mt-1 w-full rounded border px-3 py-2">
                  <option value="">No Lead</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.fullName || user.email}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={actionLoading} className="flex-1 rounded bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50">{actionLoading ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setShowModal(false)} disabled={actionLoading} className="flex-1 rounded border px-4 py-2 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="mb-4 text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Add Team Members</h2>
            <p className="text-sm text-gray-500 mb-6">Select one or more users to add to the team</p>
            <div className="space-y-2 mb-6">
              {getAvailableUsers().length > 0 ? (
                getAvailableUsers().map((user) => (
                  <button
                    key={user.id}
                    onClick={() => toggleUserSelection(user.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selectedUserIds.includes(user.id)
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${
                      selectedUserIds.includes(user.id)
                        ? 'bg-gradient-to-br from-primary to-primary/80'
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      {(user.fullName || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900">{user.fullName || 'No Name'}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    {selectedUserIds.includes(user.id) && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No available users to add</p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={handleMemberSubmit} disabled={actionLoading || selectedUserIds.length === 0} className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-4 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {actionLoading ? 'Adding...' : `Add ${selectedUserIds.length} Member${selectedUserIds.length !== 1 ? 's' : ''}`}
              </button>
              <button onClick={() => { setShowMemberModal(false); setSelectedUserIds([]); setSelectedTeamId('') }} disabled={actionLoading} className="flex-1 rounded-xl border-2 border-gray-300 px-4 py-3 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showMembersView && viewingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{viewingTeam.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{viewingTeam.members?.length || 0} team members</p>
              </div>
              <button onClick={() => { setShowMembersView(false); setViewingTeam(null) }} className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3">
              {viewingTeam.members && viewingTeam.members.length > 0 ? (
                viewingTeam.members.map((member: any) => (
                  <div key={member.id} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md transition-all border border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                      {(member.fullName || member.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{member.fullName || 'No Name'}</h3>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{member.role}</span>
                        {member.id === viewingTeam.leadId && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Team Lead</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No members in this team yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
