import { useState } from 'react';
import type { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';

interface ColumnProps {
    title: string;
    status: TaskStatus;
    limit?: number;
    tasks: Task[];
    onDelete: (id: number) => void;
    onMoveTaskArrow: (id: number, direction: 'left' | 'right') => void;
    onMoveTaskDrag: (id: number, targetStatus: TaskStatus) => void;
    onUpdateTask: (id: number, title: string) => void;
}

function Column({ title, status, limit, tasks, onDelete, onMoveTaskArrow, onMoveTaskDrag, onUpdateTask }: ColumnProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const taskId = parseInt(e.dataTransfer.getData('taskId'), 10);
        onMoveTaskDrag(taskId, status);
    };

    const isFull = limit !== undefined && tasks.length >= limit;

    return (
        <section className={isDragOver ? 'column column-drag-over' : 'column'} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e)}>
            <h2 className="column-title">
                {title}
                {limit !== undefined && (
                    <span style={{ marginLeft: 8, fontSize: 12 }}>
                        ({tasks.length}/{limit})
                    </span>
                )}
            </h2>

            {isFull && (
                <div style={{ fontSize: 12, color: 'red', marginBottom: 8 }}>
                    Limit reached
                </div>
            )}

            <div className="task-list">
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} onDelete={onDelete} onMoveTaskArrow={onMoveTaskArrow} onUpdateTask={onUpdateTask} onDragStart={(e, task) => {
                        e.dataTransfer.setData('taskId', task.id.toString())
                    }}
                    />
                ))}
            </div>
        </section>
    );
}

export default Column;