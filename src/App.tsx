import { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider, CssBaseline, Box, Typography, Button, TextField, AppBar, Toolbar, IconButton, Container } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import AddIcon from '@mui/icons-material/Add';
import { useTaskStore } from './store/useTaskStore';
import { useThemeStore } from './store/useThemeStore';
import { useAuthStore } from './store/useAuthStore';
import { isTaskArray } from './util/validators';
import { createAppTheme } from './theme';

const Column = lazy(() => import('./components/Column'));

function App() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth(); // ページ読み込み時にセッションを復元
  }, [checkAuth]);

  // 🎯 App はヘッダー操作に必要なアクションだけ個別に取得
  const addTask = useTaskStore((state) => state.addTask);
  const setTasks = useTaskStore((state) => state.setTasks);
  const tasks = useTaskStore((state) => state.tasks); // export 用

  const { darkMode, toggleDarkMode } = useThemeStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const theme = useMemo(() => createAppTheme(darkMode ? 'dark' : 'light'), [darkMode]);

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ProtectedRoute>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <AppBar position="static" color="default" elevation={1}>
            <Toolbar>
              <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                Dev Kanban Board
              </Typography>
              <IconButton onClick={toggleDarkMode} color="inherit" aria-label="toggle dark mode">
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

            {/* 🎯 Column に props でデータを渡す必要がなくなった！ */}
            <Suspense fallback={<Typography>Loading...</Typography>}>
              <Box sx={{ display: 'flex', gap: 3, flexGrow: 1, overflowX: 'auto', pb: 2 }}>
                <Column title="Todo" status="todo" />
                <Column title="In Progress" status="in-progress" />
                <Column title="Done" status="done" />
              </Box>
            </Suspense>
          </Container>
        </Box>
      </ProtectedRoute>
    </ThemeProvider>
  );
}

export default App;