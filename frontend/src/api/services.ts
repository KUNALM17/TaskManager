import api from './axios';
import type { Project, Task, ProjectRequest, TaskRequest, UserSummary } from '../types';

export const projectService = {
    getAll: async () => {
        const response = await api.get<Project[]>('/projects');
        return response.data;
    },
    create: async (data: ProjectRequest) => {
        const response = await api.post<Project>('/projects', data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/projects/${id}`);
    }
};

export const taskService = {
    getAll: async () => {
        const response = await api.get<Task[]>('/tasks');
        return response.data;
    },
    getByProject: async (projectId: number) => {
        const response = await api.get<Task[]>(`/tasks/project/${projectId}`);
        return response.data;
    },
    getMyTasks: async () => {
        const response = await api.get<Task[]>('/tasks/me');
        return response.data;
    },
    create: async (projectId: number, data: TaskRequest) => {
        const response = await api.post<Task>(`/tasks/project/${projectId}`, data);
        return response.data;
    },
    createStandalone: async (data: TaskRequest) => {
        const response = await api.post<Task>('/tasks', data);
        return response.data;
    },
    update: async (taskId: number, data: TaskRequest) => {
        const response = await api.put<Task>(`/tasks/${taskId}`, data);
        return response.data;
    },
    delete: async (taskId: number) => {
        await api.delete(`/tasks/${taskId}`);
    },
    updateStatus: async (taskId: number, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
        const response = await api.put<Task>(`/tasks/${taskId}/status`, null, { params: { status } });
        return response.data;
    },
    updateChecklistItem: async (taskId: number, itemId: number, data: { completed?: boolean; title?: string }) => {
        const response = await api.put<Task>(`/tasks/${taskId}/checklist/${itemId}`, null, { params: data });
        return response.data;
    },
    deleteChecklistItem: async (taskId: number, itemId: number) => {
        const response = await api.delete<Task>(`/tasks/${taskId}/checklist/${itemId}`);
        return response.data;
    },
    exportCsv: async () => {
        const response = await api.get('/tasks/export', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'tasks_report.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};

export const userService = {
    getAll: async () => {
        const response = await api.get<UserSummary[]>('/users');
        return response.data;
    },
    updateRole: async (userId: string, role: string) => {
        const response = await api.put<UserSummary>(`/users/${userId}/role`, null, { params: { role } });
        return response.data;
    },
    delete: async (userId: string) => {
        await api.delete(`/users/${userId}`);
    }
};

