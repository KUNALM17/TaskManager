import api from './axios';
import type { Project, Task, ProjectRequest, TaskRequest } from '../types';

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
    updateStatus: async (taskId: number, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
        const response = await api.put<Task>(`/tasks/${taskId}/status`, null, { params: { status } });
        return response.data;
    }
};