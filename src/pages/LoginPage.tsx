import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuthStore } from '../store/useAuthStore';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Box sx={{ bgcolor: 'primary.main', borderRadius: '50%', p: 1, display: 'flex' }}>
          <LockOutlinedIcon sx={{ color: 'white' }} />
        </Box>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Dev Kanban Board</Typography>
        <Typography variant="body2" color="text.secondary">サインインしてください</Typography>
        {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="メールアドレス" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required autoFocus />
          <TextField label="パスワード" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required />
          <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading} sx={{ mt: 1 }}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ログイン'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}