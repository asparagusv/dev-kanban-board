export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
    id: number;
    title: string;
    status: TaskStatus;
}

export const statusOrder: TaskStatus[] = ['todo', 'in-progress', 'done'];