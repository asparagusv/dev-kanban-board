import { useState } from 'react';
import type { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';
import { Paper, Typography, Box, useTheme, Badge } from '@mui/material';

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
    const theme = useTheme();
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
        <Paper
            elevation={isDragOver ? 6 : 2}
            sx={{
                flex: '1 1 0',
                minWidth: 320,
                maxWidth: 400,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: isDragOver ? theme.palette.action.hover : theme.palette.background.paper,
                transition: 'background-color 0.2s, box-shadow 0.2s',
                p: 2,
                borderRadius: 2,
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }} >
                    {title}
                </Typography>
                {limit !== undefined && (
                    <Typography variant="body2" color={isFull ? 'error' : 'text.secondary'}>
                        {tasks.length} / {limit}
                    </Typography>
                )}
            </Box>

            {isFull && (
                <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
                    Limit reached
                </Typography>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, overflowY: 'auto' }}>
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} onDelete={onDelete} onMoveTaskArrow={onMoveTaskArrow} onUpdateTask={onUpdateTask} onDragStart={(e, task) => {
                        e.dataTransfer.setData('taskId', task.id.toString())
                    }}
                    />
                ))}
            </Box>
        </Paper>
    );
}

export default Column;