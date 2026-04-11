import './App.css';
import { useState, lazy, Suspense } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTasks } from './hooks/useTasks';

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

  return (
    <div className={darkMode ? 'app dark' : 'app light'}>
      <div className="app-content">
        <div className="app-header">
          <h1 className="app-title">Dev Kanban Board</h1>

          <button
            className="header-btn"
            onClick={() => setDarkMode((prev) => !prev)}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          <button
            className="header-btn"
            onClick={exportTasks}
          >
            Export
          </button>

          <label className="header-btn">
            Import
            <input
              type="file"
              accept="application/json"
              onChange={(e) => importTasks(e)}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div className="add-task-form">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTask(newTaskTitle);
                setNewTaskTitle('');
              }
            }}
            placeholder="New task title..."
            className="task-input"
          />
          <button
            onClick={() => { addTask(newTaskTitle); setNewTaskTitle(''); }}
            className="add-task-button"
          >
            Add
          </button>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <div className="board">
            <Column title="Todo" status="todo" limit={wipLimits['todo']} tasks={todoTasks} onDelete={deleteTask} onMoveTaskArrow={moveTaskArrow} onMoveTaskDrag={moveTaskToStatus} onUpdateTask={updateTask} />
            <Column title="In Progress" status="in-progress" limit={wipLimits['in-progress']} tasks={inProgressTasks} onDelete={deleteTask} onMoveTaskArrow={moveTaskArrow} onMoveTaskDrag={moveTaskToStatus} onUpdateTask={updateTask} />
            <Column title="Done" status="done" limit={wipLimits['done']} tasks={doneTasks} onDelete={deleteTask} onMoveTaskArrow={moveTaskArrow} onMoveTaskDrag={moveTaskToStatus} onUpdateTask={updateTask} />
          </div>
        </Suspense>
      </div>
    </div>
  );
}

export default App;