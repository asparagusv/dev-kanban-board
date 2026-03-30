import type { Task, TaskStatus } from '../types';

const validStatuses: TaskStatus[] = ['todo', 'in-progress', 'done'];

export function isTaskArray(data: unknown): data is Task[] {
    if (!Array.isArray(data)) return false;

    return data.every((item) => {
        if (typeof item !== 'object' || item === null) return false;

        const t = item as Record<string, unknown>;

        return (
            typeof t.id === 'number' &&
            typeof t.title === 'string' &&
            validStatuses.includes(t.status as TaskStatus)
        );
    });
}