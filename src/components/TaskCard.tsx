import type { Task } from '../types';
import { useState } from 'react';
import { Card, CardContent, Typography, IconButton, TextField, Box, Button, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { statusOrder } from '../types';
import { useTaskStore } from '../store/useTaskStore';

interface TaskCardProps {
    task: Task;
}

function TaskCard({ task }: TaskCardProps) {
    // 🎯 アクション関数は安定した参照 → 個別に取得するだけで OK
    const deleteTask = useTaskStore((state) => state.deleteTask);
    const moveTaskToStatus = useTaskStore((state) => state.moveTaskToStatus);
    const updateTask = useTaskStore((state) => state.updateTask);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(task.title);

    const handleSave = () => {
        const trimmed = editValue.trim();
        if (!trimmed) return;

        updateTask(task.id, trimmed);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(task.title);
        setIsEditing(false);
    };

    const onClickArrow = (direction: 'left' | 'right') => {
        const currentIndex = statusOrder.indexOf(task.status);
        const nextIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

        if (nextIndex < 0 || nextIndex >= statusOrder.length) return;

        const nextStatus = statusOrder[nextIndex];

        moveTaskToStatus(task.id, nextStatus);
    }

    return (
        <Card
            draggable
            onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                e.dataTransfer.setData('taskId', task.id.toString());
            }}
            sx={{
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 4 }
            }}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {isEditing ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <TextField
                            size="small"
                            fullWidth
                            variant="outlined"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave();
                                if (e.key === 'Escape') handleCancel();
                            }}
                            autoFocus
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button size="small" variant="text" color="error" startIcon={<CancelIcon />} onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                                Save
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="body1" sx={{ wordBreak: 'break-word', mt: 0.5 }}>
                                {task.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0 }}>
                                <Tooltip title="Edit task">
                                    <IconButton size="small" onClick={() => setIsEditing(true)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete task">
                                    <IconButton size="small" color="error" onClick={() => deleteTask(task.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <IconButton
                                size="small"
                                onClick={() => onClickArrow('left')}
                                disabled={task.status === 'todo'}
                                color="primary"
                            >
                                <ArrowBackIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => onClickArrow('right')}
                                disabled={task.status === 'done'}
                                color="primary"
                            >
                                <ArrowForwardIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

export default TaskCard;