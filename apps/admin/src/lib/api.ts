const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
    }
    return this.token
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      
      if (response.status === 401 && !endpoint.includes('change-password')) {
        this.clearToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
      
      throw new Error(error.message || 'Request failed')
    }

    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ accessToken: string; refreshToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    )
    this.setToken(data.accessToken)
    return data
  }

  async register(data: {
    email: string
    password: string
    fullName: string
    orgName: string
  }) {
    const response = await this.request<{ accessToken: string; refreshToken: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
    this.setToken(response.accessToken)
    return response
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' })
    this.clearToken()
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me')
  }

  // Users
  async getUsers() {
    return this.request<any[]>('/users')
  }

  async getUser(id: string) {
    return this.request<any>(`/users/${id}`)
  }

  async createUser(data: any) {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateUser(id: string, data: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id: string) {
    return this.request<void>(`/users/${id}`, { method: 'DELETE' })
  }

  // Reports
  async getDailyReport(date?: string) {
    const query = date ? `?date=${date}` : ''
    return this.request<any>(`/reports/daily${query}`)
  }

  async getWeeklyReport(week?: string) {
    const query = week ? `?week=${week}` : ''
    return this.request<any>(`/reports/weekly${query}`)
  }

  async getMonthlyReport(month?: string) {
    const query = month ? `?month=${month}` : ''
    return this.request<any>(`/reports/monthly${query}`)
  }

  async getUserTimesheet(userId: string, from: string, to: string) {
    return this.request<any>(`/reports/timesheet?userId=${userId}&from=${from}&to=${to}`)
  }

  async getActivityRate(userId: string, from: string, to: string) {
    return this.request<{ activityRate: number; totalActiveSeconds: number; totalSampleSeconds: number }>(
      `/reports/activity-rate?userId=${userId}&from=${from}&to=${to}`
    )
  }

  // Organization
  async getOrganization() {
    return this.request<any>('/organizations/me')
  }

  async updateOrganization(data: any) {
    return this.request<any>('/organizations/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getSchedule() {
    return this.request<any>('/organizations/schedule')
  }

  async updateSchedule(data: any) {
    return this.request<any>('/organizations/schedule', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async createAdjustment(data: any) {
    return this.request<any>('/organizations/adjustments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getAdjustments(userId: string, from?: string, to?: string) {
    let query = `?userId=${userId}`
    if (from) query += `&from=${from}`
    if (to) query += `&to=${to}`
    return this.request<any[]>(`/organizations/adjustments${query}`)
  }

  async getMyTodayStats() {
    return this.request<{ activeMinutes: number; idleMinutes: number }>('/reports/my-today')
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  async resetUserPassword(userId: string, newPassword: string) {
    return this.request<{ message: string }>(`/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    })
  }

  // Teams
  async getTeams() {
    return this.request<any[]>('/teams')
  }

  async getTeam(id: string) {
    return this.request<any>(`/teams/${id}`)
  }

  async createTeam(data: { name: string; leadId?: string }) {
    return this.request<any>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTeam(id: string, data: { name?: string; leadId?: string }) {
    return this.request<any>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTeam(id: string) {
    return this.request<void>(`/teams/${id}`, { method: 'DELETE' })
  }

  async addTeamMember(teamId: string, userId: string) {
    return this.request<any>(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  }

  async removeTeamMember(userId: string) {
    return this.request<void>(`/teams/members/${userId}`, { method: 'DELETE' })
  }

  // Projects
  async getProjects(status?: string) {
    const query = status ? `?status=${status}` : ''
    return this.request<any[]>(`/projects${query}`)
  }

  async getProject(id: string) {
    return this.request<any>(`/projects/${id}`)
  }

  async createProject(data: { name: string; description?: string; color?: string; teamId?: string }) {
    return this.request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProject(id: string, data: any) {
    return this.request<any>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProject(id: string) {
    return this.request<void>(`/projects/${id}`, { method: 'DELETE' })
  }

  // Tasks
  async getTasks(projectId?: string) {
    const query = projectId ? `?projectId=${projectId}` : ''
    return this.request<any[]>(`/tasks${query}`)
  }

  async getMyTasks() {
    return this.request<any[]>('/tasks/my-tasks')
  }

  async getProjectTasks(projectId: string) {
    return this.request<any[]>(`/tasks/project/${projectId}`)
  }

  async getTask(id: string) {
    return this.request<any>(`/tasks/${id}`)
  }

  async createTask(data: { title: string; description?: string; projectId: string; assignedTo?: string; priority?: string; dueDate?: Date }) {
    return this.request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTask(id: string, data: any) {
    return this.request<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTask(id: string) {
    return this.request<void>(`/tasks/${id}`, { method: 'DELETE' })
  }

  // Screenshots
  async getScreenshots(userId: string, date?: string) {
    const query = date ? `?userId=${userId}&date=${date}` : `?userId=${userId}`
    return this.request<any[]>(`/screenshots${query}`)
  }

  async deleteScreenshot(id: number) {
    return this.request<void>(`/screenshots/${id}`, { method: 'DELETE' })
  }

  async getActiveUsers() {
    return this.request<any[]>('/activity/active-users')
  }

  // Manual Time
  async createManualTimeRequest(data: { startTime: string; endTime: string; minutes: number; reason: string; type: string }) {
    return this.request<any>('/manual-time/request', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getMyManualTimeRequests() {
    return this.request<any[]>('/manual-time/my-requests')
  }

  async getPendingManualTimeRequests() {
    return this.request<any[]>('/manual-time/pending')
  }

  async reviewManualTimeRequest(id: string, status: string, reviewNote?: string) {
    return this.request<any>(`/manual-time/review/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewNote }),
    })
  }

  async addManualTime(data: { userId: string; startTime: string; endTime: string; minutes: number; reason: string; type: string }) {
    return this.request<any>('/manual-time/add', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getUserManualTimeRequests(userId: string, status?: string) {
    const query = status ? `?status=${status}` : ''
    return this.request<any[]>(`/manual-time/user/${userId}${query}`)
  }
}
export const api = new ApiClient()
