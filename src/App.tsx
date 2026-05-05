import { useState, lazy, Suspense, useMemo } from 'react';
import { ThemeProvider, CssBaseline, Box, Typography, Button, TextField, AppBar, Toolbar, IconButton, Container } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import AddIcon from '@mui/icons-material/Add';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTasks } from './hooks/useTasks';
import { createAppTheme } from './theme';

const Column = lazy(() => import('./components/Column'));

function App() {
  const {
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
    wipLimits,
  } = useTasks();
  
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('kanban-dark-mode', true);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const theme = useMemo(() => createAppTheme(darkMode ? 'dark' : 'light'), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Dev Kanban Board
            </Typography>
            <IconButton onClick={() => setDarkMode((prev) => !prev)} color="inherit" aria-label="toggle dark mode">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Button startIcon={<DownloadIcon />} onClick={exportTasks} color="inherit">
              Export
            </Button>
            <Button component="label" startIcon={<UploadIcon />} color="inherit">
              Import
              <input type="file" accept="application/json" onChange={(e) => importTasks(e)} hidden />
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Add a new task"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTaskTitle.trim()) {
                  addTask(newTaskTitle);
                  setNewTaskTitle('');
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                if (newTaskTitle.trim()) {
                  addTask(newTaskTitle);
                  setNewTaskTitle('');
                }
              }}
              sx={{ px: 4 }}
            >
              Add
            </Button>
          </Box>

          <Suspense fallback={<Typography>Loading...</Typography>}>
            <Box sx={{ display: 'flex', gap: 3, flexGrow: 1, overflowX: 'auto', pb: 2 }}>
              <Column title="Todo" status="todo" limit={wipLimits['todo']} tasks={todoTasks} onDelete={deleteTask} onMoveTaskArrow={moveTaskArrow} onMoveTaskDrag={moveTaskToStatus} onUpdateTask={updateTask} />
              <Column title="In Progress" status="in-progress" limit={wipLimits['in-progress']} tasks={inProgressTasks} onDelete={deleteTask} onMoveTaskArrow={moveTaskArrow} onMoveTaskDrag={moveTaskToStatus} onUpdateTask={updateTask} />
              <Column title="Done" status="done" limit={wipLimits['done']} tasks={doneTasks} onDelete={deleteTask} onMoveTaskArrow={moveTaskArrow} onMoveTaskDrag={moveTaskToStatus} onUpdateTask={updateTask} />
            </Box>
          </Suspense>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;