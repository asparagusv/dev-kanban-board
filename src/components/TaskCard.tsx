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
        <div
            className={`task-card${isEditing ? ' is-editing' : ''}`}
            draggable={!isEditing}
            onDragStart={!isEditing ? (e) => onDragStart(e, task) : undefined}
        >
            {isEditing ? (
                <>
                    <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave();
                            if (e.key === 'Escape') handleCancel();
                        }}
                        className="edit-input"
                    />
                    <div className="edit-actions">
                        <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
                        <button className="btn-save" onClick={handleSave}>Save</button>
                    </div>
                </>
            ) : (
                <>
                    <div className="task-title">{task.title}</div>
                    <div className="task-card-footer">
                        <div className="card-nav-buttons">
                            <button
                                className="icon-btn"
                                onClick={() => onMoveTaskArrow(task.id, 'left')}
                                disabled={task.status === 'todo'}
                                title="Move left"
                            >
                                ←
                            </button>
                            <button
                                className="icon-btn"
                                onClick={() => onMoveTaskArrow(task.id, 'right')}
                                disabled={task.status === 'done'}
                                title="Move right"
                            >
                                →
                            </button>
                        </div>
                        <div className="card-actions">
                            <button
                                className="icon-btn primary"
                                onClick={() => setIsEditing(true)}
                                title="Edit"
                            >
                                ✎
                            </button>
                            <button
                                className="icon-btn danger"
                                onClick={() => onDelete(task.id)}
                                title="Delete"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default TaskCard;
