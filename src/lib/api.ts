import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const auth = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  register: async (userData: any) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  }
};

// Users API
export const users = {
  getAll: async () => {
    const { data } = await api.get('/users');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
  update: async (id: string, userData: any) => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  }
};

// Students API
export const students = {
  getAll: async () => {
    const { data } = await api.get('/students');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/students/${id}`);
    return data;
  },
  create: async (studentData: any) => {
    const { data } = await api.post('/students', studentData);
    return data;
  },
  update: async (id: string, studentData: any) => {
    const { data } = await api.put(`/students/${id}`, studentData);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/students/${id}`);
    return data;
  }
};

// Teachers API
export const teachers = {
  getAll: async () => {
    const { data } = await api.get('/teachers');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/teachers/${id}`);
    return data;
  },
  create: async (teacherData: any) => {
    const { data } = await api.post('/teachers', teacherData);
    return data;
  },
  update: async (id: string, teacherData: any) => {
    const { data } = await api.put(`/teachers/${id}`, teacherData);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/teachers/${id}`);
    return data;
  }
};

// Courses API
export const courses = {
  getAll: async () => {
    const { data } = await api.get('/courses');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/courses/${id}`);
    return data;
  },
  create: async (courseData: any) => {
    const { data } = await api.post('/courses', courseData);
    return data;
  },
  update: async (id: string, courseData: any) => {
    const { data } = await api.put(`/courses/${id}`, courseData);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/courses/${id}`);
    return data;
  },
  addStudent: async (courseId: string, studentId: string) => {
    const { data } = await api.post(`/courses/${courseId}/students/${studentId}`);
    return data;
  },
  removeStudent: async (courseId: string, studentId: string) => {
    const { data } = await api.delete(`/courses/${courseId}/students/${studentId}`);
    return data;
  }
};

// Grades API
export const grades = {
  getAll: async () => {
    const { data } = await api.get('/grades');
    return data;
  },
  getByStudent: async (studentId: string) => {
    const { data } = await api.get(`/grades/student/${studentId}`);
    return data;
  },
  getByCourse: async (courseId: string) => {
    const { data } = await api.get(`/grades/course/${courseId}`);
    return data;
  },
  create: async (gradeData: any) => {
    const { data } = await api.post('/grades', gradeData);
    return data;
  },
  update: async (id: string, gradeData: any) => {
    const { data } = await api.put(`/grades/${id}`, gradeData);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/grades/${id}`);
    return data;
  }
};

// Events API
export const events = {
  getAll: async () => {
    const { data } = await api.get('/events');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/events/${id}`);
    return data;
  },
  create: async (eventData: any) => {
    const { data } = await api.post('/events', eventData);
    return data;
  },
  update: async (id: string, eventData: any) => {
    const { data } = await api.put(`/events/${id}`, eventData);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/events/${id}`);
    return data;
  },
  register: async (id: string) => {
    const { data } = await api.post(`/events/${id}/register`);
    return data;
  },
  cancelRegistration: async (id: string) => {
    const { data } = await api.post(`/events/${id}/cancel`);
    return data;
  }
};

// Announcements API
export const announcements = {
  getAll: async () => {
    const { data } = await api.get('/announcements');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/announcements/${id}`);
    return data;
  },
  create: async (announcementData: any) => {
    const { data } = await api.post('/announcements', announcementData);
    return data;
  },
  update: async (id: string, announcementData: any) => {
    const { data } = await api.put(`/announcements/${id}`, announcementData);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/announcements/${id}`);
    return data;
  },
  markAsRead: async (id: string) => {
    const { data } = await api.post(`/announcements/${id}/read`);
    return data;
  }
};

export default {
  auth,
  users,
  students,
  teachers,
  courses,
  grades,
  events,
  announcements
};