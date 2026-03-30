import type { Task } from '../types';
import { useState } from 'react';

interface TaskCardProps {
    task: Task;
    onDelete: (id: number) => void;
    onMoveTaskArrow: (id: number, direction: 'left' | 'right') => void;
    onUpdateTask: (id: number, title: string) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
}

function TaskCard({ task, onDelete, onMoveTaskArrow, onUpdateTask, onDragStart }: TaskCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(task.title);

    const handleSave = () => {
        const trimmed = editValue.trim();
        if (!trimmed) return;

        onUpdateTask(task.id, trimmed);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(task.title);
        setIsEditing(false);
    };

    return (
        <div className="task-card" draggable onDragStart={(e) => onDragStart(e, task)}>
            {isEditing ? (
                <>
                    <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="task-input"
                    />

                    <div className="task-card-actions">
                        <button className="move-button" onClick={handleSave}>
                            Save
                        </button>
                        <button className="move-button" onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="task-card-header">
                        <span>{task.title}</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                className="move-button"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit
                            </button>
                            <button
                                className="delete-button"
                                onClick={() => onDelete(task.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                    <div className="task-card-actions">
                        <button
                            className="move-button"
                            onClick={() => onMoveTaskArrow(task.id, 'left')}
                            disabled={task.status === 'todo'}
                        >
                            ←
                        </button>

                        <button
                            className="move-button"
                            onClick={() => onMoveTaskArrow(task.id, 'right')}
                            disabled={task.status === 'done'}
                        >
                            →
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
export default TaskCard;