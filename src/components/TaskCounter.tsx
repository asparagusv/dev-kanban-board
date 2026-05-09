import { useTasks } from '../hooks/useTasks';

/**
 * 🧪 実験用コンポーネント
 * useTasks() を子コンポーネントから直接呼んで、
 * App の state と同期しないことを確認する
 */
export default function TaskCounter() {
    const { todoTasks, inProgressTasks, doneTasks, addTask } = useTasks();

    return (
        <div
            style={{
                border: '2px dashed #ff6b6b',
                borderRadius: '8px',
                padding: '16px',
                margin: '16px 0',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
            }}
        >
            <h3 style={{ margin: '0 0 8px', color: '#ff6b6b' }}>
                🧪 実験: 子コンポーネントから useTasks() を直接呼んだ場合
            </h3>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#aaa' }}>
                ↓ この state は App の state とは別物です
            </p>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                <span>Todo: {todoTasks.length}</span>
                <span>In Progress: {inProgressTasks.length}</span>
                <span>Done: {doneTasks.length}</span>
            </div>
            <button
                onClick={() => addTask('子コンポーネントから追加したタスク')}
                style={{
                    padding: '4px 12px',
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                ここからタスクを追加（App側には反映されない）
            </button>
        </div>
    );
}
