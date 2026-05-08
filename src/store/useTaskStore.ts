import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskStatus } from '../types';

interface TaskState {
    tasks: Task[];
    wipLimits: Partial<Record<TaskStatus, number>>;
    addTask: (title: string) => void;
    deleteTask: (taskId: number) => void;
    updateTask: (taskId: number, title: string) => void;
    moveTaskToStatus: (taskId: number, nextStatus: TaskStatus) => void;
    setTasks: (tasks: Task[]) => void;
}

const initialTasks: Task[] = [
    { id: 1, title: 'Reactの復習', status: 'todo' },
    { id: 2, title: 'Kanban UIを作る', status: 'in-progress' },
    { id: 3, title: 'Viteで起動確認', status: 'done' },
];

export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => {
            const canMoveTo = (nextStatus: TaskStatus) => {
                const state = get();
                const limit = state.wipLimits[nextStatus];
                if (limit === undefined) return true;

                const count = state.tasks.filter((t) => t.status === nextStatus).length;
                return count < limit;
            };
            return {
                tasks: initialTasks,
                wipLimits: {
                    'in-progress': 3,
                },
                addTask: (title: string) => {
                    const trimmedTitle = title.trim();
                    if (!trimmedTitle) return;

                    set((state) => ({
                        tasks: [
                            ...state.tasks,
                            {
                                id: Date.now(),
                                title: trimmedTitle,
                                status: 'todo',
                            },
                        ],
                    }));
                },
                deleteTask: (taskId: number) => {
                    set((state) => ({
                        tasks: state.tasks.filter((task) => task.id !== taskId),
                    }));
                },
                updateTask: (taskId: number, title: string) => {
                    set((state) => ({
                        tasks: state.tasks.map((task) =>
                            task.id === taskId ? { ...task, title } : task
                        ),
                    }));
                },
                moveTaskToStatus: (taskId: number, nextStatus: TaskStatus) => {
                    const state = get();
                    const currentTask = state.tasks.find((task) => task.id === taskId);
                    if (!currentTask) return;
                    if (currentTask.status === nextStatus) return;

                    if (!canMoveTo(nextStatus)) return;

                    set((state) => ({
                        tasks: state.tasks.map((task) =>
                            task.id === taskId ? { ...task, status: nextStatus } : task
                        ),
                    }));
                },
                setTasks: (tasks: Task[]) => {
                    set({ tasks });
                },
            }
        },
        {
            name: 'kanban-tasks',
        }
    )
);
