import { useMemo } from 'react';
import type { Task, TaskStatus } from '../types';
import { statusOrder } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { isTaskArray } from '../util/validators';

const initialTasks: Task[] = [
    { id: 1, title: 'Reactの復習', status: 'todo' },
    { id: 2, title: 'Kanban UIを作る', status: 'in-progress' },
    { id: 3, title: 'Viteで起動確認', status: 'done' },
];

const WIP_LIMITS: Partial<Record<TaskStatus, number>> = {
    'in-progress': 3,
};

export function useTasks() {
    const [tasks, setTasks] = useLocalStorage<Task[]>(
        'kanban-tasks',
        initialTasks,
        isTaskArray
    );

    const todoTasks = useMemo(
        () => tasks.filter((task) => task.status === 'todo'),
        [tasks]
    );

    const inProgressTasks = useMemo(
        () => tasks.filter((task) => task.status === 'in-progress'),
        [tasks]
    );

    const doneTasks = useMemo(
        () => tasks.filter((task) => task.status === 'done'),
        [tasks]
    );

    const addTask = (title: string) => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) return;

        setTasks((prev) => [
            ...prev,
            {
                id: Date.now(),
                title: trimmedTitle,
                status: 'todo',
            },
        ]);
    };

    const deleteTask = (taskId: number) => {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
    };

    const updateTask = (taskId: number, title: string) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId ? { ...task, title } : task
            )
        );
    };

    const canMoveToStatus = (prevTasks: Task[], nextStatus: TaskStatus) => {
        const limit = WIP_LIMITS[nextStatus];
        if (limit === undefined) return true;

        const count = prevTasks.filter((task) => task.status === nextStatus).length;
        return count < limit;
    };

    const moveTaskToStatus = (taskId: number, nextStatus: TaskStatus) => {
        setTasks((prev) => {
            const currentTask = prev.find((task) => task.id === taskId);
            if (!currentTask) return prev;
            if (currentTask.status === nextStatus) return prev;
            if (!canMoveToStatus(prev, nextStatus)) return prev;

            return prev.map((task) =>
                task.id === taskId ? { ...task, status: nextStatus } : task
            );
        });
    };

    const moveTaskArrow = (taskId: number, direction: 'left' | 'right') => {
        setTasks((prev) =>
            prev.map((task) => {
                if (task.id !== taskId) return task;

                const currentIndex = statusOrder.indexOf(task.status);
                const nextIndex =
                    direction === 'left' ? currentIndex - 1 : currentIndex + 1;

                if (nextIndex < 0 || nextIndex >= statusOrder.length) return task;

                const nextStatus = statusOrder[nextIndex];
                if (!canMoveToStatus(prev, nextStatus)) return task;

                return { ...task, status: nextStatus };
            })
        );
    };

    const importTasks = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                if (typeof text !== 'string') return;

                const parsed = JSON.parse(text);

                if (!isTaskArray(parsed)) {
                    alert('Invalid task format');
                    return;
                }

                setTasks(parsed);
            } catch {
                alert('Invalid JSON file');
            }
        };

        reader.readAsText(file);

        e.target.value = '';
    };

    const exportTasks = () => {
        const json = JSON.stringify(tasks, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return {
        tasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        addTask,
        deleteTask,
        updateTask,
        moveTaskArrow,
        moveTaskToStatus,
        importTasks,
        exportTasks,
        wipLimits: WIP_LIMITS,
    } as const;
}