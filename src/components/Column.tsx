import { useState, useMemo } from 'react';
import type { TaskStatus } from '../types';
import TaskCard from './TaskCard';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import { useTaskStore } from '../store/useTaskStore';

interface ColumnProps {
    title: string;
    status: TaskStatus;
}

function Column({ title, status }: ColumnProps) {
    const theme = useTheme();
    const [isDragOver, setIsDragOver] = useState(false);

    // state.tasks は参照が安定（tasks が変わらない限り同じ配列）→ useShallow 不要
    const tasks = useTaskStore((state) => state.tasks);
    // tasks が変わった時だけ filter → 結果の参照も安定 → 無駄な再レンダリングなし
    const filteredTasks = useMemo(
        () => tasks.filter((t) => t.status === status),
        [tasks, status]
    );
    const limit = useTaskStore((state) => state.wipLimits[status]);
    const moveTaskToStatus = useTaskStore((state) => state.moveTaskToStatus);

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
        moveTaskToStatus(taskId, status);
    };

    const isFull = limit !== undefined && filteredTasks.length >= limit;

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
                        {filteredTasks.length} / {limit}
                    </Typography>
                )}
            </Box>

            {isFull && (
                <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
                    Limit reached
                </Typography>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, overflowY: 'auto' }}>
                {filteredTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </Box>
        </Paper>
    );
}

export default Column;