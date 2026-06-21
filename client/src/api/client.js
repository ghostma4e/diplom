const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  register: (username, password) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  login: (username, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getMe: () => apiRequest('/auth/me'),

  getProfileStats: () => apiRequest('/profile/stats'),

  getAvatarPresets: () => apiRequest('/profile/presets'),

  updateAvatar: (avatarUrl) =>
    apiRequest('/profile/avatar', {
      method: 'PATCH',
      body: JSON.stringify({ avatarUrl }),
    }),

  getMyParticipations: () => apiRequest('/events/my/participations'),

  participateEvent: (id) =>
    apiRequest(`/events/${id}/participate`, { method: 'POST' }),

  getEventSubmissions: (eventId) => apiRequest(`/events/${eventId}/submissions`),

  getStats: () => apiRequest('/dashboard/stats'),

  getLeaderboard: () => apiRequest('/dashboard/leaderboard'),

  getTeams: () => apiRequest('/teams'),

  getMyTeam: () => apiRequest('/teams/my'),

  createTeam: (teamName) =>
    apiRequest('/teams', {
      method: 'POST',
      body: JSON.stringify({ teamName }),
    }),

  joinTeam: (inviteCode) =>
    apiRequest('/teams/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    }),

  updateTeamScore: (teamId, score) =>
    apiRequest(`/teams/${teamId}/score`, {
      method: 'PATCH',
      body: JSON.stringify({ score }),
    }),

  disbandTeam: () => apiRequest('/teams/my', { method: 'DELETE' }),

  getEvents: () => apiRequest('/events'),

  createEvent: (payload) =>
    apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteEvent: (id) => apiRequest(`/events/${id}`, { method: 'DELETE' }),

  getProjects: (techFilter) => {
    const query = techFilter?.length ? `?tech=${encodeURIComponent(techFilter.join(','))}` : '';
    return apiRequest(`/projects${query}`);
  },

  getTechTags: () => apiRequest('/projects/tech-tags'),

  createProject: (payload) =>
    apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  linkProjectToEvent: (projectId, eventId) =>
    apiRequest(`/projects/${projectId}/event`, {
      method: 'PATCH',
      body: JSON.stringify({ eventId: eventId || null }),
    }),

  rateProject: (projectId, payload) =>
    apiRequest(`/projects/${projectId}/rating`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
