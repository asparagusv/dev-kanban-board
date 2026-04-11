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

    const columnClass = [
        'column',
        `column-${status}`,
        isDragOver ? 'column-drag-over' : '',
    ].filter(Boolean).join(' ');

    const countLabel = limit !== undefined ? `${tasks.length}/${limit}` : `${tasks.length}`;

    return (
        <section
            className={columnClass}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="column-header">
                <div className="column-status-dot" />
                <h2 className="column-title">{title}</h2>
                <span className="column-count">{countLabel}</span>
            </div>

            {isFull && (
                <div className="wip-warning">WIP limit reached</div>
            )}

            <div className="task-list">
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onDelete={onDelete}
                        onMoveTaskArrow={onMoveTaskArrow}
                        onUpdateTask={onUpdateTask}
                        onDragStart={(e, t) => {
                            e.dataTransfer.setData('taskId', t.id.toString());
                        }}
                    />
                ))}
            </div>
        </section>
    );
}

export default Column;
