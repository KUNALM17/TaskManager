export type User = {
    id: string;
    name: string;
    email: string;
    role?: 'ROLE_ADMIN' | 'ROLE_USER';
    roles: string[];
    token?: string;
};

export type UserSummary = {
    id: string;
    name: string;
    email: string;
    role: 'ROLE_ADMIN' | 'ROLE_USER';
};

export type Attachment = {
    id: number;
    name: string;
    url: string;
};

export type Project = {
    id: number;
    name: string;
    description: string;
    owner: UserSummary;
    createdAt: string;
};

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type Task = {
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    project: Project;
    assignees: UserSummary[];
    checklist: ChecklistItem[];
    attachments: Attachment[];
    createdAt: string;
};

export interface ChecklistItem {
    id?: number;
    title: string;
    completed: boolean;
}

export interface ProjectRequest {
    name: string;
    description: string;
}

export interface TaskRequest {
    title: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    projectId?: number;
    assigneeIds: string[];
    checklist: ChecklistItem[];
    attachments: Attachment[];
}

