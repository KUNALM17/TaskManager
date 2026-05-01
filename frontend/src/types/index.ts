export interface User {
    id: string;
    name: string;
    email: string;
    roles: string[];
    token?: string;
}

export interface Project {
    id: number;
    name: string;
    description: string;
    owner: User;
    createdAt: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    dueDate: string;
    project: Project;
    assignee: User;
    createdAt: string;
}

export interface ProjectRequest {
    name: string;
    description: string;
}

export interface TaskRequest {
    title: string;
    description: string;
    dueDate: string;
    assigneeId?: string;
}